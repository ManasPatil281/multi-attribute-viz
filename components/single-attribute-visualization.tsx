"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface SingleAttributeVisualizationProps {
  data: any[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function SingleAttributeVisualization({ data }: SingleAttributeVisualizationProps) {
  const columns = useMemo(() => Object.keys(data[0] || {}), [data])
  const [selectedColumn, setSelectedColumn] = useState(columns[0] || "")

  const chartData = useMemo(() => {
    if (!selectedColumn) return []
    
    const valueCounts: Record<string, number> = {}
    data.forEach((row) => {
      const value = String(row[selectedColumn])
      valueCounts[value] = (valueCounts[value] || 0) + 1
    })
    
    return Object.entries(valueCounts)
      .map(([name, value]) => ({ name, value }))
      .slice(0, 10)
  }, [data, selectedColumn])

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Single Attribute Analysis</CardTitle>
        <CardDescription>Visualize individual data attributes</CardDescription>
        <Select value={selectedColumn} onValueChange={setSelectedColumn}>
          <SelectTrigger className="w-[200px] bg-slate-700 border-slate-600">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {columns.map((col) => (
              <SelectItem key={col} value={col}>{col}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
            <Legend />
            <Bar dataKey="value" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
