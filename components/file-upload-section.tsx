"use client"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, AlertCircle, CheckCircle } from "lucide-react"
import Papa from "papaparse"
import { useAuth } from "@/context/AuthContext"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadSectionProps {
  onDataUpload: (data: any[], filename?: string) => void
}

export default function FileUploadSection({ onDataUpload }: FileUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { accessToken } = useAuth()

  const uploadToS3 = async (file: File) => {
    if (!accessToken) {
      console.warn('User not authenticated, skipping S3 upload')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('Uploading file to S3:', file.name)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload to S3 failed')
      }

      console.log('File uploaded to S3 successfully:', result)
      setMessage({ 
        type: 'success', 
        text: `✅ File uploaded to S3: ${file.name}` 
      })
      
      // Clear success message after 5 seconds
      setTimeout(() => setMessage(null), 5000)
    } catch (err: any) {
      console.error('S3 upload error:', err)
      setMessage({ 
        type: 'error', 
        text: `❌ S3 upload failed: ${err.message || 'Unknown error'}` 
      })
    }
  }

  const handleFile = useCallback(
    (file: File) => {
      setError(null)
      setMessage(null)
      setIsProcessing(true)

      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string

          if (file.name.endsWith(".csv")) {
            Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              complete: async (results: any) => {
                if (results.data && results.data.length > 0) {
                  // Update local data context first
                  onDataUpload(results.data, file.name)
                  
                  // Then upload to S3 if authenticated
                  if (accessToken) {
                    await uploadToS3(file)
                  } else {
                    setMessage({ 
                      type: 'success', 
                      text: `✅ File loaded: ${file.name} (${results.data.length} rows)` 
                    })
                  }
                  
                  setIsProcessing(false)
                } else {
                  setError("CSV file is empty or invalid")
                  setIsProcessing(false)
                }
              },
              error: (error: any) => {
                setError(`CSV parsing error: ${error.message}`)
                setIsProcessing(false)
              },
            })
          } else if (file.name.endsWith(".json")) {
            try {
              const json = JSON.parse(text)
              const dataArray = Array.isArray(json) ? json : [json]
              if (dataArray.length > 0) {
                onDataUpload(dataArray, file.name)
                setMessage({ 
                  type: 'success', 
                  text: `✅ File loaded: ${file.name} (${dataArray.length} rows)` 
                })
              } else {
                setError("JSON file is empty")
              }
              setIsProcessing(false)
            } catch (error: any) {
              setError("Invalid JSON file format")
              setIsProcessing(false)
            }
          } else {
            setError("Unsupported file format. Please upload CSV or JSON files.")
            setIsProcessing(false)
          }
        } catch (error: any) {
          setError("Error reading file")
          setIsProcessing(false)
        }
      }

      reader.onerror = () => {
        setError("Error reading file")
        setIsProcessing(false)
      }

      reader.readAsText(file)
    },
    [onDataUpload, accessToken],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
          isDragging ? "border-cyan-500 bg-cyan-500/10" : "border-slate-600 hover:border-slate-500"
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <>
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 font-medium">Processing file...</p>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-300 font-medium mb-2">Drag and drop your file here</p>
            <p className="text-slate-500 text-sm mb-4">or</p>
            <label>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:text-white bg-transparent"
                asChild
              >
                <span>
                  Browse Files
                  <input type="file" accept=".csv,.json" onChange={handleFileInput} className="hidden" />
                </span>
              </Button>
            </label>
            <p className="text-slate-500 text-xs mt-4">Supports CSV and JSON files</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {message && (
        <Alert className={message.type === 'success' ? 'bg-green-500/10 border-green-500/30 mt-4' : 'bg-red-500/10 border-red-500/30 mt-4'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-300' : 'text-red-300'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}
    </Card>
  )
}
