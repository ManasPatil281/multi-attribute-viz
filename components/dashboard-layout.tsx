"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BarChart3, Menu, Home, Upload, Settings, LogOut, FileText, Zap, Database, MessageSquare, TrendingUp } from "lucide-react"
import { useData } from "@/contexts/data-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const { uploadedData } = useData()

  const activeVisualization = searchParams.get("view") || "statistics"

  const visualizationTabs = [
    { id: "statistics", label: "Statistics", icon: BarChart3 },
    { id: "single", label: "Single Attr", icon: Zap },
    { id: "multi", label: "Multi Attr", icon: Database },
    { id: "advanced", label: "Advanced", icon: Zap },
    { id: "enhanced", label: "Enhanced", icon: TrendingUp },
    { id: "chatbot", label: "AI Chat", icon: MessageSquare },
  ]

  const visualizationRoutes = [
    { path: "/statistics", label: "Statistics", icon: BarChart3 },
    { path: "/single-attribute", label: "Single Attr", icon: Zap },
    { path: "/multi-attribute", label: "Multi Attr", icon: Database },
    { path: "/advanced", label: "Advanced", icon: Zap },
    { path: "/enhanced", label: "Enhanced", icon: TrendingUp },
    { path: "/chatbot", label: "AI Chat", icon: MessageSquare },
  ]

  const handleVisualizationChange = (viewId: string) => {
    router.push(`/dashboard?view=${viewId}`)
  }

  const NavContent = () => (
    <nav className="space-y-2">
      <Link href="/" onClick={() => setIsOpen(false)}>
        <Button
          variant={pathname === "/" ? "default" : "ghost"}
          className={`w-full justify-start gap-3 ${
            pathname === "/"
              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Home className="w-4 h-4" />
          Home
        </Button>
      </Link>
      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
        <Button
          variant={pathname === "/dashboard" ? "default" : "ghost"}
          className={`w-full justify-start gap-3 ${
            pathname === "/dashboard"
              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Dashboard
        </Button>
      </Link>
    </nav>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-slate-900 border-slate-800">
                <div className="mt-8">
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:inline">Streamline Analyst</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 border-r border-slate-800 bg-slate-950/50 flex-col p-6 min-h-[calc(100vh-73px)]">
          <div className="space-y-8 flex-1">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Navigation</h3>
              <NavContent />
            </div>

            {/* Visualization Links - Only show when data is uploaded */}
            {uploadedData && (
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Visualizations</h3>
                <nav className="space-y-2">
                  {visualizationRoutes.map((route) => {
                    const Icon = route.icon
                    const isActive = pathname === route.path

                    return (
                      <Link key={route.path} href={route.path} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start gap-3 ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                              : "text-slate-300 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {route.label}
                        </Button>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-300 mb-3">Need help?</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-slate-700 text-slate-300 hover:text-white bg-transparent"
              >
                <FileText className="w-4 h-4 mr-2" />
                Documentation
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
