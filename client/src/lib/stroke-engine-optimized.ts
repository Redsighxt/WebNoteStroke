import { Point, StrokeData, ToolSettings, ToolType } from '@/types/tools';

// Fast performance stroke engine with immediate rendering
export class OptimizedStrokeEngine {
  private ctx: CanvasRenderingContext2D;
  private currentStroke: StrokeData | null = null;
  private allStrokes: StrokeData[] = [];
  private lastRenderTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = context;
    
    // Optimize canvas for performance
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.imageSmoothingEnabled = true;
  }

  startStroke(point: Point, settings: ToolSettings, canvasId: number, pageIndex: number): StrokeData {
    const strokeId = `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create new stroke with individual color data
    this.currentStroke = {
      id: strokeId,
      tool: settings.tool || 'pen',
      color: settings.color, // Store the color at stroke creation time
      size: settings.size,
      opacity: settings.opacity,
      points: [point],
      startTime: point.timestamp,
      endTime: point.timestamp,
      canvasId,
      pageIndex
    };

    // Set up rendering context for this stroke
    this.ctx.save();
    this.ctx.globalAlpha = this.currentStroke.opacity / 100;
    this.ctx.strokeStyle = this.currentStroke.color;
    this.ctx.lineWidth = this.currentStroke.size;
    this.ctx.beginPath();
    this.ctx.moveTo(point.x, point.y);

    return this.currentStroke;
  }

  addPointToStroke(point: Point): StrokeData {
    if (!this.currentStroke) {
      throw new Error('No active stroke to add points to');
    }

    const stroke = this.currentStroke;
    const prevPoint = stroke.points[stroke.points.length - 1];
    
    // Add point to stroke
    stroke.points.push(point);
    stroke.endTime = point.timestamp;

    // Immediate rendering for real-time feedback
    this.ctx.lineTo(point.x, point.y);
    this.ctx.stroke();
    
    // Move to current point for next segment
    this.ctx.beginPath();
    this.ctx.moveTo(point.x, point.y);

    return stroke;
  }

  finishStroke(): StrokeData | null {
    if (!this.currentStroke) {
      return null;
    }

    const stroke = this.currentStroke;
    this.ctx.restore();
    
    // Add completed stroke to collection
    this.allStrokes.push({ ...stroke });
    this.currentStroke = null;

    return stroke;
  }

  // Render all strokes (for redraw)
  renderAllStrokes(strokes: StrokeData[]) {
    const startTime = performance.now();
    
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    for (const stroke of strokes) {
      this.renderCompleteStroke(stroke);
    }
    
    const renderTime = performance.now() - startTime;
    if (renderTime > 16) {
      console.warn(`Stroke rendering exceeded 16ms: ${renderTime.toFixed(2)}ms`);
    }
  }

  private renderCompleteStroke(stroke: StrokeData) {
    if (stroke.points.length < 2) return;

    this.ctx.save();
    this.ctx.globalAlpha = stroke.opacity / 100;
    this.ctx.strokeStyle = stroke.color;
    this.ctx.lineWidth = stroke.size;
    
    this.ctx.beginPath();
    this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    this.ctx.stroke();
    this.ctx.restore();
  }

  // Clear canvas
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.allStrokes = [];
  }

  // Get all strokes
  getStrokes(): StrokeData[] {
    return [...this.allStrokes];
  }

  // Set strokes (for loading)
  setStrokes(strokes: StrokeData[]) {
    this.allStrokes = [...strokes];
    this.renderAllStrokes(this.allStrokes);
  }
}