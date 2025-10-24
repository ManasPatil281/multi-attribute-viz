"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, AlertCircle } from "lucide-react"
import Papa from "papaparse"

interface FileUploadProps {
  onUpload: (data: any[], columns: string[]) => void
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseFile = (file: File) => {
    setError("")

    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            const columns = Object.keys(results.data[0])
            onUpload(results.data, columns)
          } else {
            setError("File is empty")
          }
        },
        error: () => {
          setError("Failed to parse CSV file")
        },
      })
    } else if (file.type === "application/json" || file.name.endsWith(".json")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          const dataArray = Array.isArray(data) ? data : [data]
          if (dataArray.length > 0) {
            const columns = Object.keys(dataArray[0])
            onUpload(dataArray, columns)
          } else {
            setError("JSON file is empty")
          }
        } catch {
          setError("Failed to parse JSON file")
        }
      }
      reader.readAsText(file)
    } else {
      setError("Unsupported file type. Please upload CSV or JSON.")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      parseFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      parseFile(files[0])
    }
  }

  return (
    <Card
      className={`bg-slate-800/50 border-2 border-dashed rounded-2xl p-12 text-center transition cursor-pointer ${
        isDragging ? "border-cyan-500 bg-cyan-500/10" : "border-slate-600 hover:border-slate-500"
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input ref={fileInputRef} type="file" accept=".csv,.json" onChange={handleFileSelect} className="hidden" />

      <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
      <p className="text-slate-300 font-medium text-lg mb-2">Drag and drop your file here</p>
      <p className="text-slate-500 text-sm mb-6">or click to browse (CSV or JSON)</p>

      <Button
        onClick={() => fileInputRef.current?.click()}
        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
      >
        Select File
      </Button>

      {error && (
        <div className="mt-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </Card>
  )
}
