import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Canvas } from '@/components/Canvas';
import { ToolSidebar } from '@/components/ToolSidebar';
import { ToolProperties } from '@/components/ToolProperties';
import { PageManager } from '@/components/PageManager';
import { VideoExportModal } from '@/components/VideoExportModal';
import { CanvasCreationModal } from '@/components/CanvasCreationModal';
import { ExportProgressModal } from '@/components/ExportProgressModal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCanvas } from '@/hooks/useCanvas';
import { ToolType, DEFAULT_TOOLS } from '@/types/tools';
import { Canvas as CanvasType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { PenTool, Plus, Save, FolderOpen, Video, Moon, Settings, Undo2, Redo2, Clock, Play, Download } from 'lucide-react';

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showVideoExport, setShowVideoExport] = useState(false);
  const [showCanvasCreation, setShowCanvasCreation] = useState(false);
  const [showExportProgress, setShowExportProgress] = useState(false);
  const [currentCanvasId, setCurrentCanvasId] = useState<number | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { canvasRef, state, updateSettings, addStroke, undo, redo, clearCanvas, canUndo, canRedo } = useCanvas();

  // Fetch canvases
  const { data: canvases = [] } = useQuery({
    queryKey: ['/api/canvases'],
    retry: false
  });

  // Fetch current canvas
  const { data: currentCanvas } = useQuery({
    queryKey: ['/api/canvases', currentCanvasId],
    enabled: currentCanvasId !== null,
    retry: false
  });

  // Create canvas mutation
  const createCanvasMutation = useMutation({
    mutationFn: async (canvasData: any) => {
      const response = await apiRequest('POST', '/api/canvases', canvasData);
      return response.json();
    },
    onSuccess: (newCanvas: CanvasType) => {
      queryClient.invalidateQueries({ queryKey: ['/api/canvases'] });
      setCurrentCanvasId(newCanvas.id);
      setShowCanvasCreation(false);
      toast({
        title: 'Canvas Created',
        description: 'Your new canvas has been created successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create canvas. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Save canvas mutation
  const saveCanvasMutation = useMutation({
    mutationFn: async (canvasData: any) => {
      const response = await apiRequest('PUT', `/api/canvases/${currentCanvasId}`, canvasData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/canvases'] });
      toast({
        title: 'Canvas Saved',
        description: 'Your canvas has been saved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save canvas. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Auto-save functionality
  useEffect(() => {
    if (currentCanvasId && state.strokes.length > 0) {
      const autoSaveInterval = setInterval(() => {
        const canvasData = {
          name: currentCanvas?.name || 'Untitled Canvas',
          width: currentCanvas?.width || 595,
          height: currentCanvas?.height || 842,
          backgroundColor: currentCanvas?.backgroundColor || '#ffffff',
          backgroundType: currentCanvas?.backgroundType || 'solid',
          pages: currentCanvas?.pages || []
        };
        
        saveCanvasMutation.mutate(canvasData);
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [currentCanvasId, state.strokes, saveCanvasMutation]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      document.documentElement.classList.toggle('dark', newMode);
      return newMode;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            if (currentCanvasId) {
              saveCanvasMutation.mutate({
                name: currentCanvas?.name || 'Untitled Canvas',
                width: currentCanvas?.width || 595,
                height: currentCanvas?.height || 842,
                backgroundColor: currentCanvas?.backgroundColor || '#ffffff',
                backgroundType: currentCanvas?.backgroundType || 'solid',
                pages: currentCanvas?.pages || []
              });
            }
            break;
          case 'n':
            e.preventDefault();
            setShowCanvasCreation(true);
            break;
        }
      }

      // Tool shortcuts
      switch (e.key) {
        case 'b':
          setCurrentTool('brush');
          break;
        case 'p':
          setCurrentTool('pen');
          break;
        case 'e':
          setCurrentTool('eraser');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveCanvasMutation, currentCanvasId, currentCanvas]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNewCanvas = () => {
    setShowCanvasCreation(true);
  };

  const handleSaveCanvas = () => {
    if (currentCanvasId) {
      saveCanvasMutation.mutate({
        name: currentCanvas?.name || 'Untitled Canvas',
        width: currentCanvas?.width || 595,
        height: currentCanvas?.height || 842,
        backgroundColor: currentCanvas?.backgroundColor || '#ffffff',
        backgroundType: currentCanvas?.backgroundType || 'solid',
        pages: currentCanvas?.pages || []
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <PenTool className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-bold">NoteStroke</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={handleNewCanvas} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} className="mr-2" />
              New Canvas
            </Button>
            <Button variant="outline" onClick={() => setShowCanvasCreation(true)}>
              <FolderOpen size={16} className="mr-2" />
              Open
            </Button>
            <Button variant="outline" onClick={handleSaveCanvas}>
              <Save size={16} className="mr-2" />
              Save
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setShowVideoExport(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Video size={16} className="mr-2" />
            Export Video
          </Button>
          
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            <Moon size={16} />
          </Button>
          
          <Button variant="ghost" size="sm">
            <Settings size={16} />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Tools */}
        <ToolSidebar
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          tools={DEFAULT_TOOLS}
        />

        {/* Tool Properties Panel */}
        <ToolProperties
          currentTool={currentTool}
          settings={state.settings}
          onSettingsChange={updateSettings}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Toolbar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{currentCanvas?.name || 'Untitled Canvas'}</span>
                {currentCanvas && (
                  <span> - {currentCanvas.width}×{currentCanvas.height}px</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo}>
                  <Undo2 size={16} className="mr-1" />
                  Undo
                </Button>
                <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo}>
                  <Redo2 size={16} className="mr-1" />
                  Redo
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                <span>Recording: {formatTime(recordingDuration)}</span>
              </div>
              
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Canvas */}
          <Canvas
            ref={canvasRef}
            canvasId={currentCanvasId}
            pageIndex={currentPageIndex}
            currentTool={currentTool}
            settings={state.settings}
            onStrokeComplete={addStroke}
            onDrawingStateChange={setIsRecording}
            strokes={state.strokes}
          />
        </div>
      </div>

      {/* Bottom Panel - Pages */}
      <PageManager
        canvasId={currentCanvasId}
        currentPageIndex={currentPageIndex}
        onPageChange={setCurrentPageIndex}
        onPreviewAnimation={() => {}}
        onExportAll={() => setShowVideoExport(true)}
      />

      {/* Modals */}
      <VideoExportModal
        isOpen={showVideoExport}
        onClose={() => setShowVideoExport(false)}
        onExport={(settings) => {
          setShowVideoExport(false);
          setShowExportProgress(true);
          // Handle export
        }}
        strokes={state.strokes}
      />

      <CanvasCreationModal
        isOpen={showCanvasCreation}
        onClose={() => setShowCanvasCreation(false)}
        onCreateCanvas={(canvasData) => {
          createCanvasMutation.mutate(canvasData);
        }}
      />

      <ExportProgressModal
        isOpen={showExportProgress}
        onClose={() => setShowExportProgress(false)}
        onCancel={() => setShowExportProgress(false)}
        progress={{
          stage: 'preparing',
          progress: 0,
          currentFrame: 0,
          totalFrames: 0,
          timeRemaining: 0,
          message: 'Preparing export...'
        }}
      />
    </div>
  );
}
