'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Upload, Search, Play, Download, Trash2, FileText, Image as ImageIcon, Video as VideoIcon, RefreshCw, X } from 'lucide-react'
import Uppy from '@uppy/core'
import dynamic from 'next/dynamic'
import Image from 'next/image'
const UppyDashboardModal = dynamic(
  () => import('@uppy/react').then((mod: any) => mod.DashboardModal),
  { ssr: false }
) as any;
import AwsS3 from '@uppy/aws-s3'
import '@uppy/core/css/style.min.css'
import '@uppy/dashboard/css/style.min.css'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { apiClient } from '@/lib/apiClientClient'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'

interface MediaAsset {
  id: string
  title: string
  assetType: 'VIDEO' | 'IMAGE' | 'PDF' | 'DOCUMENT'
  mediaCategory: 'RAW' | 'BROLL' | 'FINAL_EDIT' | 'TRAINING' | 'SOP' | 'GENERAL'
  status: string
  createdAt: string
  viewUrl?: string
  uploadedBy: {
    name: string
  }
}

export default function MediaVaultPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'all' | 'bin'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const { confirm, modal } = useConfirmDelete()
  
  const safeFormatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return 'N/A'
      return format(d, 'MMM d, yyyy • HH:mm')
    } catch (e) {
      return 'N/A'
    }
  }
  
  const fetchAssets = useCallback(async () => {
    try {
      setIsLoading(true)
      const query = new URLSearchParams({
        ...(filterType !== 'all' ? { assetType: filterType } : {}),
        ...(searchQuery ? { search: searchQuery } : {}),
        ...(viewMode === 'bin' ? { showDeleted: 'true' } : {})
      })
      const result = await apiClient(`/api/media?${query.toString()}`);
      if (result && (result.data || Array.isArray(result))) {
        setAssets(Array.isArray(result) ? result : (result.data || []))
      } else {
        setAssets([])
      }
    } catch (error) {
      toast.error('Failed to load media vault')
    } finally {
      setIsLoading(false)
    }
  }, [filterType, searchQuery, viewMode])

  // Use a ref for fetchAssets to avoid Uppy re-initialization
  const fetchAssetsRef = useRef(fetchAssets)
  useEffect(() => {
    fetchAssetsRef.current = fetchAssets
  }, [fetchAssets])
  const [uppy, setUppy] = useState<Uppy | null>(null)

  useEffect(() => {
    const u = new Uppy({
      id: 'media-vault',
      autoProceed: false,
      restrictions: {
        maxFileSize: 1024 * 1024 * 500, // 500MB
        allowedFileTypes: ['image/*', 'video/*']
      },
      meta: { mediaCategory: 'GENERAL' }
    })

    u.use(AwsS3, {
      shouldUseMultipart: true,
      getUploadParameters: async (file: any) => {
        const assetType = file.type?.startsWith('image/') ? 'IMAGE' : 'VIDEO';
        const response = await apiClient('/api/media/initiate-upload', {
          method: 'POST',
          body: JSON.stringify({
            title: file.meta.title || file.name,
            fileName: file.name,
            fileType: file.type || 'application/octet-stream',
            fileSizeBytes: file.size,
            assetType,
            mediaCategory: file.meta.mediaCategory || 'GENERAL',
            description: file.meta.description || ''
          })
        });
        
        if (!response?.assetId) {
          throw new Error('Failed to initiate upload: No asset ID returned');
        }
        
        u.setFileMeta(file.id, { assetId: response.assetId });

        return { 
          uploadId: response.uploadId, 
          key: response.key, 
          assetId: response.assetId 
        };
      },
      signPart: async (_file: any, { uploadId, key, partNumber }: any) => {
        const response = await apiClient(`/api/media/upload-url?key=${encodeURIComponent(key)}&uploadId=${uploadId}&partNumber=${partNumber}`);
        return { url: response.url };
      },
      listParts: async (_file: any, { uploadId, key }: any) => {
        const response = await apiClient(`/api/media/list-parts?key=${encodeURIComponent(key)}&uploadId=${uploadId}`);
        return response;
      },
      abortMultipartUpload: async (_file: any, { uploadId, key }: any) => {
        await apiClient(`/api/media/abort-upload`, {
          method: 'POST',
          body: JSON.stringify({ uploadId, key })
        });
      },
      completeMultipartUpload: async (file: any, { uploadId, key, parts }: any) => {
        const assetId = file.meta.assetId;
        const response = await apiClient(`/api/media/complete-upload`, {
          method: 'POST',
          body: JSON.stringify({ uploadId, key, parts, assetId })
        });
        
        await apiClient(`/api/media/${assetId}/confirm`, {
          method: 'POST',
          body: JSON.stringify({ key, fileSizeBytes: file.size })
        });

        fetchAssetsRef.current();
        return response;
      }
    })

    setUppy(u)

    return () => {
      u.close()
    }
  }, [])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const handleDelete = async (id: string) => {
    try {
      await apiClient(`/api/media/${id}`, { method: 'DELETE' })
      toast.success('Asset moved to bin')
      fetchAssets()
    } catch (error) {
      toast.error('Failed to move asset to bin')
      throw error // Re-throw for hook to handle
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await apiClient(`/api/media/${id}/restore`, { method: 'POST' })
      toast.success('Asset restored')
      fetchAssets()
    } catch (error) {
      toast.error('Restore failed')
    }
  }

  const handleBulkDelete = async (permanent = false) => {
    try {
      await apiClient(`/api/media/bulk-delete`, {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds, permanent })
      })
      toast.success(permanent ? 'Assets permanently deleted' : 'Assets moved to bin')
      setSelectedIds([])
      fetchAssets()
    } catch (error) {
      toast.error('Bulk action failed')
    }
  }

  const handleBulkRestore = async () => {
    try {
      await apiClient(`/api/media/bulk-restore`, {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds })
      })
      toast.success('Assets restored')
      setSelectedIds([])
      fetchAssets()
    } catch (error) {
      toast.error('Bulk restore failed')
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAssets.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredAssets.map(a => a.id))
    }
  }

  const handlePermanentDelete = async (id: string) => {
    try {
      await apiClient(`/api/media/${id}?permanent=true`, { method: 'DELETE' })
      toast.success('Asset permanently deleted')
      fetchAssets()
    } catch (error) {
      toast.error('Permanent delete failed')
      throw error // Re-throw for hook to handle
    }
  }

  const handleDownload = async (id: string) => {
    try {
      const response = await apiClient(`/api/media/${id}/download-url`)
      if (!response?.downloadUrl) throw new Error('No download URL returned')
      
      const { downloadUrl, filename } = response
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const filteredAssets = (assets || []).filter(asset => {
    const title = asset?.title || 'Untitled'
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || asset.assetType === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Media Vault
          </h1>
          <p className="text-slate-500">Secure repository for Havenly Solution&apos;s visual assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'all' ? 'bin' : 'all')}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
              viewMode === 'bin' 
                ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm shadow-amber-500/10" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            <Trash2 className="w-5 h-5" />
            <span className="font-semibold">{viewMode === 'bin' ? 'View All' : 'Open Bin'}</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <Upload className="w-5 h-5" />
            <span className="font-semibold">Upload Media</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search assets by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="md:col-span-4 flex items-center gap-4 bg-white border border-slate-200 p-1 rounded-xl">
          {['all', 'VIDEO', 'IMAGE', 'PDF', 'DOCUMENT'].map((type) => (
            <button
              key={type}
              onClick={() => { setFilterType(type); setSelectedIds([]); }}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                filterType === type ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {filteredAssets.length > 0 && (
        <div className="flex items-center gap-4 px-2">
          <button 
            onClick={toggleSelectAll}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {selectedIds.length === filteredAssets.length ? 'Deselect All' : 'Select All'}
          </button>
          {selectedIds.length > 0 && (
            <span className="text-sm text-slate-500 font-medium">
              {selectedIds.length} items selected
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => {
            if (!asset?.id) return null
            return (
            <div 
              key={asset.id} 
              onClick={() => toggleSelect(asset.id)}
              className={cn(
                "group relative bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer",
                selectedIds.includes(asset.id) ? "ring-2 ring-blue-500 border-transparent bg-blue-50/30" : "border-slate-200 hover:border-b-blue-500 border-b-4 border-b-transparent hover:-translate-y-1"
              )}
            >
              <div className="aspect-video bg-slate-900 flex items-center justify-center relative overflow-hidden">
                {asset.assetType === 'IMAGE' && asset.viewUrl ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={asset.viewUrl} 
                      alt={asset.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.srcset = '';
                        target.src = 'https://placehold.co/600x400/0f172a/64748b?text=Image+Unavailable';
                      }}
                    />
                  </div>
                ) : asset.assetType === 'VIDEO' && asset.viewUrl ? (
                  <video 
                    src={asset.viewUrl.startsWith('http') ? `${asset.viewUrl}#t=0.1` : asset.viewUrl} 
                    preload="metadata"
                    muted
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    {asset.assetType === 'VIDEO' && <VideoIcon className="w-12 h-12 text-blue-400/50" />}
                    {asset.assetType === 'IMAGE' && <ImageIcon className="w-12 h-12 text-emerald-400/50" />}
                    {asset.assetType === 'PDF' && <FileText className="w-12 h-12 text-rose-400/50" />}
                    {asset.assetType === 'DOCUMENT' && <FileText className="w-12 h-12 text-slate-400/50" />}
                  </div>
                )}
                
                {viewMode === 'bin' && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-md shadow-lg shadow-amber-500/20 uppercase tracking-tighter">
                    In Bin
                  </div>
                )}

                {/* Checkbox indicator */}
                <div className={cn(
                  "absolute top-2 left-2 w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center",
                  selectedIds.includes(asset.id) ? "bg-blue-600 border-blue-600" : "bg-white/40 border-white/60 opacity-0 group-hover:opacity-100"
                )}>
                  {selectedIds.includes(asset.id) && <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in" />}
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
                  {viewMode === 'all' ? (
                    <>
                      <button 
                        onClick={() => setSelectedAsset(asset)} 
                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform scale-90 group-hover:scale-100"
                        title="View Fullscreen"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </button>
                      <button onClick={() => handleDownload(asset.id)} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform scale-90 group-hover:scale-100" title="Download">
                        <Download className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleRestore(asset.id)} 
                        className="p-3 bg-emerald-500/20 hover:bg-emerald-500/40 backdrop-blur-md rounded-full text-emerald-400 transition-all transform scale-90 group-hover:scale-100 border border-emerald-500/30"
                        title="Restore to Vault"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => confirm(
                          `PERMANENTLY Delete "${asset.title}"?`,
                          "This action is irreversible. The file will be purged from R2 storage and the database.",
                          () => handlePermanentDelete(asset.id),
                          "Delete Permanently"
                        )} 
                        className="p-3 bg-rose-500/20 hover:bg-rose-500/40 backdrop-blur-md rounded-full text-rose-400 transition-all transform scale-90 group-hover:scale-100 border border-rose-500/30"
                        title="Purge Permanently"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 truncate flex-1">{asset.title || 'Untitled'}</h3>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                    {asset.mediaCategory || 'GENERAL'}
                  </div>
                </div>
                <div className="flex flex-col text-[11px] text-slate-500 space-y-1 mt-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-slate-700">Uploaded by:</span>
                    <span>{asset.uploadedBy?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-slate-700">Timestamp:</span>
                    <span>{safeFormatDate(asset.createdAt || '')}</span>
                  </div>
                </div>
              </div>
              {viewMode === 'all' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    confirm(
                      `Move to Bin?`,
                      `Are you sure you want to move "${asset.title || 'this asset'}" to the bin? You can recover it later from the Bin view.`,
                      () => handleDelete(asset.id),
                      "Move to Bin"
                    )
                  }}
                  className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-rose-50 border border-slate-200 rounded-full text-slate-400 hover:text-rose-600 transition-all shadow-sm z-10 sm:opacity-0 sm:group-hover:opacity-100"
                  title="Move to Bin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
          <div className="p-4 bg-slate-50 rounded-full text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-medium">No assets found matching your criteria.</p>
          <button 
             onClick={() => { setSearchQuery(''); setFilterType('all'); }}
             className="text-blue-600 hover:underline text-sm font-semibold"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <button 
            onClick={() => setSelectedAsset(null)}
            title="Close Preview"
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-5xl w-full max-h-[85vh] flex flex-col gap-4">
            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
              {selectedAsset.assetType === 'IMAGE' ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={selectedAsset.viewUrl || ''} 
                    alt={selectedAsset.title} 
                    fill
                    className="object-contain" 
                  />
                </div>
              ) : selectedAsset.assetType === 'VIDEO' ? (
                <video src={selectedAsset.viewUrl} controls autoPlay className="w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  This file type cannot be previewed.
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">{selectedAsset.title}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-sm">
                  <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-blue-400 border border-blue-500/20">{selectedAsset.assetType}</span>
                  <span>•</span>
                  <span>{selectedAsset.mediaCategory}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-slate-500">Uploaded by</span>
                    <span className="text-white font-medium">{selectedAsset.uploadedBy?.name || 'Unknown'}</span>
                  </span>
                  <span>•</span>
                  <span>{safeFormatDate(selectedAsset.createdAt || '')}</span>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(selectedAsset.id)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {uppy && (
        <UppyDashboardModal
          uppy={uppy}
          open={isUploadModalOpen}
          onRequestClose={() => setIsUploadModalOpen(false)}
          proudlyDisplayPoweredByUppy={false}
          metaFields={[
            { id: 'title', name: 'Asset Title', placeholder: 'Give your asset a clear name' },
            { id: 'description', name: 'Description', placeholder: 'What is this media for?' },
            { 
              id: 'mediaCategory', 
              name: 'Category', 
              render: ({ value, onChange, fieldID }: any) => {
                return (
                  <select 
                    id={fieldID}
                    title="Select Media Category"
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="GENERAL">General</option>
                    <option value="RAW">Raw Footage</option>
                    <option value="BROLL">B-Roll</option>
                    <option value="FINAL_EDIT">Final Edit</option>
                    <option value="TRAINING">Training Material</option>
                    <option value="SOP">SOP Visual</option>
                  </select>
                )
              }
            }
          ]}
        />
      )}

      {modal}

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-center gap-6 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-blue-400">{selectedIds.length} Assets Selected</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Bulk Actions</span>
            </div>
            
            <div className="w-px h-8 bg-white/10" />
            
            <div className="flex items-center gap-3">
              {viewMode === 'all' ? (
                <button 
                  onClick={() => confirm(
                    `Move ${selectedIds.length} assets to Bin?`,
                    "They can be recovered later from the Bin view.",
                    () => handleBulkDelete(false),
                    "Move to Bin"
                  )}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all border border-rose-500/20 font-semibold text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Move to Bin
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleBulkRestore}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all border border-emerald-500/20 font-semibold text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restore Selected
                  </button>
                  <button 
                    onClick={() => confirm(
                      `Permanently delete ${selectedIds.length} assets?`,
                      "This action is irreversible and will purge all selected files from storage.",
                      () => handleBulkDelete(true),
                      "Delete Permanently"
                    )}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all shadow-lg shadow-rose-500/20 font-semibold text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Purge All
                  </button>
                </>
              )}
              
              <button 
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-sm font-semibold text-slate-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
