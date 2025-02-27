'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { generateMindMap } from './services/api'
import { NodeData } from './types/types'
import MindMap from '@/components/MindMap'
import NodeDetails from '@/components/NodeDetails'
import { toast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'

export default function Home() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mindMapData, setMindMapData] = useState<NodeData>({} as NodeData)
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [activeTab, setActiveTab] = useState('url')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL, YouTube link, or prompt",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    setMindMapData({} as NodeData)
    setSelectedNode(null)
    
    try {
      const data = await generateMindMap(input)
      console.log(data)
      setMindMapData(data)
      toast({
        title: "Success",
        description: "Mind map generated successfully",
      })
    } catch (error) {
      console.error('Error generating mind map:', error)
      toast({
        title: "Error",
        description: "Failed to generate mind map. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNodeClick = (node: NodeData) => {
    setSelectedNode(node)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setInput('')
  }

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'url':
        return 'Enter a URL (e.g., https://example.com/article)'
      case 'youtube':
        return 'Enter a YouTube link (e.g., https://youtube.com/watch?v=...)'
      case 'prompt':
        return 'Enter a prompt (e.g., Summarize the key concepts of quantum physics)'
      default:
        return 'Enter input'
    }
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mind Mapper</h1>
        <p className="text-gray-600">Generate interactive mind maps from URLs, YouTube videos, or text prompts</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <Tabs defaultValue="url" onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="youtube">YouTube</TabsTrigger>
                <TabsTrigger value="prompt">Prompt</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <Input
                    id="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={getPlaceholder()}
                    disabled={isLoading}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Generating...' : 'Generate Mind Map'}
                </Button>
              </form>
            </Tabs>
            
            {selectedNode && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Node Details</h3>
                <NodeDetails node={selectedNode} />
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-white rounded-lg border shadow-sm overflow-hidden h-[600px]">
          <MindMap data={mindMapData} onNodeClick={handleNodeClick} />
        </div>
      </div>
      
      <Toaster />
    </main>
  )
}
