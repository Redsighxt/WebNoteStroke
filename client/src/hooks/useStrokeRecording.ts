import { useState, useCallback, useRef } from 'react';
import { StrokeData, Point, ToolType, ToolSettings } from '@/types/tools';
import { StrokeEngine } from '@/lib/stroke-engine';

export function useStrokeRecording(canvas: HTMLCanvasElement | null) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<StrokeData | null>(null);
  const strokeEngineRef = useRef<StrokeEngine | null>(null);
  const recordingStartTime = useRef<number>(0);

  // Initialize stroke engine when canvas is available
  if (canvas && !strokeEngineRef.current) {
    strokeEngineRef.current = new StrokeEngine(canvas);
  }

  const startRecording = useCallback((
    point: Point,
    tool: ToolType,
    settings: ToolSettings,
    canvasId: number,
    pageIndex: number = 0
  ) => {
    if (!strokeEngineRef.current) return null;

    recordingStartTime.current = performance.now();
    const strokeId = strokeEngineRef.current.startStroke(point, tool, settings, canvasId, pageIndex);
    
    setIsRecording(true);
    setCurrentStroke({
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
    });

    return strokeId;
  }, []);

  const continueRecording = useCallback((point: Point, settings: ToolSettings) => {
    if (!strokeEngineRef.current || !isRecording || !currentStroke) return false;

    const success = strokeEngineRef.current.continueStroke(point, settings);
    
    if (success) {
      setCurrentStroke(prev => prev ? {
        ...prev,
        points: [...prev.points, point],
        endTime: point.timestamp
      } : null);
    }

    return success;
  }, [isRecording, currentStroke]);

  const stopRecording = useCallback(() => {
    if (!strokeEngineRef.current || !isRecording) return null;

    const completedStroke = strokeEngineRef.current.endStroke();
    
    setIsRecording(false);
    setCurrentStroke(null);

    return completedStroke;
  }, [isRecording]);

  const createPoint = useCallback((
    x: number,
    y: number,
    pressure: number = 1,
    tiltX: number = 0,
    tiltY: number = 0
  ): Point => {
    return {
      x,
      y,
      timestamp: performance.now(),
      pressure,
      tiltX,
      tiltY
    };
  }, []);

  const getRecordingDuration = useCallback(() => {
    if (!isRecording || recordingStartTime.current === 0) return 0;
    return performance.now() - recordingStartTime.current;
  }, [isRecording]);

  const getPerformanceMetrics = useCallback(() => {
    if (!strokeEngineRef.current) return null;
    return strokeEngineRef.current.getPerformanceMetrics();
  }, []);

  const clearCanvas = useCallback(() => {
    if (!strokeEngineRef.current) return;
    strokeEngineRef.current.clearCanvas();
  }, []);

  const renderStroke = useCallback((stroke: StrokeData, settings?: ToolSettings) => {
    if (!strokeEngineRef.current) return;
    strokeEngineRef.current.renderStroke(stroke, settings);
  }, []);

  // Auto-save functionality
  const enableAutoSave = useCallback((
    onSave: (stroke: StrokeData) => void,
    interval: number = 30000 // 30 seconds
  ) => {
    const autoSaveInterval = setInterval(() => {
      if (currentStroke && currentStroke.points.length > 0) {
        onSave(currentStroke);
      }
    }, interval);

    return () => clearInterval(autoSaveInterval);
  }, [currentStroke]);

  return {
    isRecording,
    currentStroke,
    startRecording,
    continueRecording,
    stopRecording,
    createPoint,
    getRecordingDuration,
    getPerformanceMetrics,
    clearCanvas,
    renderStroke,
    enableAutoSave
  };
}
