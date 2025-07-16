export type ToolType = 'pen' | 'pencil' | 'brush' | 'marker' | 'fountain-pen' | 'calligraphy' | 'eraser' | 'select' | 'ruler' | 'hand';

export interface Tool {
  id: ToolType;
  name: string;
  icon: string;
  cursor: string;
  settings: ToolSettings;
}

export interface ToolSettings {
  size: number;
  opacity: number;
  color: string;
  pressureSensitive: boolean;
  smoothing: number;
  texture?: string;
  lineJoin?: 'miter' | 'round' | 'bevel';
  lineCap?: 'butt' | 'round' | 'square';
}

export interface Point {
  x: number;
  y: number;
  timestamp: number;
  pressure?: number;
  tiltX?: number;
  tiltY?: number;
}

export interface StrokeData {
  id: string;
  tool: ToolType;
  color: string;
  size: number;
  opacity: number;
  points: Point[];
  startTime: number;
  endTime: number;
  canvasId: number;
  pageIndex: number;
}

export const DEFAULT_TOOLS: Tool[] = [
  {
    id: 'pen',
    name: 'Ballpoint Pen',
    icon: 'fas fa-pen',
    cursor: 'cursor-pen',
    settings: {
      size: 3,
      opacity: 100,
      color: '#000000',
      pressureSensitive: true,
      smoothing: 50,
      lineCap: 'round',
      lineJoin: 'round'
    }
  },
  {
    id: 'pencil',
    name: 'Pencil',
    icon: 'fas fa-pencil-alt',
    cursor: 'cursor-pen',
    settings: {
      size: 2,
      opacity: 80,
      color: '#2d3748',
      pressureSensitive: true,
      smoothing: 30,
      texture: 'paper',
      lineCap: 'round',
      lineJoin: 'round'
    }
  },
  {
    id: 'brush',
    name: 'Brush',
    icon: 'fas fa-paint-brush',
    cursor: 'cursor-pen',
    settings: {
      size: 8,
      opacity: 90,
      color: '#000000',
      pressureSensitive: true,
      smoothing: 70,
      lineCap: 'round',
      lineJoin: 'round'
    }
  },
  {
    id: 'marker',
    name: 'Marker',
    icon: 'fas fa-marker',
    cursor: 'cursor-pen',
    settings: {
      size: 12,
      opacity: 70,
      color: '#ffd700',
      pressureSensitive: false,
      smoothing: 40,
      lineCap: 'round',
      lineJoin: 'round'
    }
  },
  {
    id: 'fountain-pen',
    name: 'Fountain Pen',
    icon: 'fas fa-feather-alt',
    cursor: 'cursor-pen',
    settings: {
      size: 4,
      opacity: 95,
      color: '#1a202c',
      pressureSensitive: true,
      smoothing: 60,
      lineCap: 'round',
      lineJoin: 'round'
    }
  },
  {
    id: 'eraser',
    name: 'Eraser',
    icon: 'fas fa-eraser',
    cursor: 'cursor-eraser',
    settings: {
      size: 20,
      opacity: 100,
      color: '#ffffff',
      pressureSensitive: false,
      smoothing: 20,
      lineCap: 'round',
      lineJoin: 'round'
    }
  }
];
