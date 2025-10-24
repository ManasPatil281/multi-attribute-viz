"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface AdvancedVisualizerProps {
  data: any[]
  columns: string[]
}

type VisualizationType = "heatmap" | "wordcloud" | "distribution" | "density"

export default function AdvancedVisualizer({ data, columns }: AdvancedVisualizerProps) {
  const [vizType, setVizType] = useState<VisualizationType>("heatmap")
  const [selectedColumn, setSelectedColumn] = useState(columns[0])

  const numericColumns = useMemo(() => {
    return columns.filter((col) => {
      const values = data.map((row) => Number.parseFloat(row[col])).filter((v) => !isNaN(v))
      return values.length > data.length * 0.8
    })
  }, [data, columns])

  const textColumns = useMemo(() => {
    return columns.filter((col) => {
      const values = data.map((row) => row[col])
      return values.some((v) => typeof v === "string" && v.length > 0)
    })
  }, [data, columns])

  // Heatmap data - correlation between numeric columns
  const heatmapData = useMemo(() => {
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
          row.push({ value: 1, col1, col2 })
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
          row.push({ value: isNaN(correlation) ? 0 : correlation, col1, col2 })
        }
      }
      matrix.push(row)
    }
    return matrix
  }, [data, numericColumns])

  // Word cloud data - frequency of text values
  const wordCloudData = useMemo(() => {
    if (!selectedColumn || !textColumns.includes(selectedColumn)) return []

    const words: { [key: string]: number } = {}
    data.forEach((row) => {
      const text = String(row[selectedColumn] || "")
      const wordList = text.toLowerCase().split(/\s+/)
      wordList.forEach((word) => {
        if (word.length > 2) {
          words[word] = (words[word] || 0) + 1
        }
      })
    })

    return Object.entries(words)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30)
  }, [data, selectedColumn, textColumns])

  // Distribution data
  const distributionData = useMemo(() => {
    if (!numericColumns.includes(selectedColumn)) return []

    const values = data
      .map((row) => Number.parseFloat(row[selectedColumn]))
      .filter((v) => !isNaN(v))
      .sort((a, b) => a - b)

    const min = Math.min(...values)
    const max = Math.max(...values)
    const binCount = Math.ceil(Math.sqrt(values.length))
    const binSize = (max - min) / binCount || 1

    const bins: { [key: number]: number } = {}
    for (let i = 0; i < binCount; i++) {
      bins[i] = 0
    }

    values.forEach((val) => {
      const binIndex = Math.min(Math.floor((val - min) / binSize), binCount - 1)
      bins[binIndex]++
    })

    return Object.entries(bins).map(([idx, count]) => ({
      range: `${(min + Number.parseInt(idx) * binSize).toFixed(1)}-${(min + (Number.parseInt(idx) + 1) * binSize).toFixed(1)}`,
      count,
    }))
  }, [data, selectedColumn, numericColumns])

  // Density plot data
  const densityData = useMemo(() => {
    if (!numericColumns.includes(selectedColumn)) return []

    const values = data
      .map((row) => Number.parseFloat(row[selectedColumn]))
      .filter((v) => !isNaN(v))
      .sort((a, b) => a - b)

    const min = Math.min(...values)
    const max = Math.max(...values)
    const points = 50
    const step = (max - min) / points

    const densityPoints = []
    for (let i = 0; i <= points; i++) {
      const x = min + i * step
      let density = 0

      values.forEach((val) => {
        const distance = Math.abs(val - x)
        const bandwidth = (max - min) / Math.sqrt(values.length)
        density += Math.exp(-(distance * distance) / (2 * bandwidth * bandwidth))
      })

      densityPoints.push({
        x: x.toFixed(2),
        density: density / values.length,
      })
    }

    return densityPoints
  }, [data, selectedColumn, numericColumns])

  return (
    <div className="space-y-6">
      {/* Visualization Type Selector */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Visualization Type</h3>
        <div className="flex gap-3 flex-wrap mb-6">
          {numericColumns.length >= 2 && (
            <Button
              onClick={() => setVizType("heatmap")}
              variant={vizType === "heatmap" ? "default" : "outline"}
              className={vizType === "heatmap" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-300"}
            >
              Correlation Heatmap
            </Button>
          )}
          {textColumns.length > 0 && (
            <Button
              onClick={() => setVizType("wordcloud")}
              variant={vizType === "wordcloud" ? "default" : "outline"}
              className={vizType === "wordcloud" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-300"}
            >
              Word Cloud
            </Button>
          )}
          {numericColumns.length > 0 && (
            <>
              <Button
                onClick={() => setVizType("distribution")}
                variant={vizType === "distribution" ? "default" : "outline"}
                className={
                  vizType === "distribution" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-300"
                }
              >
                Distribution
              </Button>
              <Button
                onClick={() => setVizType("density")}
                variant={vizType === "density" ? "default" : "outline"}
                className={vizType === "density" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-300"}
              >
                Density Plot
              </Button>
            </>
          )}
        </div>

        {(vizType === "wordcloud" || (vizType !== "heatmap" && numericColumns.length > 0)) && (
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-2">Select Column</label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 text-sm"
            >
              {(vizType === "wordcloud" ? textColumns : numericColumns).map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        )}
      </Card>

      {/* Visualization Display */}
      <Card className="bg-slate-800/50 border-slate-700 p-8">
        <h3 className="text-lg font-semibold text-white mb-6">
          {vizType === "heatmap" && "Correlation Heatmap"}
          {vizType === "wordcloud" && `Word Cloud - ${selectedColumn}`}
          {vizType === "distribution" && `Distribution - ${selectedColumn}`}
          {vizType === "density" && `Density Plot - ${selectedColumn}`}
        </h3>

        {vizType === "heatmap" && (
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
                  {heatmapData.map((row, i) => (
                    <tr key={i}>
                      <td className="border border-slate-600 bg-slate-700/50 px-4 py-2 text-slate-300 text-sm font-medium">
                        {numericColumns[i]}
                      </td>
                      {row.map((cell, j) => {
                        const hue = cell.value > 0 ? 120 : 0
                        const saturation = Math.abs(cell.value) * 100
                        const lightness = 50 - Math.abs(cell.value) * 20
                        return (
                          <td
                            key={j}
                            className="border border-slate-600 px-4 py-2 text-center text-sm font-medium text-white"
                            style={{
                              backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                            }}
                          >
                            {cell.value.toFixed(2)}
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

        {vizType === "wordcloud" && (
          <div className="flex flex-wrap gap-4 justify-center items-center min-h-96">
            {wordCloudData.length > 0 ? (
              wordCloudData.map((item, idx) => {
                const maxCount = Math.max(...wordCloudData.map((w) => w.count))
                const size = 12 + (item.count / maxCount) * 48
                const colors = ["#06b6d4", "#0ea5e9", "#3b82f6", "#8b5cf6", "#d946ef", "#ec4899"]
                return (
                  <div
                    key={idx}
                    style={{
                      fontSize: `${size}px`,
                      color: colors[idx % colors.length],
                      opacity: 0.7 + (item.count / maxCount) * 0.3,
                    }}
                    className="font-bold cursor-pointer hover:opacity-100 transition"
                  >
                    {item.word}
                  </div>
                )
              })
            ) : (
              <p className="text-slate-400">No text data available</p>
            )}
          </div>
        )}

        {vizType === "distribution" && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="range" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
              <Bar dataKey="count" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {vizType === "density" && (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={densityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="x" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
              <Area type="monotone" dataKey="density" fill="#06b6d4" stroke="#0ea5e9" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Statistics */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Analysis Summary</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total Records</p>
            <p className="text-2xl font-bold text-cyan-400">{data.length}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Numeric Columns</p>
            <p className="text-2xl font-bold text-cyan-400">{numericColumns.length}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Text Columns</p>
            <p className="text-2xl font-bold text-cyan-400">{textColumns.length}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total Columns</p>
            <p className="text-2xl font-bold text-cyan-400">{columns.length}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
