"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface SingleAttributeVisualizerProps {
  data: any[]
  column: string
}

type ChartType = "histogram" | "line" | "pie"

export default function SingleAttributeVisualizer({ data, column }: SingleAttributeVisualizerProps) {
  const [chartType, setChartType] = useState<ChartType>("histogram")

  const processedData = useMemo(() => {
    const values = data.map((row) => row[column]).filter((val) => val !== null && val !== undefined && val !== "")

    // Check if data is numeric
    const numericValues = values.map((v) => Number.parseFloat(v)).filter((v) => !isNaN(v))

    const isNumeric = numericValues.length === values.length

    if (isNumeric) {
      // Create histogram bins
      const min = Math.min(...numericValues)
      const max = Math.max(...numericValues)
      const binCount = Math.ceil(Math.sqrt(numericValues.length))
      const binSize = (max - min) / binCount || 1

      const bins: { [key: number]: number } = {}
      for (let i = 0; i < binCount; i++) {
        bins[i] = 0
      }

      numericValues.forEach((val) => {
        const binIndex = Math.min(Math.floor((val - min) / binSize), binCount - 1)
        bins[binIndex]++
      })

      return {
        isNumeric: true,
        histogram: Object.entries(bins).map(([idx, count]) => ({
          range: `${(min + Number.parseInt(idx) * binSize).toFixed(1)}-${(min + (Number.parseInt(idx) + 1) * binSize).toFixed(1)}`,
          count,
        })),
        values: numericValues,
      }
    } else {
      // Categorical data - count occurrences
      const counts: { [key: string]: number } = {}
      values.forEach((val) => {
        const key = String(val)
        counts[key] = (counts[key] || 0) + 1
      })

      return {
        isNumeric: false,
        categorical: Object.entries(counts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10),
      }
    }
  }, [data, column])

  const COLORS = [
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#8b5cf6",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#f97316",
    "#eab308",
    "#84cc16",
  ]

  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Visualization Type</h3>
        <div className="flex gap-3 flex-wrap">
          {processedData.isNumeric ? (
            <>
              <Button
                onClick={() => setChartType("histogram")}
                variant={chartType === "histogram" ? "default" : "outline"}
                className={
                  chartType === "histogram" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-300"
                }
              >
                Histogram
              </Button>
              <Button
                onClick={() => setChartType("line")}
                variant={chartType === "line" ? "default" : "outline"}
                className={chartType === "line" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-300"}
              >
                Line Chart
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setChartType("pie")}
                variant={chartType === "pie" ? "default" : "outline"}
                className={chartType === "pie" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-300"}
              >
                Pie Chart
              </Button>
              <Button
                onClick={() => setChartType("histogram")}
                variant={chartType === "histogram" ? "default" : "outline"}
                className={
                  chartType === "histogram" ? "bg-cyan-600 hover:bg-cyan-700" : "border-slate-700 text-slate-300"
                }
              >
                Bar Chart
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Chart Display */}
      <Card className="bg-slate-800/50 border-slate-700 p-8">
        <h3 className="text-lg font-semibold text-white mb-6">
          {column} - {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
        </h3>

        {processedData.isNumeric ? (
          <>
            {chartType === "histogram" && (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData.histogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="range" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Bar dataKey="count" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            )}
            {chartType === "line" && (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={processedData.histogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="range" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        ) : (
          <>
            {chartType === "pie" && (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={processedData.categorical}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {processedData.categorical.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {chartType === "histogram" && (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData.categorical}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Bar dataKey="value" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </Card>

      {/* Statistics */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {processedData.isNumeric ? (
            <>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Count</p>
                <p className="text-2xl font-bold text-cyan-400">{processedData.values.length}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Mean</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {(processedData.values.reduce((a, b) => a + b, 0) / processedData.values.length).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Min</p>
                <p className="text-2xl font-bold text-cyan-400">{Math.min(...processedData.values).toFixed(2)}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Max</p>
                <p className="text-2xl font-bold text-cyan-400">{Math.max(...processedData.values).toFixed(2)}</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Total Values</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {processedData.categorical.reduce((sum, item) => sum + item.value, 0)}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Unique Values</p>
                <p className="text-2xl font-bold text-cyan-400">{processedData.categorical.length}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Most Common</p>
                <p className="text-lg font-bold text-cyan-400">{processedData.categorical[0]?.name}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Frequency</p>
                <p className="text-2xl font-bold text-cyan-400">{processedData.categorical[0]?.value}</p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
