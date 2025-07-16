import { useState } from 'react';
import { VideoExportSettings, VIDEO_PRESETS } from '@/types/video';
import { StrokeData } from '@/types/tools';
import { useVideoExport } from '@/hooks/useVideoExport';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Play, Download, X, Info } from 'lucide-react';

interface VideoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: VideoExportSettings) => void;
  strokes: StrokeData[];
}

export function VideoExportModal({ isOpen, onClose, onExport, strokes }: VideoExportModalProps) {
  const [settings, setSettings] = useState<VideoExportSettings>({
    format: 'mp4',
    resolution: '1080p',
    frameRate: 60,
    quality: 'auto',
    playbackSpeed: 1.0,
    strokeDelay: 0.2,
    animationStyle: 'smooth',
    backgroundType: 'white',
    effects: {
      fadeIn: false,
      strokeEmphasis: false,
      dynamicZoom: false,
      pageTransitions: true
    }
  });

  const { estimateFileSize, getOptimalSettings } = useVideoExport(null);

  const updateSettings = (updates: Partial<VideoExportSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateEffects = (effects: Partial<VideoExportSettings['effects']>) => {
    setSettings(prev => ({
      ...prev,
      effects: { ...prev.effects, ...effects }
    }));
  };

  const handleExport = () => {
    onExport(settings);
  };

  const handlePreview = () => {
    // Preview functionality would be implemented here
    console.log('Preview with settings:', settings);
  };

  const estimatedSize = estimateFileSize(strokes, settings);
  const duration = strokes.length > 0 ? 
    (strokes[strokes.length - 1].endTime - strokes[0].startTime) / 1000 : 45;
  const processingTime = Math.ceil(duration * 0.3); // Rough estimate

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Play className="text-white" size={16} />
            </div>
            Export Video Animation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <div className="text-center">
                  <Play className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-2" size={48} />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Animation Preview</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Click to preview your animation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Timing Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Animation Style
                  </Label>
                  <Select 
                    value={settings.animationStyle} 
                    onValueChange={(value: any) => updateSettings({ animationStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_PRESETS.animationStyles.map(style => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-xs text-gray-500">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Playback Speed
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[settings.playbackSpeed]}
                      onValueChange={(value) => updateSettings({ playbackSpeed: value[0] })}
                      min={0.25}
                      max={4}
                      step={0.25}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                      {settings.playbackSpeed}x
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Stroke Delay
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[settings.strokeDelay]}
                      onValueChange={(value) => updateSettings({ strokeDelay: value[0] })}
                      min={0}
                      max={2}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                      {settings.strokeDelay}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Quality Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Resolution
                  </Label>
                  <Select 
                    value={settings.resolution} 
                    onValueChange={(value: any) => updateSettings({ resolution: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_PRESETS.resolutions.map(res => (
                        <SelectItem key={res.value} value={res.value}>
                          {res.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Frame Rate
                  </Label>
                  <Select 
                    value={settings.frameRate.toString()} 
                    onValueChange={(value) => updateSettings({ frameRate: parseInt(value) as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_PRESETS.frameRates.map(fr => (
                        <SelectItem key={fr.value} value={fr.value.toString()}>
                          {fr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Format
                  </Label>
                  <Select 
                    value={settings.format} 
                    onValueChange={(value: any) => updateSettings({ format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_PRESETS.formats.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          <div>
                            <div className="font-medium">{format.label}</div>
                            <div className="text-xs text-gray-500">{format.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Background Settings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Background
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'white', label: 'White', color: '#ffffff' },
                { value: 'black', label: 'Black', color: '#000000' },
                { value: 'grid', label: 'Grid', color: '#ffffff', pattern: true },
                { value: 'transparent', label: 'Transparent', color: 'transparent' }
              ].map(bg => (
                <button
                  key={bg.value}
                  onClick={() => updateSettings({ backgroundType: bg.value as any })}
                  className={`p-3 rounded-lg border-2 text-xs text-center transition-all ${
                    settings.backgroundType === bg.value
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <div 
                    className="w-full h-8 border rounded mb-2"
                    style={{ 
                      backgroundColor: bg.color,
                      backgroundImage: bg.pattern ? 
                        'repeating-linear-gradient(0deg, transparent, transparent 10px, #e5e7eb 10px, #e5e7eb 11px), repeating-linear-gradient(90deg, transparent, transparent 10px, #e5e7eb 10px, #e5e7eb 11px)' 
                        : undefined
                    }}
                  />
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Effects */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Advanced Effects
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-700 dark:text-gray-300">
                  Fade-in effect
                </Label>
                <Switch
                  checked={settings.effects.fadeIn}
                  onCheckedChange={(checked) => updateEffects({ fadeIn: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-700 dark:text-gray-300">
                  Stroke emphasis
                </Label>
                <Switch
                  checked={settings.effects.strokeEmphasis}
                  onCheckedChange={(checked) => updateEffects({ strokeEmphasis: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-700 dark:text-gray-300">
                  Dynamic zoom
                </Label>
                <Switch
                  checked={settings.effects.dynamicZoom}
                  onCheckedChange={(checked) => updateEffects({ dynamicZoom: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-700 dark:text-gray-300">
                  Page transitions
                </Label>
                <Switch
                  checked={settings.effects.pageTransitions}
                  onCheckedChange={(checked) => updateEffects({ pageTransitions: checked })}
                />
              </div>
            </div>
          </div>

          {/* Export Info */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Info className="text-blue-500" size={20} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Export Preview
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Duration: {Math.round(duration)} seconds • 
                    Size: ~{Math.round(estimatedSize / 1024 / 1024 * 10) / 10} MB • 
                    Processing time: ~{processingTime} seconds
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <Button variant="outline" onClick={handlePreview}>
            <Play size={16} className="mr-2" />
            Preview
          </Button>
          
          <Button onClick={handleExport} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
            <Download size={16} className="mr-2" />
            Export Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
