import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ColorPicker } from '@/components/ColorPicker';
import { Slider } from '@/components/ui/slider';
import { Palette, Settings, Minimize2, Maximize2, Paintbrush } from 'lucide-react';
import { ToolSettings } from '@/types/tools';

interface FloatingControlsProps {
  toolSettings: ToolSettings;
  onToolSettingsChange: (settings: ToolSettings) => void;
}

export function FloatingControls({ toolSettings, onToolSettingsChange }: FloatingControlsProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [smoothingOpen, setSmoothingOpen] = useState(false);
  const [canvasControlsOpen, setCanvasControlsOpen] = useState(false);

  return (
    <>
      {/* Color Picker Toggle */}
      <div className="fixed top-20 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setColorPickerOpen(!colorPickerOpen)}
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          <Palette size={16} className="mr-1" />
          Color
        </Button>
        
        {colorPickerOpen && (
          <Card className="absolute top-12 right-0 w-80 shadow-xl animate-in slide-in-from-top-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Color Picker</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setColorPickerOpen(false)}
                >
                  <Minimize2 size={14} />
                </Button>
              </div>
              <ColorPicker
                color={toolSettings.color}
                onChange={(color) => onToolSettingsChange({ ...toolSettings, color })}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Smoothing Toggle */}
      <div className="fixed top-20 right-20 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSmoothingOpen(!smoothingOpen)}
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          <Paintbrush size={16} className="mr-1" />
          Smooth
        </Button>
        
        {smoothingOpen && (
          <Card className="absolute top-12 right-0 w-64 shadow-xl animate-in slide-in-from-top-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Smoothing</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSmoothingOpen(false)}
                >
                  <Minimize2 size={14} />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Level</span>
                  <span className="text-sm text-gray-500">{toolSettings.smoothing}%</span>
                </div>
                <Slider
                  value={[toolSettings.smoothing]}
                  onValueChange={(value) => onToolSettingsChange({ ...toolSettings, smoothing: value[0] })}
                  min={0}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  For handwriting, keep below 10% to maintain readability
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Canvas Controls Toggle */}
      <div className="fixed top-20 right-36 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCanvasControlsOpen(!canvasControlsOpen)}
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          <Settings size={16} className="mr-1" />
          Canvas
        </Button>
        
        {canvasControlsOpen && (
          <Card className="absolute top-12 right-0 w-72 shadow-xl animate-in slide-in-from-top-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Canvas Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCanvasControlsOpen(false)}
                >
                  <Minimize2 size={14} />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Grid (Snap to Grid means your pen will automatically align to grid points)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={toolSettings.snapToGrid}
                      onChange={(e) => onToolSettingsChange({ 
                        ...toolSettings, 
                        snapToGrid: e.target.checked 
                      })}
                      className="rounded"
                    />
                    <span className="text-sm">Enable Grid Snap</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Grid Size</label>
                  <Slider
                    value={[toolSettings.gridSize || 10]}
                    onValueChange={(value) => onToolSettingsChange({ 
                      ...toolSettings, 
                      gridSize: value[0] 
                    })}
                    min={5}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}