"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import EnhancedVisualizations from "@/components/enhanced-visualizations"
import { useData } from "@/contexts/data-context"
import { Upload } from "lucide-react"

export default function EnhancedPage() {
  const { uploadedData } = useData()
  const router = useRouter()

  if (!uploadedData) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">No Data Uploaded</h2>
          <p className="text-slate-400 mb-6">Please upload a file first to view visualizations</p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Enhanced Visualizations</h2>
        <p className="text-slate-400">Explore distribution, trends, and cumulative patterns in your data</p>
      </div>
      <EnhancedVisualizations data={uploadedData} />
    </div>
  )
}
