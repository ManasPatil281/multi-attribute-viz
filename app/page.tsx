"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, BarChart3, LineChart, Zap, Upload, TrendingUp, Sparkles } from "lucide-react"

export default function LandingPage() {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Streamline Analyst</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition">
              Dashboard
            </Link>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white bg-transparent">
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Transform Your Data Into{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Streamline Analyst makes it effortless to visualize, analyze, and understand complex multi-attribute
              datasets with beautiful, interactive charts and advanced analytics.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800 bg-transparent"
              >
                View Demo
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-3xl"></div>
            <Card className="relative bg-slate-800/50 border-slate-700 p-8 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-3/4"></div>
                <div className="h-32 bg-slate-700/50 rounded-lg flex items-end gap-2 p-4">
                  <div className="h-1/3 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded"></div>
                  <div className="h-2/3 w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded"></div>
                  <div className="h-1/2 w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-xl text-slate-400">Everything you need to analyze data like a pro</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: BarChart3,
              title: "Multi-Attribute Visualization",
              description:
                "Visualize relationships between multiple data attributes simultaneously with scatter plots, heatmaps, and more.",
            },
            {
              icon: LineChart,
              title: "Advanced Analytics",
              description:
                "Dive deep with 3D visualizations, word clouds, geographic heat maps, and statistical analysis tools.",
            },
            {
              icon: Zap,
              title: "Real-Time Processing",
              description:
                "Upload and analyze your data instantly. See results in seconds with our optimized visualization engine.",
            },
            {
              icon: Upload,
              title: "Easy File Upload",
              description:
                "Support for CSV, JSON, and Excel files. Drag and drop your data to get started in seconds.",
            },
            {
              icon: TrendingUp,
              title: "Statistical Insights",
              description: "Get automatic insights including distributions, correlations, and data type analysis.",
            },
            {
              icon: Sparkles,
              title: "Interactive Dashboards",
              description: "Create custom dashboards with multiple visualizations and share insights with your team.",
            },
          ].map((feature, idx) => (
            <Card
              key={idx}
              className="bg-slate-800/50 border-slate-700 p-8 hover:border-slate-600 transition group cursor-pointer"
            >
              <feature.icon className="w-12 h-12 text-cyan-400 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* File Upload Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Upload & Analyze in Seconds</h2>
              <p className="text-slate-300 mb-6">
                Simply upload your CSV, JSON, or Excel file and Streamline Analyst will automatically detect data
                types, generate statistics, and create beautiful visualizations.
              </p>
              <ul className="space-y-3">
                {[
                  "Automatic data type detection",
                  "Statistical summaries",
                  "Correlation analysis",
                  "Multiple visualization types",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-300">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Card className="bg-slate-700/50 border-slate-600 p-8 backdrop-blur-sm">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center hover:border-cyan-500 transition cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 font-medium">Drag and drop your file here</p>
                <p className="text-slate-500 text-sm mt-2">or click to browse</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Data?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Start analyzing your data with Streamline Analyst today. No credit card required.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg"></div>
                <span className="font-bold text-white">Streamline</span>
              </div>
              <p className="text-slate-400 text-sm">Transform data into insights.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Security"] },
              { title: "Company", links: ["About", "Blog", "Careers"] },
              { title: "Resources", links: ["Docs", "API", "Support"] },
            ].map((col, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-slate-400 hover:text-white transition text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex items-center justify-between">
            <p className="text-slate-500 text-sm">© 2025 Streamline Analyst. All rights reserved.</p>
            <div className="flex gap-4">
              {["Twitter", "GitHub", "LinkedIn"].map((social, idx) => (
                <a key={idx} href="#" className="text-slate-400 hover:text-white transition text-sm">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
