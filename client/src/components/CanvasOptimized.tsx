import { forwardRef, useEffect, useRef, useState, useImperativeHandle } from 'react';
import { ToolType, StrokeData, ToolSettings } from '@/types/tools';
import { OptimizedStrokeEngine } from '@/lib/stroke-engine-optimized';

interface CanvasProps {
  canvasId: number | null;
  pageIndex: number;
  currentTool: ToolType;
  onStrokeComplete: (stroke: StrokeData) => void;
  onDrawingStateChange: (isDrawing: boolean) => void;
  strokes: StrokeData[];
  toolSettings: {
    size: number;
    opacity: number;
    color: string;
    smoothing: number;
    pressureSensitive: boolean;
    snapToGrid?: boolean;
    gridSize?: number;
  };
  onDrawingStart?: () => void;
  onDrawingEnd?: () => void;
}

export interface CanvasRef {
  exportImage: () => string;
  clearCanvas: () => void;
}

export const CanvasOptimized = forwardRef<CanvasRef, CanvasProps>(({
  canvasId,
  pageIndex,
  currentTool,
  onStrokeComplete,
  onDrawingStateChange,
  strokes,
  toolSettings,
  onDrawingStart,
  onDrawingEnd
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokeEngineRef = useRef<OptimizedStrokeEngine | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize stroke engine
  useEffect(() => {
    if (canvasRef.current && !strokeEngineRef.current) {
      strokeEngineRef.current = new OptimizedStrokeEngine(canvasRef.current);
    }
  }, []);

  // Update strokes when they change
  useEffect(() => {
    if (strokeEngineRef.current) {
      strokeEngineRef.current.setStrokes(strokes);
    }
  }, [strokes]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    exportImage: () => {
      return canvasRef.current?.toDataURL() || '';
    },
    clearCanvas: () => {
      if (strokeEngineRef.current) {
        strokeEngineRef.current.clearCanvas();
      }
    }
  }));

  const getEventPoint = (event: React.PointerEvent): { x: number; y: number; pressure: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const pressure = event.pressure || 0.5;

    return { x, y, pressure };
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!strokeEngineRef.current || !canvasId) return;

    const { x, y, pressure } = getEventPoint(event);
    
    const point = {
      x,
      y,
      timestamp: performance.now(),
      pressure
    };

    const settings: ToolSettings = {
      ...toolSettings,
      tool: currentTool,
      size: toolSettings.size,
      color: toolSettings.color, // This ensures each stroke gets its own color
      opacity: toolSettings.opacity,
      pressureSensitive: toolSettings.pressureSensitive,
      smoothing: toolSettings.smoothing
    };

    strokeEngineRef.current.startStroke(point, settings, canvasId, pageIndex);
    
    setIsDrawing(true);
    onDrawingStateChange(true);
    onDrawingStart?.();
    
    event.preventDefault();
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!isDrawing || !strokeEngineRef.current) return;

    const { x, y, pressure } = getEventPoint(event);
    
    const point = {
      x,
      y,
      timestamp: performance.now(),
      pressure
    };

    strokeEngineRef.current.addPointToStroke(point);
    event.preventDefault();
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    if (!isDrawing || !strokeEngineRef.current) return;

    const completedStroke = strokeEngineRef.current.finishStroke();
    
    if (completedStroke) {
      onStrokeComplete(completedStroke);
    }

    setIsDrawing(false);
    onDrawingStateChange(false);
    onDrawingEnd?.();
    
    event.preventDefault();
  };

  return (
    <div className="relative w-full h-full bg-white">
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="border border-gray-200 cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
});

CanvasOptimized.displayName = 'CanvasOptimized';