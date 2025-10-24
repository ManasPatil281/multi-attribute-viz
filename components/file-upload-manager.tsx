"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle, AlertCircle, File, Trash2 } from "lucide-react"

interface UploadedFile {
  url: string
  filename: string
  size: number
  type: string
  uploadedAt: string
}

export function FileUploadManager() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loadingFiles, setLoadingFiles] = useState(false)

  // Load uploaded files on mount
  const loadFiles = useCallback(async () => {
    setLoadingFiles(true)
    try {
      const response = await fetch("/api/list")
      const data = await response.json()
      if (data.files) {
        setFiles(data.files)
      }
    } catch (err) {
      console.error("Failed to load files:", err)
    } finally {
      setLoadingFiles(false)
    }
  }, [])

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccess(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const uploadedFile = await response.json()
      setFiles((prev) => [uploadedFile, ...prev])
      setUploadProgress(100)
      setSuccess(`File "${file.name}" uploaded successfully!`)

      // Reset after 2 seconds
      setTimeout(() => {
        setUploadProgress(0)
        setSuccess(null)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setUploadProgress(0)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  // Handle file deletion
  const handleDelete = async (url: string, filename: string) => {
    try {
      const response = await fetch("/api/delete", {
        method: "DELETE",
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error("Delete failed")
      }

      setFiles((prev) => prev.filter((f) => f.url !== url))
      setSuccess(`File "${filename}" deleted successfully!`)
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-slate-800/50 border-slate-700 p-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Upload Data File</h3>
          <p className="text-slate-400 text-sm">Supported formats: CSV, JSON, Excel (.xlsx, .xls)</p>

          <label className="block">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-cyan-500 transition cursor-pointer bg-slate-900/50">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">
                {uploading ? "Uploading..." : "Drag and drop your file here"}
              </p>
              <p className="text-slate-500 text-sm mt-1">or click to browse</p>
              <input
                type="file"
                onChange={handleUpload}
                disabled={uploading}
                accept=".csv,.json,.xlsx,.xls"
                className="hidden"
              />
            </div>
          </label>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Uploading...</span>
                <span className="text-sm text-slate-400">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {error && (
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-500/10 border-green-500/30">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-400">{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Files List */}
      <Card className="bg-slate-800/50 border-slate-700 p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Uploaded Files</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={loadFiles}
              disabled={loadingFiles}
              className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
            >
              {loadingFiles ? "Loading..." : "Refresh"}
            </Button>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-8">
              <File className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.url}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate">{file.filename}</p>
                      <p className="text-slate-400 text-sm">
                        {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 transition text-sm font-medium"
                    >
                      View
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file.url, file.filename)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
