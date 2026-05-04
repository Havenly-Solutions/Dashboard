'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PenTool, Send, ChevronLeft, Image as ImageIcon, Link as LinkIcon, Bold, Italic, List } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { apiClient } from '@/lib/apiClient'

export default function StoryEditorPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('Tour Update')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const handleSave = useCallback(async () => {
    if (!title || isSaving) return
    setIsSaving(true)
    try {
      const isNew = id === 'new'
      const url = isNew 
        ? '/api/content/drafts'
        : `/api/content/drafts/${id}`
      
      const data = await apiClient(url, {
        method: isNew ? 'POST' : 'PATCH',
        body: JSON.stringify({ title, bodyMd: body, category }),
      })

      if (isNew && data.id) {
        router.replace(`/dashboard/broadcast/story-editor/${data.id}`)
      }
      
      setLastSaved(new Date())
      return data
    } catch (error) {
      console.error('Auto-save error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [title, body, category, id, isSaving, router])

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title || body) {
        handleSave()
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [title, body, handleSave])

  const handlePublish = async () => {
    if (!title || !body) {
      toast.error('Title and body are required to publish.')
      return
    }

    try {
      let currentId = id
      
      // If it's a new story, save it first to get an ID
      if (id === 'new') {
        const saved = await handleSave()
        if (!saved || !saved.id) {
          throw new Error('Failed to save story before publishing')
        }
        currentId = saved.id
      }

      await apiClient(`/api/content/${currentId}/publish`, {
        method: 'PATCH'
      })
      
      toast.success('Story published successfully!')
      router.push('/dashboard/broadcast')
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish story')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Editor Toolbar */}
      <header className="h-16 bg-white border-b border-[#DADCE0] px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard/broadcast')}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            title="Back to Broadcasts"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="h-6 w-[1px] bg-gray-200" />
          <h1 className="text-lg font-medium text-[#202124] flex items-center gap-2">
            <PenTool size={18} className="text-[#E63946]" />
            Story Editor
          </h1>
          <span className="text-xs text-gray-400 font-medium">
            {isSaving ? 'Saving...' : lastSaved ? `Last saved at ${format(lastSaved, 'HH:mm:ss')}` : 'Not saved'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
            <button 
              onClick={() => setIsPreviewMode(false)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                !isPreviewMode ? "bg-white shadow-sm text-[#E63946]" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Write
            </button>
            <button 
              onClick={() => setIsPreviewMode(true)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                isPreviewMode ? "bg-white shadow-sm text-[#E63946]" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Preview
            </button>
          </div>
          
          <button 
            onClick={handlePublish}
            className="bg-[#E63946] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#D62839] transition-all flex items-center gap-2 shadow-lg shadow-red-100"
          >
            <Send size={16} />
            Publish
          </button>
        </div>
      </header>

      {/* Editor Body */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Textarea */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isPreviewMode ? "hidden md:flex opacity-50" : "flex"
        )}>
          <div className="p-8 max-w-4xl mx-auto w-full flex-1 flex flex-col">
            <input 
              type="text"
              placeholder="Enter story title..."
              className="text-4xl font-display font-bold border-none focus:ring-0 bg-transparent placeholder-gray-200 text-[#1A1A2E] mb-6 w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <div className="flex gap-4 mb-4 text-gray-400 border-b border-gray-100 pb-2">
              <button title="Bold" className="hover:text-gray-600"><Bold size={18} /></button>
              <button title="Italic" className="hover:text-gray-600"><Italic size={18} /></button>
              <button title="List" className="hover:text-gray-600"><List size={18} /></button>
              <button title="Link" className="hover:text-gray-600"><LinkIcon size={18} /></button>
              <button title="Image" className="hover:text-gray-600"><ImageIcon size={18} /></button>
              <div className="flex-1" />
              <select 
                title="Select Category"
                className="text-xs bg-transparent border-none focus:ring-0 font-medium"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Tour Update</option>
                <option>Partner Spotlight</option>
                <option>Impact Story</option>
                <option>Technical Alert</option>
              </select>
            </div>

            <textarea 
              placeholder="Start writing your story in Markdown..."
              className="flex-1 w-full bg-transparent border-none focus:ring-0 resize-none font-mono text-[15px] leading-relaxed text-gray-700 placeholder-gray-200"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] bg-[#DADCE0] hidden md:block" />

        {/* Right Side: Preview */}
        <div className={cn(
          "flex-1 bg-white overflow-y-auto transition-all duration-300",
          isPreviewMode ? "flex" : "hidden md:flex"
        )}>
          <div className="p-12 max-w-4xl mx-auto w-full prose prose-red">
            {title && <h1 className="text-4xl font-display font-bold text-[#1A1A2E] mb-8">{title}</h1>}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {body || '*Preview will appear here...*'}
            </ReactMarkdown>
          </div>
        </div>
      </main>
    </div>
  )
}
