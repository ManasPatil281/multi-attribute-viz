"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface AdvancedVisualizationsProps {
  data: any[]
  attributes?: string[]
}

export default function AdvancedVisualizations({ data, attributes }: AdvancedVisualizationsProps) {
  const columns = useMemo(() => {
    if (attributes && attributes.length > 0) return attributes
    if (!data || data.length === 0) return []
    return Object.keys(data[0])
  }, [data, attributes])

  if (!data || data.length === 0 || columns.length < 2) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Advanced Visualizations</CardTitle>
          <CardDescription>Upload data with at least 2 attributes to see advanced visualizations</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const numericAttributes = columns.filter((attr) => {
    return data.some((row) => !isNaN(Number(row[attr])))
  })

  const scatterData = data.slice(0, 100).map((row, index) => ({
    index,
    ...Object.fromEntries(numericAttributes.map((attr) => [attr, Number(row[attr]) || 0])),
  }))

  const radarData = numericAttributes.slice(0, 6).map((attr) => ({
    attribute: attr,
    value: data.reduce((sum, row) => sum + (Number(row[attr]) || 0), 0) / data.length,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Visualizations</CardTitle>
        <CardDescription>Explore relationships and patterns in your data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scatter" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scatter">Scatter Plot</TabsTrigger>
            <TabsTrigger value="radar">Radar Chart</TabsTrigger>
          </TabsList>
          <TabsContent value="scatter" className="h-[400px]">
            {numericAttributes.length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={numericAttributes[0]} name={numericAttributes[0]} />
                  <YAxis dataKey={numericAttributes[1]} name={numericAttributes[1]} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Legend />
                  <Scatter name="Data Points" data={scatterData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Need at least 2 numeric attributes for scatter plot
              </div>
            )}
          </TabsContent>
          <TabsContent value="radar" className="h-[400px]">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="attribute" />
                  <PolarRadiusAxis />
                  <Radar name="Average Values" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No numeric attributes available for radar chart
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
