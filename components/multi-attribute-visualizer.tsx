"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MultiAttributeVisualizerProps {
  data: any[]
  columns: string[]
}

type ChartType = "scatter" | "bubble" | "correlation"

export default function MultiAttributeVisualizer({ data, columns }: MultiAttributeVisualizerProps) {
  const [chartType, setChartType] = useState<ChartType>("scatter")
  const [xAxis, setXAxis] = useState(columns[0])
  const [yAxis, setYAxis] = useState(columns[1])
  const [zAxis, setZAxis] = useState(columns[2] || "")

  const numericColumns = useMemo(() => {
    return columns.filter((col) => {
      const values = data.map((row) => Number.parseFloat(row[col])).filter((v) => !isNaN(v))
      return values.length > data.length * 0.8
    })
  }, [data, columns])

  const scatterData = useMemo(() => {
    return data
      .map((row) => ({
        x: Number.parseFloat(row[xAxis]),
        y: Number.parseFloat(row[yAxis]),
        z: zAxis ? Number.parseFloat(row[zAxis]) : 100,
        original: row,
      }))
      .filter((item) => !isNaN(item.x) && !isNaN(item.y) && !isNaN(item.z))
  }, [data, xAxis, yAxis, zAxis])

  const correlationMatrix = useMemo(() => {
    if (numericColumns.length < 2) return []

    const matrix = []
    for (let i = 0; i < numericColumns.length; i++) {
      const row = []
      for (let j = 0; j < numericColumns.length; j++) {
        const col1 = numericColumns[i]
        const col2 = numericColumns[j]

        const values1 = data.map((r) => Number.parseFloat(r[col1])).filter((v) => !isNaN(v))
        const values2 = data.map((r) => Number.parseFloat(r[col2])).filter((v) => !isNaN(v))

        if (i === j) {
          row.push(1)
        } else {
          const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length
          const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length

          let numerator = 0
          let denominator1 = 0
          let denominator2 = 0

          for (let k = 0; k < Math.min(values1.length, values2.length); k++) {
            const diff1 = values1[k] - mean1
            const diff2 = values2[k] - mean2
            numerator += diff1 * diff2
            denominator1 += diff1 * diff1
            denominator2 += diff2 * diff2
          }

          const correlation = numerator / Math.sqrt(denominator1 * denominator2)
          row.push(isNaN(correlation) ? 0 : correlation)
        }
      }
      matrix.push(row)
    }
    return matrix
  }, [data, numericColumns])

  const COLORS = ["#06b6d4", "#0ea5e9", "#3b82f6", "#8b5cf6", "#d946ef", "#ec4899"]

  return (
    <div className="space-y-6">
      {/* Chart Type and Axis Selector */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Visualization Settings</h3>

        <div className="mb-6">
          <p className="text-slate-300 text-sm font-medium mb-3">Chart Type</p>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => setChartType("scatter")}
              variant={chartType === "scatter" ? "default" : "outline"}
              className={chartType === "scatter" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-300"}
            >
              Scatter Plot
            </Button>
            {columns.length >= 3 && (
              <Button
                onClick={() => setChartType("bubble")}
                variant={chartType === "bubble" ? "default" : "outline"}
                className={chartType === "bubble" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-300"}
              >
                Bubble Chart
              </Button>
            )}
            {numericColumns.length >= 2 && (
              <Button
                onClick={() => setChartType("correlation")}
                variant={chartType === "correlation" ? "default" : "outline"}
                className={
                  chartType === "correlation" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-300"
                }
              >
                Correlation Matrix
              </Button>
            )}
          </div>
        </div>

        {chartType !== "correlation" && (
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-2">X-Axis</label>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 text-sm"
              >
                {numericColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-2">Y-Axis</label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 text-sm"
              >
                {numericColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
            {chartType === "bubble" && (
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">Bubble Size</label>
                <select
                  value={zAxis}
                  onChange={(e) => setZAxis(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 text-sm"
                >
                  <option value="">None</option>
                  {numericColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Chart Display */}
      <Card className="bg-slate-800/50 border-slate-700 p-8">
        <h3 className="text-lg font-semibold text-white mb-6">
          {chartType === "scatter" && `${xAxis} vs ${yAxis}`}
          {chartType === "bubble" && `${xAxis} vs ${yAxis} (sized by ${zAxis || "constant"})`}
          {chartType === "correlation" && "Correlation Matrix"}
        </h3>

        {chartType === "scatter" && (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="x" name={xAxis} stroke="#94a3b8" />
              <YAxis dataKey="y" name={yAxis} stroke="#94a3b8" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
              />
              <Scatter name={`${xAxis} vs ${yAxis}`} data={scatterData} fill="#06b6d4" />
            </ScatterChart>
          </ResponsiveContainer>
        )}

        {chartType === "bubble" && (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="x" name={xAxis} stroke="#94a3b8" />
              <YAxis dataKey="y" name={yAxis} stroke="#94a3b8" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
              />
              <Scatter name={`${xAxis} vs ${yAxis}`} data={scatterData} fill="#06b6d4" />
            </ScatterChart>
          </ResponsiveContainer>
        )}

        {chartType === "correlation" && (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th className="border border-slate-600 bg-slate-700/50 px-4 py-2 text-slate-300 text-sm"></th>
                    {numericColumns.map((col) => (
                      <th
                        key={col}
                        className="border border-slate-600 bg-slate-700/50 px-4 py-2 text-slate-300 text-sm max-w-24 truncate"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationMatrix.map((row, i) => (
                    <tr key={i}>
                      <td className="border border-slate-600 bg-slate-700/50 px-4 py-2 text-slate-300 text-sm font-medium">
                        {numericColumns[i]}
                      </td>
                      {row.map((value, j) => {
                        const hue = value > 0 ? 120 : 0
                        const saturation = Math.abs(value) * 100
                        const lightness = 50 - Math.abs(value) * 20
                        return (
                          <td
                            key={j}
                            className="border border-slate-600 px-4 py-2 text-center text-sm font-medium text-white"
                            style={{
                              backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                            }}
                          >
                            {value.toFixed(2)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* Statistics */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Summary</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total Points</p>
            <p className="text-2xl font-bold text-cyan-400">{scatterData.length}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Attributes</p>
            <p className="text-2xl font-bold text-cyan-400">{columns.length}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Numeric Columns</p>
            <p className="text-2xl font-bold text-cyan-400">{numericColumns.length}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Selected</p>
            <p className="text-2xl font-bold text-cyan-400">{columns.length}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
