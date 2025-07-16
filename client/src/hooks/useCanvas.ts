import { useState, useCallback, useRef, useEffect } from 'react';
import { CanvasSettings } from '@/types/canvas';
import { StrokeData } from '@/types/tools';

export interface CanvasState {
  settings: CanvasSettings;
  strokes: StrokeData[];
  undoStack: StrokeData[][];
  redoStack: StrokeData[][];
  isDrawing: boolean;
  currentStrokeId: string | null;
}

const defaultSettings: CanvasSettings = {
  showGrid: false,
  showRulers: false,
  snapToGrid: false,
  gridSize: 20,
  gridColor: '#e5e7eb',
  gridOpacity: 50,
  zoom: 1,
  panX: 0,
  panY: 0
};

export function useCanvas() {
  const [state, setState] = useState<CanvasState>({
    settings: defaultSettings,
    strokes: [],
    undoStack: [],
    redoStack: [],
    isDrawing: false,
    currentStrokeId: null
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current && !ctxRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d');
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<CanvasSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, []);

  const addStroke = useCallback((stroke: StrokeData) => {
    setState(prev => {
      const newStrokes = [...prev.strokes, stroke];
      const newUndoStack = [...prev.undoStack, prev.strokes];
      
      // Limit undo stack size
      if (newUndoStack.length > 100) {
        newUndoStack.shift();
      }
      
      return {
        ...prev,
        strokes: newStrokes,
        undoStack: newUndoStack,
        redoStack: [], // Clear redo stack when new action is performed
        isDrawing: false,
        currentStrokeId: null
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.undoStack.length === 0) return prev;
      
      const previousStrokes = prev.undoStack[prev.undoStack.length - 1];
      const newUndoStack = prev.undoStack.slice(0, -1);
      const newRedoStack = [...prev.redoStack, prev.strokes];
      
      return {
        ...prev,
        strokes: previousStrokes,
        undoStack: newUndoStack,
        redoStack: newRedoStack
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.redoStack.length === 0) return prev;
      
      const nextStrokes = prev.redoStack[prev.redoStack.length - 1];
      const newRedoStack = prev.redoStack.slice(0, -1);
      const newUndoStack = [...prev.undoStack, prev.strokes];
      
      return {
        ...prev,
        strokes: nextStrokes,
        undoStack: newUndoStack,
        redoStack: newRedoStack
      };
    });
  }, []);

  const clearCanvas = useCallback(() => {
    setState(prev => ({
      ...prev,
      strokes: [],
      undoStack: [...prev.undoStack, prev.strokes],
      redoStack: []
    }));
  }, []);

  const setDrawingState = useCallback((isDrawing: boolean, strokeId?: string) => {
    setState(prev => ({
      ...prev,
      isDrawing,
      currentStrokeId: strokeId || null
    }));
  }, []);

  const zoom = useCallback((factor: number, centerX?: number, centerY?: number) => {
    setState(prev => {
      const newZoom = Math.max(0.1, Math.min(5, prev.settings.zoom * factor));
      
      if (centerX !== undefined && centerY !== undefined) {
        // Zoom towards the specified point
        const deltaX = centerX - prev.settings.panX;
        const deltaY = centerY - prev.settings.panY;
        
        const newPanX = centerX - deltaX * (newZoom / prev.settings.zoom);
        const newPanY = centerY - deltaY * (newZoom / prev.settings.zoom);
        
        return {
          ...prev,
          settings: {
            ...prev.settings,
            zoom: newZoom,
            panX: newPanX,
            panY: newPanY
          }
        };
      }
      
      return {
        ...prev,
        settings: {
          ...prev.settings,
          zoom: newZoom
        }
      };
    });
  }, []);

  const pan = useCallback((deltaX: number, deltaY: number) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        panX: prev.settings.panX + deltaX,
        panY: prev.settings.panY + deltaY
      }
    }));
  }, []);

  const resetView = useCallback(() => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        zoom: 1,
        panX: 0,
        panY: 0
      }
    }));
  }, []);

  const canUndo = state.undoStack.length > 0;
  const canRedo = state.redoStack.length > 0;

  return {
    canvasRef,
    state,
    updateSettings,
    addStroke,
    undo,
    redo,
    clearCanvas,
    setDrawingState,
    zoom,
    pan,
    resetView,
    canUndo,
    canRedo
  };
}
