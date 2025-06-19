'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Upload,
  Search,
  Database,
  ArrowRight,
  CheckCircle,
  Clock,
  Download,
  RotateCcw,
  Play,
  Users,
  Settings,
  Plus,
  X,
} from 'lucide-react'
import Link from 'next/link'

export default function TutorialPage() {
  const [activeStep, setActiveStep] = useState(1)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchQueries, setSearchQueries] = useState([
    { id: 1, query: 'john.doe@example.com' },
    { id: 2, query: 'jane.smith@company.com' },
  ])
  const [selectedColumns, setSelectedColumns] = useState(['email', 'name'])
  const [wholeWord, setWholeWord] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)

  const simulateUpload = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const addSearchQuery = () => {
    const newId = Math.max(...searchQueries.map((q) => q.id)) + 1
    setSearchQueries([...searchQueries, { id: newId, query: '' }])
  }

  const removeSearchQuery = (id: number) => {
    setSearchQueries(searchQueries.filter((q) => q.id !== id))
  }

  const updateSearchQuery = (id: number, query: string) => {
    setSearchQueries(
      searchQueries.map((q) => (q.id === id ? { ...q, query } : q))
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            CSV2JSON Tutorial
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            Learn how to use our powerful CSV processing and data matching
            system. Follow this interactive guide to understand the complete
            workflow.
          </p>
        </div>

        {/* Quick Start */}
        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Quick Start
            </CardTitle>
            <CardDescription>
              Ready to get started? Contact your administrator for account
              access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/login">
                <Button>Login to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Complete Workflow Overview</CardTitle>
            <CardDescription>
              The typical user journey consists of 4 main steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                {
                  step: 1,
                  title: 'Upload CSV',
                  icon: Upload,
                  desc: 'Upload your CSV file with drag & drop',
                },
                {
                  step: 2,
                  title: 'Process Data',
                  icon: Database,
                  desc: 'System processes your file in background',
                },
                {
                  step: 3,
                  title: 'Setup Search',
                  icon: Search,
                  desc: 'Configure columns and search parameters',
                },
                {
                  step: 4,
                  title: 'Get Results',
                  icon: Download,
                  desc: 'View and download matching results',
                },
              ].map(({ step, title, icon: Icon, desc }) => (
                <div
                  key={step}
                  className="rounded-lg border p-4 text-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="mb-3 flex justify-center">
                    <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="mb-2 font-semibold">
                    {step}. {title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interactive Tutorial */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Tutorial</CardTitle>
            <CardDescription>
              Follow along with this step-by-step guide to learn the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={`step-${activeStep}`}
              onValueChange={(value) =>
                setActiveStep(parseInt(value.split('-')[1]))
              }
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="step-1">Step 1: Upload</TabsTrigger>
                <TabsTrigger value="step-2">Step 2: Process</TabsTrigger>
                <TabsTrigger value="step-3">Step 3: Search</TabsTrigger>
                <TabsTrigger value="step-4">Step 4: Results</TabsTrigger>
              </TabsList>

              {/* Step 1: File Upload */}
              <TabsContent value="step-1" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">
                      Step 1: Upload Your CSV File
                    </h3>
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Start by uploading your CSV file. Our system supports
                        files up to 100MB with chunked upload for reliability.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Drag and drop your CSV file
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Add task metadata (topic, dates, references)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Real-time upload progress tracking
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* File Upload Demo */}
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
                      <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                        Drag your CSV file here or click to browse
                      </p>
                      <Button variant="outline" onClick={simulateUpload}>
                        Try Upload Demo
                      </Button>
                      {uploadProgress > 0 && (
                        <div className="mt-4">
                          <Progress value={uploadProgress} className="w-full" />
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Uploading... {uploadProgress}%
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Task Form Demo */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="topic">Task Topic</Label>
                        <Input
                          id="topic"
                          placeholder="e.g., Customer Email Verification"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reference">Reference</Label>
                        <Input
                          id="reference"
                          placeholder="e.g., Q1 2024 Customer Data"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Optional description for this task"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Step 2: Processing */}
              <TabsContent value="step-2" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">
                      Step 2: Background Processing
                    </h3>
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Once uploaded, your CSV file is processed in the
                        background. The system parses and indexes your data for
                        fast searching.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          Automatic background processing
                        </li>
                        <li className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-blue-500" />
                          Data parsing and indexing
                        </li>
                        <li className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4 text-gray-500" />
                          Real-time status updates
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Processing Status Demo */}
                    <div className="space-y-3">
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Customer Data Processing
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className="border-yellow-600 text-yellow-600"
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              Processing
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>75%</span>
                            </div>
                            <Progress value={75} />
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Indexing columns and preparing for search...
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Email Verification Task
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className="border-green-600 text-green-600"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Completed
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm">
                            <span>15,234 rows processed</span>
                            <Button size="sm" variant="outline">
                              <Search className="mr-1 h-3 w-3" />
                              Search
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Step 3: Search Setup */}
              <TabsContent value="step-3" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">
                      Step 3: Configure Search
                    </h3>
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Set up your search parameters by selecting columns and
                        configuring search options.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Select up to 4 columns for matching
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Configure search options
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Add multiple search queries
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Column Selection Demo */}
                    <div>
                      <Label className="text-sm font-medium">
                        Select Columns (Max 4)
                      </Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {[
                          'email',
                          'name',
                          'phone',
                          'company',
                          'address',
                          'city',
                        ].map((column) => (
                          <div
                            key={column}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={column}
                              checked={selectedColumns.includes(column)}
                              onCheckedChange={(checked) => {
                                if (checked && selectedColumns.length < 4) {
                                  setSelectedColumns([
                                    ...selectedColumns,
                                    column,
                                  ])
                                } else if (!checked) {
                                  setSelectedColumns(
                                    selectedColumns.filter((c) => c !== column)
                                  )
                                }
                              }}
                              disabled={
                                !selectedColumns.includes(column) &&
                                selectedColumns.length >= 4
                              }
                            />
                            <Label
                              htmlFor={column}
                              className="text-sm capitalize"
                            >
                              {column}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Search Options */}
                    <div>
                      <Label className="text-sm font-medium">
                        Search Options
                      </Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="whole-word"
                            checked={wholeWord}
                            onCheckedChange={(checked) =>
                              setWholeWord(checked === true)
                            }
                          />
                          <Label htmlFor="whole-word" className="text-sm">
                            Whole word matching
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="case-sensitive"
                            checked={caseSensitive}
                            onCheckedChange={(checked) =>
                              setCaseSensitive(checked === true)
                            }
                          />
                          <Label htmlFor="case-sensitive" className="text-sm">
                            Case sensitive
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Search Queries */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Search Queries
                        </Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={addSearchQuery}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Query
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {searchQueries.map(({ id, query }) => (
                          <div key={id} className="flex items-center gap-2">
                            <Input
                              value={query}
                              onChange={(e) =>
                                updateSearchQuery(id, e.target.value)
                              }
                              placeholder="Enter search query..."
                              className="flex-1"
                            />
                            {searchQueries.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeSearchQuery(id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Step 4: Results */}
              <TabsContent value="step-4" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">
                      Step 4: View Results
                    </h3>
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Access your search results and manage your search
                        history.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          View detailed matching results
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Access search history
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Download results
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Results Demo */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Search Results
                        </CardTitle>
                        <CardDescription>
                          Found 23 matches in your dataset
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Query: "john.doe@example.com"</span>
                            <Badge variant="secondary">8 matches</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Query: "jane.smith@company.com"</span>
                            <Badge variant="secondary">15 matches</Badge>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline">
                              <Download className="mr-1 h-3 w-3" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Search History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Customer Email Verification</span>
                            <span className="text-gray-500">2 hours ago</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Product Name Search</span>
                            <span className="text-gray-500">Yesterday</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Address Validation</span>
                            <span className="text-gray-500">2 days ago</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <div className="flex items-center justify-between border-t pt-6">
              <Button
                variant="outline"
                onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                disabled={activeStep === 1}
              >
                Previous Step
              </Button>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-2 w-2 rounded-full ${
                      step === activeStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <Button
                onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
                disabled={activeStep === 4}
              >
                Next Step
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Features */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Administrators can manage users, reset passwords, and control
                access permissions.
              </p>
              <ul className="space-y-1 text-sm">
                <li>• View user activity and statistics</li>
                <li>• Unlock accounts and resend verification emails</li>
                <li>• Manage user roles and permissions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Additional features for power users and advanced data
                processing.
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Dark/light theme switching</li>
                <li>• Real-time processing status updates</li>
                <li>• Comprehensive search history</li>
                <li>• Batch processing capabilities</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="py-8 text-center">
            <h3 className="mb-4 text-xl font-semibold">
              Ready to Get Started?
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Now that you understand how the system works, contact your
              administrator for account access to start processing your CSV
              files!
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
