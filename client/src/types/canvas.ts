export interface CanvasSize {
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'cm' | 'in';
}

export interface CanvasPage {
  id: string;
  name: string;
  backgroundColor: string;
  backgroundType: 'solid' | 'grid' | 'ruled' | 'dots';
  strokes: string[];
}

export interface CanvasSettings {
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  gridSize: number;
  gridColor: string;
  gridOpacity: number;
  zoom: number;
  panX: number;
  panY: number;
}

export interface CanvasPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'cm' | 'in';
  description: string;
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  {
    id: 'a4-portrait',
    name: 'A4 Portrait',
    width: 210,
    height: 297,
    unit: 'mm',
    description: '210 × 297 mm'
  },
  {
    id: 'a4-landscape',
    name: 'A4 Landscape',
    width: 297,
    height: 210,
    unit: 'mm',
    description: '297 × 210 mm'
  },
  {
    id: 'letter-portrait',
    name: 'Letter Portrait',
    width: 8.5,
    height: 11,
    unit: 'in',
    description: '8.5 × 11 in'
  },
  {
    id: 'letter-landscape',
    name: 'Letter Landscape',
    width: 11,
    height: 8.5,
    unit: 'in',
    description: '11 × 8.5 in'
  },
  {
    id: 'square',
    name: 'Square',
    width: 1000,
    height: 1000,
    unit: 'px',
    description: '1000 × 1000 px'
  },
  {
    id: 'widescreen',
    name: 'Widescreen',
    width: 1920,
    height: 1080,
    unit: 'px',
    description: '1920 × 1080 px'
  }
];
