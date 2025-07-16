import { useState } from 'react';
import { ToolType, DEFAULT_TOOLS } from '@/types/tools';
import { CanvasSettings } from '@/types/canvas';
import { ColorPicker } from './ColorPicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ZoomIn, ZoomOut, Grid, Ruler, Magnet } from 'lucide-react';

interface ToolPropertiesProps {
  currentTool: ToolType;
  settings: CanvasSettings;
  onSettingsChange: (settings: Partial<CanvasSettings>) => void;
}

export function ToolProperties({ currentTool, settings, onSettingsChange }: ToolPropertiesProps) {
  const [toolSize, setToolSize] = useState(3);
  const [toolOpacity, setToolOpacity] = useState(100);
  const [pressureSensitive, setPressureSensitive] = useState(true);
  const [smoothing, setSmoothing] = useState(50);
  const [selectedColor, setSelectedColor] = useState('#000000');

  const currentToolData = DEFAULT_TOOLS.find(tool => tool.id === currentTool);

  const handleZoomChange = (delta: number) => {
    const newZoom = Math.max(0.25, Math.min(5, settings.zoom + delta));
    onSettingsChange({ zoom: newZoom });
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 custom-scrollbar overflow-y-auto">
      <div className="space-y-6">
        {/* Tool Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {currentToolData?.name || 'Tool Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Size
              </Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[toolSize]}
                  onValueChange={(value) => setToolSize(value[0])}
                  min={1}
                  max={50}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                  {toolSize}px
                </span>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Opacity
              </Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[toolOpacity]}
                  onValueChange={(value) => setToolOpacity(value[0])}
                  min={10}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-10 text-right">
                  {toolOpacity}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Pressure Sensitivity
              </Label>
              <Switch
                checked={pressureSensitive}
                onCheckedChange={setPressureSensitive}
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Smoothing
              </Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[smoothing]}
                  onValueChange={(value) => setSmoothing(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-10 text-right">
                  {smoothing}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Picker */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Color</CardTitle>
          </CardHeader>
          <CardContent>
            <ColorPicker
              value={selectedColor}
              onChange={setSelectedColor}
            />
          </CardContent>
        </Card>

        {/* Canvas Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Canvas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Background
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                >
                  White
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                >
                  Grid
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Zoom
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoomChange(-0.1)}
                  className="px-3 py-1"
                >
                  <ZoomOut size={14} />
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 text-center">
                  {Math.round(settings.zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoomChange(0.1)}
                  className="px-3 py-1"
                >
                  <ZoomIn size={14} />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Grid size={14} />
                  Show Grid
                </Label>
                <Switch
                  checked={settings.showGrid}
                  onCheckedChange={(checked) => onSettingsChange({ showGrid: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Ruler size={14} />
                  Show Rulers
                </Label>
                <Switch
                  checked={settings.showRulers}
                  onCheckedChange={(checked) => onSettingsChange({ showRulers: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Magnet size={14} />
                  Snap to Grid
                </Label>
                <Switch
                  checked={settings.snapToGrid}
                  onCheckedChange={(checked) => onSettingsChange({ snapToGrid: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
