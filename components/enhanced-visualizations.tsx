"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface EnhancedVisualizationsProps {
  data: any[]
}

export default function EnhancedVisualizations({ data }: EnhancedVisualizationsProps) {
  const columns = useMemo(() => {
    if (!data || data.length === 0) return []
    return Object.keys(data[0])
  }, [data])

  const numericColumns = useMemo(() => {
    return columns.filter((col) => {
      const values = data.map((row) => Number(row[col])).filter((v) => !isNaN(v))
      return values.length > data.length * 0.5
    })
  }, [columns, data])

  const [selectedColumn, setSelectedColumn] = useState("")

  // Update selected column when numeric columns change
  useEffect(() => {
    if (numericColumns.length > 0 && !selectedColumn) {
      setSelectedColumn(numericColumns[0])
    }
  }, [numericColumns, selectedColumn])

  const distributionData = useMemo(() => {
    if (!selectedColumn || !data) return []
    const values = data.map((row) => Number(row[selectedColumn])).filter((v) => !isNaN(v))
    if (values.length === 0) return []
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    const binCount = 20
    const binSize = (max - min) / binCount || 1
    
    const bins = Array(binCount).fill(0)
    values.forEach((v) => {
      const binIndex = Math.min(Math.floor((v - min) / binSize), binCount - 1)
      bins[binIndex]++
    })
    
    return bins.map((count, i) => ({
      range: `${(min + i * binSize).toFixed(1)}`,
      count,
    }))
  }, [data, selectedColumn])

  const trendData = useMemo(() => {
    if (!selectedColumn || !data) return []
    return data.slice(0, 100).map((row, index) => ({
      index: index + 1,
      value: Number(row[selectedColumn]) || 0,
    }))
  }, [data, selectedColumn])

  const cumulativeData = useMemo(() => {
    if (!selectedColumn || !data) return []
    let cumulative = 0
    return data.slice(0, 100).map((row, index) => {
      cumulative += Number(row[selectedColumn]) || 0
      return {
        index: index + 1,
        cumulative,
      }
    })
  }, [data, selectedColumn])

  if (!data || data.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Enhanced Visualizations</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (numericColumns.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Enhanced Visualizations</CardTitle>
          <CardDescription>No numeric columns found in your data</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Enhanced Visualizations</CardTitle>
        <CardDescription>Advanced chart types for deeper insights</CardDescription>
        <Select value={selectedColumn} onValueChange={setSelectedColumn}>
          <SelectTrigger className="w-[200px] bg-slate-700 border-slate-600">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {numericColumns.map((col) => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="distribution" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700 mb-4">
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="trend">Trend Line</TabsTrigger>
            <TabsTrigger value="area">Area Chart</TabsTrigger>
            <TabsTrigger value="cumulative">Cumulative</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution" className="mt-0">
            <div className="w-full h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="range" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Bar dataKey="count" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="trend" className="mt-0">
            <div className="w-full h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="index" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="area" className="mt-0">
            <div className="w-full h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="index" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="cumulative" className="mt-0">
            <div className="w-full h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="index" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Legend />
                  <Area type="monotone" dataKey="cumulative" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.3} />
                  <Line type="monotone" dataKey="cumulative" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
