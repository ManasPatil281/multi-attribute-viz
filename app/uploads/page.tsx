import { FileUploadManager } from "@/components/file-upload-manager"

export default function UploadsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">File Management</h1>
          <p className="text-slate-400">Upload, manage, and organize your data files</p>
        </div>
        <FileUploadManager />
      </div>
    </div>
  )
}
