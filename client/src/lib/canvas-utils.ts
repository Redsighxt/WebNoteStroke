import { CanvasSize, CanvasSettings } from '@/types/canvas';

export function convertToPixels(size: CanvasSize): { width: number; height: number } {
  const dpi = 96; // Standard web DPI
  
  switch (size.unit) {
    case 'px':
      return { width: size.width, height: size.height };
    case 'mm':
      return {
        width: (size.width / 25.4) * dpi,
        height: (size.height / 25.4) * dpi
      };
    case 'cm':
      return {
        width: (size.width / 2.54) * dpi,
        height: (size.height / 2.54) * dpi
      };
    case 'in':
      return {
        width: size.width * dpi,
        height: size.height * dpi
      };
    default:
      return { width: size.width, height: size.height };
  }
}

export function setupCanvas(
  canvas: HTMLCanvasElement,
  pixelRatio: number = window.devicePixelRatio || 1
): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')!;
  
  // Set actual size in memory (scaled to account for pixel ratio)
  canvas.width = canvas.offsetWidth * pixelRatio;
  canvas.height = canvas.offsetHeight * pixelRatio;
  
  // Scale the drawing context so everything draws at the correct size
  ctx.scale(pixelRatio, pixelRatio);
  
  // Set display size (css pixels)
  canvas.style.width = canvas.offsetWidth + 'px';
  canvas.style.height = canvas.offsetHeight + 'px';
  
  return ctx;
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  settings: CanvasSettings,
  canvasWidth: number,
  canvasHeight: number
) {
  if (!settings.showGrid) return;
  
  ctx.save();
  ctx.strokeStyle = settings.gridColor;
  ctx.globalAlpha = settings.gridOpacity / 100;
  ctx.lineWidth = 1;
  
  const gridSize = settings.gridSize * settings.zoom;
  const offsetX = settings.panX % gridSize;
  const offsetY = settings.panY % gridSize;
  
  // Draw vertical lines
  for (let x = offsetX; x < canvasWidth; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }
  
  // Draw horizontal lines
  for (let y = offsetY; y < canvasHeight; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }
  
  ctx.restore();
}

export function drawRulers(
  ctx: CanvasRenderingContext2D,
  settings: CanvasSettings,
  canvasWidth: number,
  canvasHeight: number
) {
  if (!settings.showRulers) return;
  
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvasWidth, 20); // Top ruler
  ctx.fillRect(0, 0, 20, canvasHeight); // Left ruler
  
  ctx.strokeStyle = '#666';
  ctx.fillStyle = '#333';
  ctx.font = '10px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const step = 50 * settings.zoom;
  
  // Draw top ruler marks
  for (let x = 0; x < canvasWidth; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 15);
    ctx.lineTo(x, 20);
    ctx.stroke();
    
    if (x > 0) {
      ctx.fillText(Math.round(x / settings.zoom).toString(), x, 10);
    }
  }
  
  // Draw left ruler marks
  for (let y = 0; y < canvasHeight; y += step) {
    ctx.beginPath();
    ctx.moveTo(15, y);
    ctx.lineTo(20, y);
    ctx.stroke();
    
    if (y > 0) {
      ctx.save();
      ctx.translate(10, y);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(Math.round(y / settings.zoom).toString(), 0, 0);
      ctx.restore();
    }
  }
  
  ctx.restore();
}

export function getCanvasCoordinates(
  event: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement,
  settings: CanvasSettings
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  let clientX: number, clientY: number;
  
  if (event instanceof MouseEvent) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  }
  
  // Simple coordinate calculation for full canvas
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  
  return { x, y };
}

export function snapToGrid(
  x: number,
  y: number,
  settings: CanvasSettings
): { x: number; y: number } {
  if (!settings.snapToGrid) return { x, y };
  
  const gridSize = settings.gridSize;
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  };
}

export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function smoothPoints(points: { x: number; y: number }[], factor: number = 0.5): { x: number; y: number }[] {
  if (points.length < 3) return points;
  
  const smoothed = [points[0]];
  
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    
    const smoothedPoint = {
      x: curr.x + factor * (prev.x + next.x - 2 * curr.x),
      y: curr.y + factor * (prev.y + next.y - 2 * curr.y)
    };
    
    smoothed.push(smoothedPoint);
  }
  
  smoothed.push(points[points.length - 1]);
  return smoothed;
}

export function createBezierPath(points: { x: number; y: number }[]): Path2D {
  if (points.length < 2) return new Path2D();
  
  const path = new Path2D();
  path.moveTo(points[0].x, points[0].y);
  
  if (points.length === 2) {
    path.lineTo(points[1].x, points[1].y);
    return path;
  }
  
  for (let i = 1; i < points.length - 1; i++) {
    const cpx = (points[i].x + points[i + 1].x) / 2;
    const cpy = (points[i].y + points[i + 1].y) / 2;
    path.quadraticCurveTo(points[i].x, points[i].y, cpx, cpy);
  }
  
  path.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  return path;
}
