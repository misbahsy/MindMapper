'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { NodeData } from '@/app/types/types'
import { Button } from '@/components/ui/button'
import { toPng } from 'html-to-image'
import { Download, ZoomIn, ZoomOut, RefreshCw, Maximize2, Minimize2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface MindMapProps {
  data: NodeData
  onNodeClick?: (node: NodeData) => void
}

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
  },
})

export default function MindMap({ data, onNodeClick }: MindMapProps) {
  const mermaidRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRendered, setIsRendered] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Generate a unique ID for detail nodes
  const generateDetailNodeId = (nodeId: string, index: number = 0) => `${nodeId}_detail_${index}`

  // Escape special characters in Mermaid labels
  const escapeLabel = (text: string): string => {
    // Replace quotes with escaped quotes to prevent syntax errors
    return text.replace(/"/g, '\\"')
  }

  // Convert NodeData to Mermaid flowchart syntax
  const generateMermaidDiagram = (node: NodeData, level = 0): string => {
    let diagram = ''
    const indent = '  '.repeat(level)
    
    // Create node
    diagram += `${indent}${node.id}["${escapeLabel(node.label)}"]`
    
    // Add details as leaf nodes if they exist
    if (node.details) {
      if (Array.isArray(node.details)) {
        node.details.forEach((detail, index) => {
          const detailNodeId = generateDetailNodeId(node.id, index)
          // Create a details node
          diagram += `\n${indent}${detailNodeId}["${escapeLabel(detail)}"]:::detailNode`
          // Connect the original node to its detail node
          diagram += `\n${indent}${node.id} --> ${detailNodeId}`
        })
      } else {
        // Handle string details (single detail)
        const detailNodeId = generateDetailNodeId(node.id)
        diagram += `\n${indent}${detailNodeId}["${escapeLabel(node.details)}"]:::detailNode`
        diagram += `\n${indent}${node.id} --> ${detailNodeId}`
      }
    }
    
    // Create connections to children
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        diagram += '\n'
        diagram += `${indent}${node.id} --> ${child.id}`
        diagram += '\n'
        diagram += generateMermaidDiagram(child, level + 1)
      })
    }
    
    return diagram
  }

  // Save scroll position when scrolling
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition({
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop
      })
    }
  }

  // Restore scroll position
  const restoreScrollPosition = () => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollPosition.x
      containerRef.current.scrollTop = scrollPosition.y
    }
  }

  useEffect(() => {
    if (!mermaidRef.current || !data.id) return

    const diagram = `
      flowchart LR
      %% Define custom classes for styling
      classDef default fill:#f9f9f9,stroke:#333,stroke-width:1px
      classDef detailNode fill:#e6f7ff,stroke:#69c0ff,stroke-width:1px
      ${generateMermaidDiagram(data)}
    `

    // Clear previous diagram
    mermaidRef.current.innerHTML = ''
    setIsRendered(false)
    // Reset zoom and position when new data is loaded
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })

    try {
      mermaid.render('mindmap', diagram).then(({ svg }) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg
          
          // Add event listeners to nodes
          if (onNodeClick) {
            const nodes = mermaidRef.current.querySelectorAll('.node')
            nodes.forEach((node) => {
              // Skip detail nodes for click events
              if (!node.id.includes('_detail')) {
                node.addEventListener('click', (e) => {
                  // Prevent default behavior to avoid scrolling
                  e.preventDefault()
                  e.stopPropagation()
                  
                  // Save current scroll position
                  handleScroll()
                  
                  if (!isDragging) {
                    const nodeId = node.id.split('-')[1]
                    const clickedNode = findNodeById(data, nodeId)
                    if (clickedNode) {
                      onNodeClick(clickedNode)
                    }
                  }
                })
              }
            })
          }
          
          // Apply class to detail nodes
          const detailNodes = mermaidRef.current.querySelectorAll('[id*="_detail_"]')
          detailNodes.forEach(node => {
            node.classList.add('detailNode')
          })
          
          setIsRendered(true)
        }
      })
    } catch (error) {
      console.error('Failed to render mermaid diagram:', error)
    }
    
    // Add scroll event listener to container
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll)
    }
    
    // Clean up event listener
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', handleScroll)
      }
    }
  }, [data, onNodeClick])

  // Helper function to find a node by ID
  const findNodeById = (node: NodeData, id: string): NodeData | undefined => {
    if (node.id === id) return node
    if (!node.children) return undefined
    
    for (const child of node.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }
    
    return undefined
  }

  // Function to handle zooming in
  const zoomIn = () => {
    // Save scroll position before zooming
    handleScroll()
    setZoomLevel(prev => Math.min(prev + 0.1, 3))
    // Restore scroll position after zooming
    setTimeout(restoreScrollPosition, 0)
  }

  // Function to handle zooming out
  const zoomOut = () => {
    // Save scroll position before zooming
    handleScroll()
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5))
    // Restore scroll position after zooming
    setTimeout(restoreScrollPosition, 0)
  }

  // Function to reset zoom and position
  const resetView = () => {
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
    // Reset scroll position
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0
      containerRef.current.scrollTop = 0
    }
  }

  // Function to handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent default to avoid text selection during drag
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    // Save current scroll position
    handleScroll()
  }

  // Function to handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  // Function to handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Function to handle mouse leave to stop dragging
  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // Function to download the mind map as an image
  const downloadImage = async () => {
    if (!mermaidRef.current) return
    
    try {
      // Get the SVG element
      const svgElement = mermaidRef.current.querySelector('svg')
      if (!svgElement) {
        throw new Error('SVG element not found')
      }
      
      // Get the SVG's bounding box
      const bbox = svgElement.getBBox()
      
      // Add margin to the bounding box (40px on each side)
      const margin = 40
      const totalWidth = bbox.width + (margin * 2)
      const totalHeight = bbox.height + (margin * 2)
      
      // Create a temporary wrapper div for the SVG
      const wrapper = document.createElement('div')
      wrapper.style.position = 'absolute'
      wrapper.style.left = '-9999px'
      wrapper.style.top = '-9999px'
      document.body.appendChild(wrapper)
      
      // Clone the SVG content
      const svgClone = svgElement.cloneNode(true) as SVGElement
      
      // Set attributes to ensure the entire diagram is captured with margins
      svgClone.setAttribute('width', `${totalWidth}px`)
      svgClone.setAttribute('height', `${totalHeight}px`)
      svgClone.setAttribute('viewBox', `${bbox.x - margin} ${bbox.y - margin} ${totalWidth} ${totalHeight}`)
      
      // Apply font styles
      const textElements = svgClone.querySelectorAll('text')
      textElements.forEach(text => {
        text.setAttribute('font-family', 'Arial, sans-serif')
      })
      
      // Add the cloned SVG to the wrapper
      wrapper.appendChild(svgClone)
      
      // Create a new wrapper div that will be converted to image
      const imageWrapper = document.createElement('div')
      imageWrapper.style.width = `${totalWidth}px`
      imageWrapper.style.height = `${totalHeight}px`
      imageWrapper.style.background = 'white'
      imageWrapper.style.padding = `${margin}px`
      imageWrapper.style.boxSizing = 'border-box'
      imageWrapper.innerHTML = svgClone.outerHTML
      wrapper.appendChild(imageWrapper)
      
      // Convert to PNG
      const dataUrl = await toPng(imageWrapper, {
        backgroundColor: 'white',
        quality: 1,
        pixelRatio: 2,
        skipFonts: true
      })
      
      // Clean up
      document.body.removeChild(wrapper)
      
      // Create download link
      const link = document.createElement('a')
      link.download = `mindmap-${new Date().toISOString().slice(0, 10)}.png`
      link.href = dataUrl
      link.click()
      
      toast({
        title: "Success",
        description: "Mind map downloaded successfully",
      })
    } catch (error) {
      console.error('Error generating image:', error)
      
      // Fallback method using canvas
      try {
        if (mermaidRef.current) {
          const svgElement = mermaidRef.current.querySelector('svg')
          if (!svgElement) {
            throw new Error('SVG element not found')
          }
          
          // Get the SVG's bounding box
          const bbox = svgElement.getBBox()
          
          // Add margin to the bounding box (40px on each side)
          const margin = 40
          const totalWidth = bbox.width + (margin * 2)
          const totalHeight = bbox.height + (margin * 2)
          
          // Create a canvas element
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          
          // Set canvas dimensions to match the SVG's bounding box plus margins
          canvas.width = totalWidth * 2
          canvas.height = totalHeight * 2
          
          if (!context) {
            throw new Error('Could not get canvas context')
          }
          
          // Draw white background
          context.fillStyle = 'white'
          context.fillRect(0, 0, canvas.width, canvas.height)
          
          // Clone the SVG and set its dimensions with margins
          const clonedSvg = svgElement.cloneNode(true) as SVGElement
          clonedSvg.setAttribute('width', `${totalWidth}px`)
          clonedSvg.setAttribute('height', `${totalHeight}px`)
          clonedSvg.setAttribute('viewBox', `${bbox.x - margin} ${bbox.y - margin} ${totalWidth} ${totalHeight}`)
          
          // Convert SVG to XML string
          const svgData = new XMLSerializer().serializeToString(clonedSvg)
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
          const svgUrl = URL.createObjectURL(svgBlob)
          
          // Create image from SVG
          const img = new Image()
          img.onload = () => {
            // Draw the image on the canvas with margins
            context.drawImage(img, margin * 2, margin * 2, canvas.width - (margin * 4), canvas.height - (margin * 4))
            
            // Convert canvas to data URL
            const dataUrl = canvas.toDataURL('image/png')
            
            // Revoke the object URL to free memory
            URL.revokeObjectURL(svgUrl)
            
            // Create download link
            const link = document.createElement('a')
            link.download = `mindmap-${new Date().toISOString().slice(0, 10)}.png`
            link.href = dataUrl
            link.click()
            
            toast({
              title: "Success",
              description: "Mind map downloaded successfully (fallback method)",
            })
          }
          
          // Set the source of the image to the SVG URL
          img.src = svgUrl
        }
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError)
        toast({
          title: "Error",
          description: "Failed to download mind map. Try taking a screenshot instead.",
          variant: "destructive"
        })
      }
    }
  }

  // Toggle full screen
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
    // Reset zoom and position when toggling full screen
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0
      containerRef.current.scrollTop = 0
    }
  }

  // Mind Map empty state
  if (!data.id || !data.children?.length) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white font-system">
        <div className="text-center space-y-3 max-w-[400px] height-auto mx-auto p-8">
          <div className="h-12 w-12 text-zinc-300 mx-auto mb-6">📄</div>
          <h3 className="text-xl font-medium">No Mind Map Yet</h3>
          <p className="text-sm text-zinc-400 pb-4">
            Enter a URL, YouTube link, or prompt to generate an interactive mind map.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : 'w-full h-full'}`}>
      <div className="flex justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <Button 
            onClick={zoomIn} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <ZoomIn size={16} />
            Zoom In
          </Button>
          <Button 
            onClick={zoomOut} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <ZoomOut size={16} />
            Zoom Out
          </Button>
          <Button 
            onClick={resetView} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <RefreshCw size={16} />
            Reset
          </Button>
          <div className="text-sm text-gray-500 ml-2">
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={toggleFullScreen} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          </Button>
          <Button 
            onClick={downloadImage} 
            disabled={!isRendered}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Download
          </Button>
        </div>
      </div>
      <div 
        ref={containerRef} 
        className={`w-full overflow-auto bg-white p-4 cursor-grab ${isFullScreen ? 'flex-1' : 'h-full'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onScroll={handleScroll}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          ref={mermaidRef} 
          className="min-w-full min-h-full" 
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease'
          }}
        />
      </div>
    </div>
  )
} 