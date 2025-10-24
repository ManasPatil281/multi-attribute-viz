"use client"

import { Card } from "@/components/ui/card"

interface DataPreviewProps {
  data: any[]
}

export default function DataPreview({ data }: DataPreviewProps) {
  const columns = data.length > 0 ? Object.keys(data[0]) : []
  const previewRows = data.slice(0, 5)

  return (
    <Card className="bg-slate-800/50 border-slate-700 p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-white mb-4">Data Preview</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {columns.map((col) => (
                <th key={col} className="text-left px-4 py-2 text-slate-300 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 text-slate-400">
                    {String(row[col]).substring(0, 50)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-slate-500 text-xs mt-4">
        Showing {previewRows.length} of {data.length} rows
      </p>
    </Card>
  )
}
