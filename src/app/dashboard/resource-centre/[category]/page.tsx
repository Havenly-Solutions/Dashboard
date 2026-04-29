'use client'
import { useParams, useRouter } from 'next/navigation'
import { RESOURCE_CATEGORIES } from '@/lib/resource-data'
import Header from '@/components/dashboard/Header'
import { ChevronLeft, Share2, Printer, Download } from 'lucide-react'

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const categoryKey = params.category as string
  const category = RESOURCE_CATEGORIES[categoryKey]

  if (!category) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800">Resource Not Found</h1>
        <button 
          onClick={() => router.push('/dashboard/resource-centre')}
          className="mt-4 text-[#C0392B] hover:underline"
        >
          Return to Resource Centre
        </button>
      </div>
    )
  }

  const Icon = category.icon

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      <Header 
        title={category.title} 
        subtitle={`Knowledge Base > ${category.title}`} 
      />
      
      <main className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1A1A2E] mb-6 transition-colors text-sm font-medium"
        >
          <ChevronLeft size={16} /> Back to Library
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Area */}
          <div className="p-8 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-[#F2F2F2] rounded-2xl flex items-center justify-center text-[#C0392B]">
                <Icon size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-[#1A1A2E]">{category.title}</h1>
                <p className="text-gray-400 text-sm mt-1">{category.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button title="Share resource" className="p-2.5 rounded-lg border border-gray-100 text-gray-400 hover:text-[#C0392B] hover:bg-gray-50 transition-all">
                <Share2 size={18} />
              </button>
              <button title="Print resource" className="p-2.5 rounded-lg border border-gray-100 text-gray-400 hover:text-[#C0392B] hover:bg-gray-50 transition-all">
                <Printer size={18} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A2E] text-white rounded-lg text-sm font-medium hover:bg-[#0f0f1f] transition-colors shadow-lg shadow-[#1A1A2E]/10">
                <Download size={16} /> Export PDF
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-12 prose prose-slate max-w-none">
            <div className="flex items-center gap-6 mb-10 pb-6 border-b border-gray-50">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Total Assets</span>
                <span className="text-lg font-bold text-[#1A1A2E]">{category.stats.count}</span>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Asset Type</span>
                <span className="text-lg font-bold text-[#1A1A2E]">{category.stats.type}</span>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Clearance</span>
                <span className="text-lg font-bold text-[#C0392B]">FOUNDER+</span>
              </div>
            </div>

            {/* Render full content */}
            <div className="whitespace-pre-line text-gray-600 leading-relaxed text-base space-y-4">
              {category.fullContent.split('\n').map((line: string, i: number) => {
                if (line.startsWith('### ')) {
                  return <h2 key={i} className="text-xl font-bold text-[#1A1A2E] mt-8 mb-4">{line.replace('### ', '')}</h2>
                }
                if (line.startsWith('#### ')) {
                  return <h3 key={i} className="text-lg font-bold text-[#1A1A2E] mt-6 mb-2">{line.replace('#### ', '')}</h3>
                }
                if (line.startsWith('- ')) {
                  return <ul key={i} className="my-2"><li className="ml-4 list-disc text-gray-600">{line.replace('- ', '')}</li></ul>
                }
                return <p key={i}>{line}</p>
              })}
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-gray-50 p-6 px-12 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 text-center uppercase tracking-[0.2em]">
              Havenly Solutions Internal Knowledge Base · Confidential · Always On.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
