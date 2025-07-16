import { useState } from 'react';
import { CANVAS_PRESETS, CanvasPreset } from '@/types/canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText } from 'lucide-react';

interface CanvasCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCanvas: (canvasData: any) => void;
}

interface CanvasConfig {
  name: string;
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'cm' | 'in';
  backgroundColor: string;
  backgroundType: 'solid' | 'grid' | 'ruled' | 'dots';
}

export function CanvasCreationModal({ isOpen, onClose, onCreateCanvas }: CanvasCreationModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('a4-portrait');
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>({
    name: 'Untitled Canvas',
    width: 210,
    height: 297,
    unit: 'mm',
    backgroundColor: '#ffffff',
    backgroundType: 'solid'
  });

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = CANVAS_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setCanvasConfig(prev => ({
        ...prev,
        width: preset.width,
        height: preset.height,
        unit: preset.unit
      }));
    }
  };

  const handleCustomSize = (field: 'width' | 'height', value: number) => {
    setCanvasConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setSelectedPreset('custom');
  };

  const handleBackgroundSelect = (backgroundType: 'solid' | 'grid' | 'ruled' | 'dots', color: string = '#ffffff') => {
    setCanvasConfig(prev => ({
      ...prev,
      backgroundColor: color,
      backgroundType
    }));
  };

  const handleCreate = () => {
    // Convert to pixels for storage
    const dpi = 96;
    let widthPx = canvasConfig.width;
    let heightPx = canvasConfig.height;

    switch (canvasConfig.unit) {
      case 'mm':
        widthPx = (canvasConfig.width / 25.4) * dpi;
        heightPx = (canvasConfig.height / 25.4) * dpi;
        break;
      case 'cm':
        widthPx = (canvasConfig.width / 2.54) * dpi;
        heightPx = (canvasConfig.height / 2.54) * dpi;
        break;
      case 'in':
        widthPx = canvasConfig.width * dpi;
        heightPx = canvasConfig.height * dpi;
        break;
    }

    const canvasData = {
      name: canvasConfig.name,
      width: Math.round(widthPx),
      height: Math.round(heightPx),
      backgroundColor: canvasConfig.backgroundColor,
      backgroundType: canvasConfig.backgroundType,
      pages: [{
        id: '1',
        name: 'Page 1',
        backgroundColor: canvasConfig.backgroundColor,
        backgroundType: canvasConfig.backgroundType,
        strokes: []
      }]
    };

    onCreateCanvas(canvasData);
  };

  const currentPreset = CANVAS_PRESETS.find(p => p.id === selectedPreset);
  const isCustom = selectedPreset === 'custom';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Canvas</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Canvas Name */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Canvas Name
            </Label>
            <Input
              value={canvasConfig.name}
              onChange={(e) => setCanvasConfig(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter canvas name"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Size Selection */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Canvas Size
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {CANVAS_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      selectedPreset === preset.id
                        ? 'border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Custom Size
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-gray-700 dark:text-gray-300 mb-1 block">
                      Width
                    </Label>
                    <Input
                      type="number"
                      value={canvasConfig.width}
                      onChange={(e) => handleCustomSize('width', parseFloat(e.target.value) || 0)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-700 dark:text-gray-300 mb-1 block">
                      Height
                    </Label>
                    <Input
                      type="number"
                      value={canvasConfig.height}
                      onChange={(e) => handleCustomSize('height', parseFloat(e.target.value) || 0)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-700 dark:text-gray-300 mb-1 block">
                      Unit
                    </Label>
                    <Select 
                      value={canvasConfig.unit} 
                      onValueChange={(value: any) => setCanvasConfig(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm">mm</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                        <SelectItem value="px">px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Canvas Preview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Preview
              </h3>
              <Card className="bg-gray-100 dark:bg-gray-800 p-4 aspect-[3/4]">
                <div className="w-full h-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded shadow-sm flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <FileText size={32} className="mx-auto mb-2" />
                    <div className="text-xs">
                      {currentPreset?.name || 'Custom'}
                    </div>
                    <div className="text-xs">
                      {canvasConfig.width} × {canvasConfig.height} {canvasConfig.unit}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Background Selection */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Background
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { type: 'solid', color: '#ffffff', label: 'White' },
                { type: 'solid', color: '#f3f4f6', label: 'Light Gray' },
                { type: 'grid', color: '#ffffff', label: 'Grid' },
                { type: 'solid', color: '#dbeafe', label: 'Light Blue' }
              ].map((bg, index) => (
                <button
                  key={index}
                  onClick={() => handleBackgroundSelect(bg.type as any, bg.color)}
                  className={`p-3 rounded-lg text-xs text-center transition-all ${
                    canvasConfig.backgroundType === bg.type && canvasConfig.backgroundColor === bg.color
                      ? 'border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <div 
                    className="w-full h-8 border rounded mb-2"
                    style={{ 
                      backgroundColor: bg.color,
                      backgroundImage: bg.type === 'grid' ? 
                        'repeating-linear-gradient(0deg, transparent, transparent 10px, #e5e7eb 10px, #e5e7eb 11px), repeating-linear-gradient(90deg, transparent, transparent 10px, #e5e7eb 10px, #e5e7eb 11px)' 
                        : undefined
                    }}
                  />
                  {bg.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={16} className="mr-2" />
            Create Canvas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
