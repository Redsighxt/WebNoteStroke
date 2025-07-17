import { StrokeData, Point, ToolType, ToolSettings } from '@/types/tools';
import { smoothPoints, createBezierPath, calculateDistance } from './canvas-utils';

export class StrokeEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private recordingStrokes: Map<string, StrokeData> = new Map();
  private currentStrokeId: string | null = null;
  private lastPoint: Point | null = null;
  private animationFrameId: number | null = null;
  private performanceMonitor: PerformanceMonitor;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.performanceMonitor = new PerformanceMonitor();
    this.setupCanvas();
  }

  private setupCanvas() {
    // Enable hardware acceleration
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Set up high DPI support
    const pixelRatio = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * pixelRatio;
    this.canvas.height = rect.height * pixelRatio;
    this.ctx.scale(pixelRatio, pixelRatio);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  startStroke(
    point: Point,
    tool: ToolType,
    settings: ToolSettings,
    canvasId: number,
    pageIndex: number
  ): string {
    const strokeId = `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const stroke: StrokeData = {
      id: strokeId,
      tool,
      color: settings.color,
      size: settings.size,
      opacity: settings.opacity,
      points: [point],
      startTime: point.timestamp,
      endTime: point.timestamp,
      canvasId,
      pageIndex
    };

    this.recordingStrokes.set(strokeId, stroke);
    this.currentStrokeId = strokeId;
    this.lastPoint = point;

    // Start performance monitoring
    this.performanceMonitor.startStroke();

    return strokeId;
  }

  continueStroke(point: Point, settings: ToolSettings): boolean {
    if (!this.currentStrokeId || !this.lastPoint) return false;

    const stroke = this.recordingStrokes.get(this.currentStrokeId);
    if (!stroke) return false;

    // Calculate minimum distance to reduce point density but not too much
    const minDistance = Math.max(0.5, settings.size * 0.05);
    const distance = calculateDistance(
      this.lastPoint.x,
      this.lastPoint.y,
      point.x,
      point.y
    );

    if (distance < minDistance) return false;

    // Add point to stroke
    stroke.points.push(point);
    stroke.endTime = point.timestamp;

    // Apply minimal smoothing only if enabled and not too aggressive
    if (settings.smoothing > 0 && settings.smoothing < 20) {
      const smoothingFactor = settings.smoothing / 100;
      const smoothedPoints = smoothPoints(stroke.points, smoothingFactor);
      stroke.points = smoothedPoints.map((p, i) => ({
        ...stroke.points[i],
        x: p.x,
        y: p.y
      }));
    }

    // Render stroke incrementally
    this.renderStrokeIncremental(stroke, settings);

    this.lastPoint = point;
    this.performanceMonitor.recordPoint();

    return true;
  }

  endStroke(): StrokeData | null {
    if (!this.currentStrokeId) return null;

    const stroke = this.recordingStrokes.get(this.currentStrokeId);
    if (!stroke) return null;

    // Final processing
    this.optimizeStroke(stroke);
    
    // Remove from recording map
    this.recordingStrokes.delete(this.currentStrokeId);
    
    this.currentStrokeId = null;
    this.lastPoint = null;

    this.performanceMonitor.endStroke();

    return stroke;
  }

  private renderStrokeIncremental(stroke: StrokeData, settings: ToolSettings) {
    if (stroke.points.length < 2) return;

    this.ctx.save();
    
    // Set up rendering context
    this.ctx.globalAlpha = settings.opacity / 100;
    this.ctx.strokeStyle = settings.color;
    this.ctx.lineWidth = settings.size;
    this.ctx.lineCap = settings.lineCap || 'round';
    this.ctx.lineJoin = settings.lineJoin || 'round';

    // Create path for the stroke
    const path = createBezierPath(stroke.points);
    
    // Apply tool-specific rendering
    switch (stroke.tool) {
      case 'pen':
        this.renderPen(path, settings);
        break;
      case 'pencil':
        this.renderPencil(path, settings);
        break;
      case 'brush':
        this.renderBrush(path, settings);
        break;
      case 'marker':
        this.renderMarker(path, settings);
        break;
      case 'fountain-pen':
        this.renderFountainPen(path, settings);
        break;
      case 'eraser':
        this.renderEraser(path, settings);
        break;
      default:
        this.ctx.stroke(path);
    }

    this.ctx.restore();
  }

  private renderPen(path: Path2D, settings: ToolSettings) {
    this.ctx.stroke(path);
  }

  private renderPencil(path: Path2D, settings: ToolSettings) {
    // Add texture effect for pencil
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.stroke(path);
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private renderBrush(path: Path2D, settings: ToolSettings) {
    // Variable width brush effect
    this.ctx.lineWidth = settings.size * 1.2;
    this.ctx.globalAlpha = (settings.opacity / 100) * 0.8;
    this.ctx.stroke(path);
  }

  private renderMarker(path: Path2D, settings: ToolSettings) {
    // Marker with slight transparency overlay
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.stroke(path);
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private renderFountainPen(path: Path2D, settings: ToolSettings) {
    // Fountain pen with variable width
    this.ctx.stroke(path);
  }

  private renderEraser(path: Path2D, settings: ToolSettings) {
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.stroke(path);
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private optimizeStroke(stroke: StrokeData) {
    // Remove redundant points
    const optimizedPoints: Point[] = [];
    
    if (stroke.points.length > 0) {
      optimizedPoints.push(stroke.points[0]);
      
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const prev = stroke.points[i - 1];
        const curr = stroke.points[i];
        const next = stroke.points[i + 1];
        
        // Check if point is necessary (not collinear with neighbors)
        const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
        const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
        const angleDiff = Math.abs(angle1 - angle2);
        
        if (angleDiff > 0.1) { // Threshold for angle difference
          optimizedPoints.push(curr);
        }
      }
      
      if (stroke.points.length > 1) {
        optimizedPoints.push(stroke.points[stroke.points.length - 1]);
      }
    }
    
    stroke.points = optimizedPoints;
  }

  renderStroke(stroke: StrokeData, settings?: ToolSettings) {
    if (stroke.points.length < 2) return;

    this.ctx.save();
    
    // Use stroke settings or provided settings
    const renderSettings = settings || {
      size: stroke.size,
      opacity: stroke.opacity,
      color: stroke.color,
      pressureSensitive: false,
      smoothing: 0,
      lineCap: 'round' as const,
      lineJoin: 'round' as const
    };

    this.ctx.globalAlpha = renderSettings.opacity / 100;
    this.ctx.strokeStyle = renderSettings.color;
    this.ctx.lineWidth = renderSettings.size;
    this.ctx.lineCap = renderSettings.lineCap || 'round';
    this.ctx.lineJoin = renderSettings.lineJoin || 'round';

    const path = createBezierPath(stroke.points);
    this.ctx.stroke(path);

    this.ctx.restore();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics();
  }
}

class PerformanceMonitor {
  private startTime: number = 0;
  private pointCount: number = 0;
  private strokeCount: number = 0;
  private lastFrameTime: number = 0;
  private frameRates: number[] = [];

  startStroke() {
    this.startTime = performance.now();
    this.pointCount = 0;
  }

  recordPoint() {
    this.pointCount++;
    
    const now = performance.now();
    if (this.lastFrameTime > 0) {
      const frameRate = 1000 / (now - this.lastFrameTime);
      this.frameRates.push(frameRate);
      
      // Keep only recent frame rates
      if (this.frameRates.length > 60) {
        this.frameRates.shift();
      }
    }
    this.lastFrameTime = now;
  }

  endStroke() {
    this.strokeCount++;
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    
    // Log performance if below target
    if (duration > 16) { // 60fps target
      console.warn(`Stroke rendering exceeded 16ms: ${duration.toFixed(2)}ms`);
    }
  }

  getMetrics() {
    const avgFrameRate = this.frameRates.length > 0 
      ? this.frameRates.reduce((a, b) => a + b, 0) / this.frameRates.length 
      : 0;
    
    return {
      strokeCount: this.strokeCount,
      averageFrameRate: avgFrameRate,
      currentFrameRate: this.frameRates[this.frameRates.length - 1] || 0,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
    };
  }
}
