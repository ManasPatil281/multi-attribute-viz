"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { queryDataWithGroq } from "@/lib/groq"
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function DataChatbot() {
  const { uploadedData, fileName } = useData()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const generateDataContext = () => {
    if (!uploadedData || uploadedData.length === 0) return ""

    const columns = Object.keys(uploadedData[0])
    const sampleData = uploadedData.slice(0, 5)
    
    const columnStats = columns.map((col) => {
      const values = uploadedData.map((row) => row[col])
      const numericValues = values.map((v) => Number(v)).filter((v) => !isNaN(v))
      
      if (numericValues.length > values.length * 0.8) {
        const sorted = [...numericValues].sort((a, b) => a - b)
        const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        return `${col}: numeric (min: ${sorted[0]}, max: ${sorted[sorted.length - 1]}, mean: ${mean.toFixed(2)})`
      } else {
        const unique = new Set(values).size
        return `${col}: categorical (${unique} unique values)`
      }
    })

    return `Dataset: ${fileName}
Total Rows: ${uploadedData.length}
Columns: ${columns.join(", ")}

Column Statistics:
${columnStats.join("\n")}

Sample Data (first 5 rows):
${JSON.stringify(sampleData, null, 2)}`
  }

  const handleSend = async () => {
    if (!input.trim() || !uploadedData) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const dataContext = generateDataContext()
      const response = await queryDataWithGroq(input, dataContext)

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!uploadedData) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Data Assistant
          </CardTitle>
          <CardDescription>Upload data first to start chatting</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          Data Assistant
        </CardTitle>
        <CardDescription>Ask questions about your data - {fileName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4">
        <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p>Ask me anything about your data!</p>
                <div className="mt-4 space-y-2 text-sm">
                  <p>Try asking:</p>
                  <ul className="text-slate-500">
                    <li>• What are the main trends in this data?</li>
                    <li>• Calculate the average of [column name]</li>
                    <li>• What insights can you provide?</li>
                  </ul>
                </div>
              </div>
            )}
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-200"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-md text-sm"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-slate-600 px-1 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          )
                        },
                        h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-bold mb-1">{children}</h3>,
                        p: ({ children }) => <p className="mb-2">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-cyan-400 pl-4 italic text-slate-300 mb-2">
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto mb-2">
                            <table className="min-w-full border-collapse border border-slate-600">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border border-slate-600 px-2 py-1 bg-slate-600 text-left font-semibold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-slate-600 px-2 py-1">{children}</td>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <span className="text-xs opacity-50 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="bg-slate-700 text-slate-200 rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your data..."
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
