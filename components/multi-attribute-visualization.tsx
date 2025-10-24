"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MultiAttributeVisualizationProps {
  data: any[]
}

export default function MultiAttributeVisualization({ data }: MultiAttributeVisualizationProps) {
  const columns = useMemo(() => Object.keys(data[0] || {}), [data])
  const numericColumns = useMemo(() => {
    return columns.filter((col) => {
      const values = data.map((row) => Number(row[col])).filter((v) => !isNaN(v))
      return values.length > data.length * 0.8
    })
  }, [columns, data])

  const [xAxis, setXAxis] = useState(numericColumns[0] || "")
  const [yAxis, setYAxis] = useState(numericColumns[1] || "")

  const chartData = useMemo(() => {
    return data.slice(0, 100).map((row, index) => ({
      index,
      x: Number(row[xAxis]) || 0,
      y: Number(row[yAxis]) || 0,
    }))
  }, [data, xAxis, yAxis])

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Multi-Attribute Analysis</CardTitle>
        <CardDescription>Compare relationships between attributes</CardDescription>
        <div className="flex gap-4">
          <Select value={xAxis} onValueChange={setXAxis}>
            <SelectTrigger className="w-[150px] bg-slate-700 border-slate-600">
              <SelectValue placeholder="X Axis" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map((col) => (
                <SelectItem key={col} value={col}>{col}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yAxis} onValueChange={setYAxis}>
            <SelectTrigger className="w-[150px] bg-slate-700 border-slate-600">
              <SelectValue placeholder="Y Axis" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map((col) => (
                <SelectItem key={col} value={col}>{col}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="x" name={xAxis} stroke="#94a3b8" />
            <YAxis dataKey="y" name={yAxis} stroke="#94a3b8" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
            <Legend />
            <Scatter name="Data Points" data={chartData} fill="#06b6d4" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
