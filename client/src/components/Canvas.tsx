import { forwardRef, useEffect, useRef, useState, useImperativeHandle } from 'react';
import { useStrokeRecording } from '@/hooks/useStrokeRecording';
import { ToolType, StrokeData, ToolSettings } from '@/types/tools';
import { CanvasSettings } from '@/types/canvas';
import { getCanvasCoordinates, snapToGrid, drawGrid, drawRulers } from '@/lib/canvas-utils';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasProps {
  canvasId: number | null;
  pageIndex: number;
  currentTool: ToolType;
  settings: CanvasSettings;
  onStrokeComplete: (stroke: StrokeData) => void;
  onDrawingStateChange: (isDrawing: boolean) => void;
  strokes: StrokeData[];
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({
  canvasId,
  pageIndex,
  currentTool,
  settings,
  onStrokeComplete,
  onDrawingStateChange,
  strokes
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null);

  const {
    isRecording,
    startRecording,
    continueRecording,
    stopRecording,
    createPoint,
    clearCanvas,
    renderStroke
  } = useStrokeRecording(canvasRef.current);

  useImperativeHandle(ref, () => canvasRef.current!);

  // Tool settings with minimal smoothing
  const toolSettings: ToolSettings = {
    size: 3,
    opacity: 100,
    color: '#000000',
    pressureSensitive: true,
    smoothing: 0, // No smoothing by default for better writing experience
    lineCap: 'round',
    lineJoin: 'round'
  };

  // Setup canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d')!;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Make canvas fill the container
    const containerRect = container.getBoundingClientRect();
    canvas.width = containerRect.width * pixelRatio;
    canvas.height = containerRect.height * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
    canvas.style.width = containerRect.width + 'px';
    canvas.style.height = containerRect.height + 'px';

    // Enable hardware acceleration
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Set initial background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Render strokes
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid if enabled
    drawGrid(ctx, settings, canvas.width, canvas.height);
    
    // Draw rulers if enabled
    drawRulers(ctx, settings, canvas.width, canvas.height);
    
    // Render all strokes
    strokes.forEach(stroke => {
      if (stroke.pageIndex === pageIndex) {
        renderStroke(stroke, toolSettings);
      }
    });
  }, [strokes, pageIndex, settings, renderStroke, toolSettings]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !canvasId) return;

    const coords = getCanvasCoordinates(e.nativeEvent, canvasRef.current, settings);
    const snappedCoords = snapToGrid(coords.x, coords.y, settings);

    if (currentTool === 'hand' || e.button === 1) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (currentTool === 'eraser' || currentTool === 'pen' || currentTool === 'brush') {
      const point = createPoint(snappedCoords.x, snappedCoords.y, e.pressure || 1);
      startRecording(point, currentTool, toolSettings, canvasId, pageIndex);
      setIsDrawing(true);
      onDrawingStateChange(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    if (isPanning && lastPanPoint) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      // Update pan position
      const newSettings = {
        ...settings,
        panX: settings.panX + deltaX,
        panY: settings.panY + deltaY
      };
      
      // This would need to be passed up to parent
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isDrawing && isRecording) {
      const coords = getCanvasCoordinates(e.nativeEvent, canvasRef.current, settings);
      const snappedCoords = snapToGrid(coords.x, coords.y, settings);
      const point = createPoint(snappedCoords.x, snappedCoords.y, e.pressure || 1);
      
      continueRecording(point, toolSettings);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      setLastPanPoint(null);
      return;
    }

    if (isDrawing && isRecording) {
      const completedStroke = stopRecording();
      if (completedStroke) {
        onStrokeComplete(completedStroke);
      }
      setIsDrawing(false);
      onDrawingStateChange(false);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvasRef.current || !canvasId) return;

    const touch = e.touches[0];
    const coords = getCanvasCoordinates(touch, canvasRef.current, settings);
    const snappedCoords = snapToGrid(coords.x, coords.y, settings);

    if (currentTool !== 'hand') {
      const point = createPoint(snappedCoords.x, snappedCoords.y, touch.force || 1);
      startRecording(point, currentTool, toolSettings, canvasId, pageIndex);
      setIsDrawing(true);
      onDrawingStateChange(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvasRef.current || !isDrawing || !isRecording) return;

    const touch = e.touches[0];
    const coords = getCanvasCoordinates(touch, canvasRef.current, settings);
    const snappedCoords = snapToGrid(coords.x, coords.y, settings);
    const point = createPoint(snappedCoords.x, snappedCoords.y, touch.force || 1);
    
    continueRecording(point, toolSettings);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isDrawing && isRecording) {
      const completedStroke = stopRecording();
      if (completedStroke) {
        onStrokeComplete(completedStroke);
      }
      setIsDrawing(false);
      onDrawingStateChange(false);
    }
  };

  // Wheel event for zooming
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    if (e.ctrlKey) {
      // Zoom
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = e.clientX - rect.left;
        const centerY = e.clientY - rect.top;
        // Zoom logic would need to be implemented in parent
      }
    } else {
      // Pan
      const deltaX = e.deltaX;
      const deltaY = e.deltaY;
      // Pan logic would need to be implemented in parent
    }
  };

  const handleZoomIn = () => {
    // Zoom in logic
  };

  const handleZoomOut = () => {
    // Zoom out logic
  };

  return (
    <div className="flex-1 canvas-area relative overflow-hidden" ref={containerRef}>
      {/* Canvas */}
      <div className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className={`w-full h-full bg-white ${
            currentTool === 'pen' ? 'cursor-pen' : 
            currentTool === 'eraser' ? 'cursor-eraser' :
            currentTool === 'hand' ? 'cursor-grab' :
            'cursor-crosshair'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{
            transform: `scale(${settings.zoom}) translate(${settings.panX}px, ${settings.panY}px)`,
            transformOrigin: 'center'
          }}
        />
        
        {/* Canvas Overlay Info */}
        <div className="absolute top-4 left-4 glass-effect dark:glass-effect-dark rounded-lg p-2">
          <div className="text-xs text-gray-700 dark:text-gray-300">
            <div>Page {pageIndex + 1}</div>
            <div>Strokes: {strokes.filter(s => s.pageIndex === pageIndex).length}</div>
          </div>
        </div>
      </div>
      
      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 glass-effect dark:glass-effect-dark rounded-lg p-2 flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={handleZoomOut}>
          <ZoomOut size={16} />
        </Button>
        <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[40px] text-center">
          {Math.round(settings.zoom * 100)}%
        </span>
        <Button size="sm" variant="ghost" onClick={handleZoomIn}>
          <ZoomIn size={16} />
        </Button>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';
