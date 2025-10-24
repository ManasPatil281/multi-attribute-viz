"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import FileUploadSection from "@/components/file-upload-section"
import { Download, Trash2, Info, BarChart3, Zap, Database, TrendingUp, MessageSquare } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
	const { uploadedData, fileName, setData, clearData } = useData()
	const router = useRouter()

	const handleDataUpload = (data: any[], name?: string) => {
		setData(data, name || "Uploaded Data")
	}

	const handleClearData = () => {
		clearData()
	}

	const handleExportData = () => {
		if (!uploadedData) return
		const dataStr = JSON.stringify(uploadedData, null, 2)
		const dataBlob = new Blob([dataStr], { type: "application/json" })
		const url = URL.createObjectURL(dataBlob)
		const link = document.createElement("a")
		link.href = url
		link.download = `${fileName || "data"}.json`
		link.click()
		URL.revokeObjectURL(url)
	}

	const visualizationOptions = [
		{
			id: "statistics",
			title: "Statistics",
			description: "View detailed statistical analysis including data quality, missing values, and column statistics",
			icon: BarChart3,
			route: "/statistics",
		},
		{
			id: "single",
			title: "Single Attribute",
			description: "Analyze individual attributes with bar charts and pie charts",
			icon: Zap,
			route: "/single-attribute",
		},
		{
			id: "multi",
			title: "Multi-Attribute",
			description: "Explore relationships between multiple attributes using scatter plots and correlation analysis",
			icon: Database,
			route: "/multi-attribute",
		},
		{
			id: "advanced",
			title: "Advanced Visualizations",
			description: "Access scatter plots, radar charts, and advanced analytical tools",
			icon: Zap,
			route: "/advanced",
		},
		{
			id: "enhanced",
			title: "Enhanced Charts",
			description: "View distribution charts, trend lines, area charts, and cumulative visualizations",
			icon: TrendingUp,
			route: "/enhanced",
		},
		{
			id: "chatbot",
			title: "AI Data Assistant",
			description: "Ask questions about your data and get AI-powered insights and analysis",
			icon: MessageSquare,
			route: "/chatbot",
		},
	]

	return (
		<div className="min-h-screen">
			{/* Page Header */}
			<div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-16 z-30">
				<div className="px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-3xl font-bold text-white">Dashboard</h1>
							<p className="text-slate-400 mt-1">Upload and analyze your CSV data</p>
						</div>
						<div className="flex items-center gap-2">
							{uploadedData && (
								<>
									<Button
										variant="outline"
										size="sm"
										onClick={handleExportData}
										className="border-slate-700 text-slate-300 hover:text-white bg-transparent"
									>
										<Download className="w-4 h-4 mr-2" />
										Export
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={handleClearData}
										className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-transparent"
									>
										<Trash2 className="w-4 h-4 mr-2" />
										Clear
									</Button>
								</>
							)}
						</div>
					</div>

					{uploadedData && (
						<Alert className="bg-blue-500/10 border-blue-500/30">
							<Info className="h-4 w-4 text-blue-400" />
							<AlertDescription className="text-blue-300">
								Loaded: <span className="font-semibold">{fileName}</span> ({uploadedData.length} rows)
							</AlertDescription>
						</Alert>
					)}
				</div>
			</div>

			{/* Main Content */}
			<div className="px-4 sm:px-6 lg:px-8 py-8">
				{!uploadedData ? (
					<FileUploadSection onDataUpload={handleDataUpload} />
				) : (
					<div className="space-y-6">
						<div>
							<h2 className="text-2xl font-bold text-white mb-2">Available Visualizations</h2>
							<p className="text-slate-400">Choose a visualization type to analyze your data</p>
						</div>

						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{visualizationOptions.map((option) => {
								const Icon = option.icon
								return (
									<Card
										key={option.id}
										className="bg-slate-800/50 border-slate-700 hover:border-cyan-500 transition cursor-pointer group"
										onClick={() => router.push(option.route)}
									>
										<CardHeader>
											<div className="flex items-center gap-3 mb-2">
												<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition">
													<Icon className="w-6 h-6 text-white" />
												</div>
											</div>
											<CardTitle className="text-white">{option.title}</CardTitle>
											<CardDescription className="text-slate-400">{option.description}</CardDescription>
										</CardHeader>
										<CardContent>
											<Button className="w-full bg-slate-700 hover:bg-slate-600 text-white">
												Open {option.title}
											</Button>
										</CardContent>
									</Card>
								)
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
