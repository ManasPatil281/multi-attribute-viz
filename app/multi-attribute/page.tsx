"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import DataPreview from "@/components/data-preview"
import MultiAttributeVisualizer from "@/components/multi-attribute-visualizer"
import { useData } from "@/contexts/data-context"
import { Upload } from "lucide-react"

export default function MultiAttributePage() {
  const { uploadedData } = useData()
  const router = useRouter()

  const columns = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return []
    return Object.keys(uploadedData[0])
  }, [uploadedData])

  const numericColumns = useMemo(() => {
    if (!uploadedData) return []
    return columns.filter((col) => {
      const values = uploadedData.map((row) => Number.parseFloat(row[col])).filter((v) => !isNaN(v))
      return values.length > uploadedData.length * 0.8
    })
  }, [columns, uploadedData])

  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => numericColumns.slice(0, 2))

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]))
  }

  if (!uploadedData) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">No Data Uploaded</h2>
          <p className="text-slate-400 mb-6">Please upload a file first to create visualizations</p>
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
    <div className="px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Multi-Attribute Analysis</h2>
          <p className="text-slate-400">Explore relationships between multiple data attributes</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <DataPreview data={uploadedData} />
          </div>
          <div>
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Select Attributes</h3>
              <p className="text-sm text-slate-400 mb-4">Choose 2-4 attributes to visualize</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {columns.map((col) => (
                  <label
                    key={col}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-slate-500 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col)}
                      onChange={() => toggleColumn(col)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-slate-300 text-sm">{col}</span>
                  </label>
                ))}
              </div>
            </Card>
          </div>
        </div>
        {selectedColumns.length >= 2 && <MultiAttributeVisualizer data={uploadedData} columns={selectedColumns} />}
      </div>
    </div>
  )
}
