"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react"

interface StatisticsDashboardProps {
  data: any[]
  columns: string[]
}

export default function StatisticsDashboard({ data, columns }: StatisticsDashboardProps) {
  const statistics = useMemo(() => {
    const stats: {
      [key: string]: {
        type: string
        count: number
        missing: number
        missingPercent: number
        unique?: number
        min?: number
        max?: number
        mean?: number
        median?: number
        stdDev?: number
        outliers?: number
        quality: number
      }
    } = {}

    columns.forEach((col) => {
      const values = data.map((row) => row[col])
      const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== "")
      const missing = values.length - nonNullValues.length
      const missingPercent = (missing / values.length) * 100

      // Check if numeric
      const numericValues = nonNullValues.map((v) => Number.parseFloat(v)).filter((v) => !isNaN(v))

      if (numericValues.length > nonNullValues.length * 0.8) {
        // Numeric column
        const sorted = [...numericValues].sort((a, b) => a - b)
        const min = sorted[0]
        const max = sorted[sorted.length - 1]
        const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        const median = sorted[Math.floor(sorted.length / 2)]

        const variance = numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length
        const stdDev = Math.sqrt(variance)

        // Detect outliers using IQR method
        const q1 = sorted[Math.floor(sorted.length * 0.25)]
        const q3 = sorted[Math.floor(sorted.length * 0.75)]
        const iqr = q3 - q1
        const outliers = numericValues.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr).length

        const quality = Math.max(0, 100 - missingPercent - (outliers / numericValues.length) * 10)

        stats[col] = {
          type: "numeric",
          count: nonNullValues.length,
          missing,
          missingPercent,
          unique: new Set(numericValues).size,
          min,
          max,
          mean,
          median,
          stdDev,
          outliers,
          quality,
        }
      } else {
        // Categorical column
        const unique = new Set(nonNullValues).size
        const quality = Math.max(0, 100 - missingPercent)

        stats[col] = {
          type: "categorical",
          count: nonNullValues.length,
          missing,
          missingPercent,
          unique,
          quality,
        }
      }
    })

    return stats
  }, [data, columns])

  const overallQuality = useMemo(() => {
    const qualities = Object.values(statistics).map((s) => s.quality)
    return qualities.length > 0 ? qualities.reduce((a, b) => a + b, 0) / qualities.length : 0
  }, [statistics])

  const totalMissing = useMemo(() => {
    return Object.values(statistics).reduce((sum, s) => sum + s.missing, 0)
  }, [statistics])

  const totalOutliers = useMemo(() => {
    return Object.values(statistics).reduce((sum, s) => sum + (s.outliers || 0), 0)
  }, [statistics])

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Data Quality</p>
              <p className="text-3xl font-bold text-cyan-400">{overallQuality.toFixed(1)}%</p>
            </div>
            <CheckCircle className="w-12 h-12 text-cyan-400 opacity-20" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Records</p>
              <p className="text-3xl font-bold text-cyan-400">{data.length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-cyan-400 opacity-20" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Missing Values</p>
              <p className="text-3xl font-bold text-orange-400">{totalMissing}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-orange-400 opacity-20" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Outliers Detected</p>
              <p className="text-3xl font-bold text-red-400">{totalOutliers}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-400 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Column Statistics */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Column Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-4 py-3 text-slate-300 font-medium">Column</th>
                <th className="text-left px-4 py-3 text-slate-300 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-slate-300 font-medium">Count</th>
                <th className="text-left px-4 py-3 text-slate-300 font-medium">Missing</th>
                <th className="text-left px-4 py-3 text-slate-300 font-medium">Unique</th>
                <th className="text-left px-4 py-3 text-slate-300 font-medium">Quality</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col) => {
                const stat = statistics[col]
                return (
                  <tr key={col} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="px-4 py-3 text-slate-300 font-medium">{col}</td>
                    <td className="px-4 py-3 text-slate-400">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          stat.type === "numeric" ? "bg-blue-500/20 text-blue-300" : "bg-purple-500/20 text-purple-300"
                        }`}
                      >
                        {stat.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{stat.count}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {stat.missing} ({stat.missingPercent.toFixed(1)}%)
                    </td>
                    <td className="px-4 py-3 text-slate-400">{stat.unique}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              stat.quality >= 80 ? "bg-green-500" : stat.quality >= 60 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${stat.quality}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-300 text-xs font-medium">{stat.quality.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Numeric Column Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {columns.map((col) => {
          const stat = statistics[col]
          if (stat.type !== "numeric") return null

          return (
            <Card key={col} className="bg-slate-800/50 border-slate-700 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">{col}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Mean</span>
                  <span className="text-cyan-400 font-medium">{stat.mean?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Median</span>
                  <span className="text-cyan-400 font-medium">{stat.median?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Std Dev</span>
                  <span className="text-cyan-400 font-medium">{stat.stdDev?.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-700 pt-3 mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">Min</span>
                    <span className="text-cyan-400 font-medium">{stat.min?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Max</span>
                    <span className="text-cyan-400 font-medium">{stat.max?.toFixed(2)}</span>
                  </div>
                </div>
                {stat.outliers! > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-3">
                    <p className="text-red-300 text-sm">
                      <span className="font-medium">{stat.outliers}</span> outliers detected
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Data Quality Insights */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Quality Insights</h3>
        <div className="space-y-3">
          {Object.entries(statistics).map(([col, stat]) => {
            const issues = []
            if (stat.missingPercent > 10) {
              issues.push(`${stat.missingPercent.toFixed(1)}% missing values`)
            }
            if (stat.outliers && stat.outliers > 0) {
              issues.push(`${stat.outliers} outliers detected`)
            }
            if (stat.quality < 70) {
              issues.push("Low data quality")
            }

            return (
              <div key={col} className="flex items-start gap-3 pb-3 border-b border-slate-700/50 last:border-0">
                <div className="flex-1">
                  <p className="text-slate-300 font-medium">{col}</p>
                  {issues.length > 0 ? (
                    <p className="text-sm text-orange-300 mt-1">{issues.join(" • ")}</p>
                  ) : (
                    <p className="text-sm text-green-300 mt-1">No issues detected</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
