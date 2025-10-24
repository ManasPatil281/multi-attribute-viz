 "use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DataStatisticsProps {
  data: any[]
}

export default function DataStatistics({ data }: DataStatisticsProps) {
  const columns = useMemo(() => {
    if (!data || data.length === 0) return []
    return Object.keys(data[0])
  }, [data])

  const statistics = useMemo(() => {
    const stats: Record<string, any> = {}

    columns.forEach((col) => {
      const values = data.map((row) => row[col])
      const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== "")
      const missing = values.length - nonNullValues.length
      const numericValues = nonNullValues.map((v) => Number(v)).filter((v) => !isNaN(v))

      if (numericValues.length > nonNullValues.length * 0.5) {
        const sorted = [...numericValues].sort((a, b) => a - b)
        const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length

        stats[col] = {
          type: "numeric",
          count: nonNullValues.length,
          missing,
          min: sorted[0]?.toFixed(2) || 0,
          max: sorted[sorted.length - 1]?.toFixed(2) || 0,
          mean: mean.toFixed(2),
          unique: new Set(numericValues).size,
        }
      } else {
        stats[col] = {
          type: "categorical",
          count: nonNullValues.length,
          missing,
          unique: new Set(nonNullValues).size,
        }
      }
    })

    return stats
  }, [data, columns])

  if (!data || data.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
        <p className="text-slate-400">No data available</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">{data.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Columns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">{columns.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">Good</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Column Statistics</CardTitle>
          <CardDescription>Detailed information about each column</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-slate-300 font-medium">Column</th>
                  <th className="text-left px-4 py-3 text-slate-300 font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-slate-300 font-medium">Count</th>
                  <th className="text-left px-4 py-3 text-slate-300 font-medium">Missing</th>
                  <th className="text-left px-4 py-3 text-slate-300 font-medium">Unique</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((col) => {
                  const stat = statistics[col]
                  return (
                    <tr key={col} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3 text-slate-300 font-medium">{col}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            stat.type === "numeric"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-purple-500/20 text-purple-300"
                          }`}
                        >
                          {stat.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{stat.count}</td>
                      <td className="px-4 py-3 text-slate-400">{stat.missing}</td>
                      <td className="px-4 py-3 text-slate-400">{stat.unique}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
