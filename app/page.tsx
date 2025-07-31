"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  FileText,
  Briefcase,
  Upload,
  File,
  Trash2,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react"

// Define the expected structure of the results from the backend API
interface MatchResults {
  matchScore: number
  goodSkills: string[] // This must be an array
  missingSkills: string[]
  suggestions: string[] // THIS MUST BE AN ARRAY
}

export default function ResumeMatcherPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [isProcessingPDF, setIsProcessingPDF] = useState(false)
  const [pdfProcessingProgress, setPdfProcessingProgress] = useState(0)
  const [jobDescription, setJobDescription] = useState("")
  const [results, setResults] = useState<MatchResults | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)

  // Animate score when results are available
  useEffect(() => {
    if (results?.matchScore) {
      let start = 0
      const end = results.matchScore
      const duration = 2000
      const increment = end / (duration / 16)

      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setAnimatedScore(end)
          clearInterval(timer)
        } else {
          setAnimatedScore(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [results])

  // --- PDF Processing Integration ---
  const processPDFFile = async (file: File) => {
    setIsProcessingPDF(true)
    setPdfProcessingProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process PDF.")
      }

      const data = await response.json()
      setResumeText(data.resumeText || data.text)
      setPdfProcessingProgress(100)
    } catch (error: any) {
      console.error("Error processing PDF:", error)
      alert(`Error processing PDF file: ${error.message}. Please try again.`)
      setResumeFile(null)
      setResumeText("")
      setPdfProcessingProgress(0);
    } finally {
      setIsProcessingPDF(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === "application/pdf") {
        setResumeFile(file)
        processPDFFile(file)
      } else {
        alert("Please upload a PDF file only.")
      }
    }
  }

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file && file.type === "application/pdf") {
      setResumeFile(file)
      processPDFFile(file)
    } else {
      alert("Please upload a PDF file only.")
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const removeFile = () => {
    setResumeFile(null)
    setResumeText("")
    setPdfProcessingProgress(0)
    setResults(null);
  }

  // --- AI Analysis Integration ---
  const analyzeMatch = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      alert("Please upload a resume and fill in the job description.")
      return
    }

    setIsAnalyzing(true)
    setAnimatedScore(0)
    setResults(null)

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText, jobDescription }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze match.")
      }

      const data: MatchResults = await response.json()
      // Add a console log here to inspect the received data
      console.log("Received match results from backend:", data);
      setResults(data)
    } catch (error: any) {
      console.error("Error during match analysis:", error)
      alert(`Error analyzing match: ${error.message}. Please try again.`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setResults(null)
    setResumeFile(null)
    setResumeText("")
    setJobDescription("")
    setAnimatedScore(0)
    setPdfProcessingProgress(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Responsive Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl relative z-10">
        {/* Responsive Enhanced Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-4 sm:mb-6">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">AI-Powered Resume Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3 sm:mb-4 leading-tight">
            Resume & Job Description Matcher
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Leverage advanced AI to analyze how well your resume matches job requirements and get actionable insights to
            boost your application success rate.
          </p>
        </div>

        {/* Responsive Enhanced Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-12">
          {/* Responsive Enhanced Resume Upload */}
          <Card className="group shadow-lg sm:shadow-xl lg:shadow-2xl border-0 bg-white/40 backdrop-blur-md hover:bg-white/50 transition-all duration-500 hover:shadow-2xl lg:hover:shadow-3xl hover:-translate-y-0.5 lg:hover:-translate-y-1">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </div>
                <span className="truncate">Upload Resume (PDF)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {!resumeFile ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 cursor-pointer ${
                    isDragOver
                      ? "border-blue-500 bg-blue-50/50 scale-105"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
                  }`}
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById("resume-upload")?.click()}
                >
                  <div className={`transition-all duration-300 ${isDragOver ? "scale-110" : ""}`}>
                    <Upload
                      className={`h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mx-auto mb-2 sm:mb-4 transition-colors duration-300 ${
                        isDragOver ? "text-blue-500" : "text-gray-400"
                      }`}
                    />
                    <p className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-700 mb-1 sm:mb-2">
                      {isDragOver ? "Drop your resume here!" : "Drop resume or click to browse"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-6">Supports PDF files up to 10MB</p>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5">
                      <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Choose PDF File
                    </Button>
                  </div>
                  <input id="resume-upload" type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  {/* Responsive Enhanced File Info */}
                  <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-lg">
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white shadow-lg flex-shrink-0">
                        <File className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg truncate">
                          {resumeFile.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-110 flex-shrink-0 p-2"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>

                  {/* Responsive Enhanced Processing Status */}
                  {isProcessingPDF && (
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50 shadow-lg">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 border-b-2 border-amber-600"></div>
                        <span className="font-medium text-amber-700 text-sm sm:text-base">Processing PDF...</span>
                      </div>
                      <Progress value={pdfProcessingProgress} className="h-1.5 sm:h-2" />
                    </div>
                  )}

                  {/* Responsive Enhanced Text Preview */}
                  {resumeText && !isProcessingPDF && (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        <label className="font-medium text-gray-700 text-sm sm:text-base">
                          Extracted Text Preview:
                        </label>
                      </div>
                      <div className="max-h-32 sm:max-h-40 lg:max-h-48 overflow-y-auto p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/50 text-xs sm:text-sm text-gray-700 shadow-inner">
                        {resumeText.substring(0, 500)}
                        {resumeText.length > 500 && "..."}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Target className="h-3 w-3" />
                        {resumeText.length} characters extracted successfully
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Responsive Enhanced Job Description Input */}
          <Card className="group shadow-lg sm:shadow-xl lg:shadow-2xl border-0 bg-white/40 backdrop-blur-md hover:bg-white/50 transition-all duration-500 hover:shadow-2xl lg:hover:shadow-3xl hover:-translate-y-0.5 lg:hover:-translate-y-1">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg text-white">
                  <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </div>
                <span className="truncate">Job Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <Textarea
                placeholder="Copy and paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[200px] sm:min-h-[280px] lg:min-h-[350px] resize-none border-gray-200/50 focus:border-green-500 focus:ring-green-500/20 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70 text-sm sm:text-base"
              />
              <div className="flex items-center justify-between mt-2 sm:mt-3">
                <p className="text-xs sm:text-sm text-gray-500">{jobDescription.length} characters</p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <TrendingUp className="h-3 w-3" />
                  <span className="hidden sm:inline">Real-time analysis ready</span>
                  <span className="sm:hidden">Ready</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responsive Enhanced Action Buttons */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <Button
            onClick={analyzeMatch}
            disabled={isAnalyzing || isProcessingPDF || !resumeText.trim() || !jobDescription.trim()}
            size="lg"
            className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-700 hover:via-purple-700 hover:to-blue-700 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Analyzing with AI...</span>
                  <span className="sm:hidden">Analyzing...</span>
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Match Now</span>
                <span className="sm:hidden">Match</span>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            )}
          </Button>

          {results && (
            <Button
              onClick={resetAnalysis}
              variant="outline"
              size="lg"
              className="mt-3 sm:mt-0 sm:ml-4 lg:ml-6 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg bg-white/50 backdrop-blur-sm border-gray-300/50 hover:bg-white/70 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              Start Over
            </Button>
          )}
        </div>

        {/* Responsive Enhanced Results Section */}
        {results && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in slide-in-from-bottom-4 duration-1000">
            {/* Responsive Enhanced Match Score */}
            <Card className="shadow-lg sm:shadow-xl lg:shadow-2xl border-0 bg-gradient-to-br from-white/60 to-blue-50/60 backdrop-blur-md overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-blue-400/10 to-purple-400/10"></div>
              <CardContent className="text-center py-6 sm:py-8 lg:py-12 relative z-10 px-4 sm:px-6">
                <div className="mb-4 sm:mb-6 lg:mb-8">
                  <div className="text-4xl sm:text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 animate-pulse">
                    {animatedScore}%
                  </div>
                  <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mt-2 sm:mt-4 font-semibold">Match Score</p>
                </div>
                <div className="w-full bg-gray-200/50 rounded-full h-2 sm:h-3 lg:h-4 max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto shadow-inner">
                  <div
                    className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-2 sm:h-3 lg:h-4 rounded-full transition-all duration-2000 ease-out shadow-lg"
                    style={{ width: `${animatedScore}%` }}
                  ></div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                  {animatedScore >= 80
                    ? "Excellent match! 🎉"
                    : animatedScore >= 60
                      ? "Good match! 👍"
                      : "Room for improvement 📈"}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Responsive Enhanced Matched Skills */}
              <Card className="shadow-lg sm:shadow-xl lg:shadow-2xl border-0 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-md hover:shadow-2xl lg:hover:shadow-3xl transition-all duration-500">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-green-700 text-base sm:text-lg lg:text-xl">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg text-white">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    </div>
                    <span className="truncate">Matched Skills ({results.goodSkills.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {results.goodSkills.map((skill, index) => (
                      <Badge
                        key={index}
                        className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-left-2"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="truncate">{skill}</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Responsive Enhanced Missing Skills */}
              <Card className="shadow-lg sm:shadow-xl lg:shadow-2xl border-0 bg-gradient-to-br from-red-50/80 to-pink-50/80 backdrop-blur-md hover:shadow-2xl lg:hover:shadow-3xl transition-all duration-500">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-red-700 text-base sm:text-lg lg:text-xl">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg text-white">
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    </div>
                    <span className="truncate">Missing Skills ({results.missingSkills.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {results.missingSkills.map((skill, index) => (
                      <Badge
                        key={index}
                        className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 hover:from-red-200 hover:to-pink-200 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-right-2"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="truncate">{skill}</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Responsive Enhanced Suggestions */}
            <Card className="shadow-lg sm:shadow-xl lg:shadow-2xl border-0 bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-md hover:shadow-2xl lg:hover:shadow-3xl transition-all duration-500">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-amber-700 text-base sm:text-lg lg:text-xl">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg text-white">
                    <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  </div>
                  <span className="truncate">AI-Powered Suggestions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* FIX: Ensure results.suggestions is an array before mapping */}
                  {results.suggestions && Array.isArray(results.suggestions) && results.suggestions.length > 0 ? (
                    results.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-xl border-l-4 border-amber-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg text-white flex-shrink-0">
                          <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                        <p className="text-gray-700 leading-relaxed font-medium text-xs sm:text-sm lg:text-base">
                          {suggestion}
                        </p>
                      </div>
                    ))
                  ) : (
                    // Fallback if suggestions is not an array or is empty
                    <p className="text-gray-500 text-sm">No specific suggestions available at this time.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}