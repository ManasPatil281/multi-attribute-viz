"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface DataContextType {
  uploadedData: any[] | null
  fileName: string
  setData: (data: any[], name: string) => void
  clearData: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [uploadedData, setUploadedData] = useState<any[] | null>(null)
  const [fileName, setFileName] = useState<string>("")

  const setData = (data: any[], name: string) => {
    setUploadedData(data)
    setFileName(name)
  }

  const clearData = () => {
    setUploadedData(null)
    setFileName("")
  }

  return (
    <DataContext.Provider value={{ uploadedData, fileName, setData, clearData }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
