import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const DEFAULT_COLORS = [
  '#000000', '#ff0000', '#0000ff', '#00ff00',
  '#ffff00', '#ff00ff', '#00ffff', '#808080',
  '#800000', '#008000', '#000080', '#808000',
  '#800080', '#008080', '#c0c0c0', '#ffffff'
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [rgbValues, setRgbValues] = useState(() => {
    const rgb = hexToRgb(value);
    return rgb || { r: 0, g: 0, b: 0 };
  });

  const [recentColors, setRecentColors] = useState<string[]>([
    '#000000', '#ff0000', '#0000ff', '#00ff00'
  ]);

  function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgbValues, [component]: value };
    setRgbValues(newRgb);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    onChange(newHex);
  };

  const handleColorSelect = (color: string) => {
    onChange(color);
    const rgb = hexToRgb(color);
    if (rgb) {
      setRgbValues(rgb);
    }
    
    // Add to recent colors
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 8);
    });
  };

  const handleHexChange = (hex: string) => {
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      onChange(hex);
      const rgb = hexToRgb(hex);
      if (rgb) {
        setRgbValues(rgb);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Color Display */}
      <div 
        className="w-full h-16 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer transition-all hover:scale-105"
        style={{ backgroundColor: value }}
        onClick={() => {
          // Could open native color picker
          const input = document.createElement('input');
          input.type = 'color';
          input.value = value;
          input.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            handleColorSelect(target.value);
          });
          input.click();
        }}
      />

      {/* Color Wheel Area */}
      <div className="relative">
        <div className="w-full h-40 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-lg border border-gray-200 dark:border-gray-600 cursor-crosshair">
          <div className="w-full h-full bg-gradient-to-t from-black via-transparent to-white rounded-lg opacity-80"></div>
          <div 
            className="absolute w-3 h-3 bg-white border-2 border-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ 
              top: '50%', 
              left: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          />
        </div>
      </div>

      {/* RGB Sliders */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-700 dark:text-gray-300 w-4">R</Label>
          <Slider
            value={[rgbValues.r]}
            onValueChange={(value) => handleRgbChange('r', value[0])}
            min={0}
            max={255}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
            {rgbValues.r}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-700 dark:text-gray-300 w-4">G</Label>
          <Slider
            value={[rgbValues.g]}
            onValueChange={(value) => handleRgbChange('g', value[0])}
            min={0}
            max={255}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
            {rgbValues.g}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-700 dark:text-gray-300 w-4">B</Label>
          <Slider
            value={[rgbValues.b]}
            onValueChange={(value) => handleRgbChange('b', value[0])}
            min={0}
            max={255}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
            {rgbValues.b}
          </span>
        </div>
      </div>

      {/* Hex Input */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-gray-700 dark:text-gray-300">Hex:</Label>
        <Input
          type="text"
          value={value}
          onChange={(e) => handleHexChange(e.target.value)}
          className="flex-1 h-8 text-xs"
          placeholder="#000000"
        />
      </div>

      {/* Default Color Presets */}
      <div>
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Presets
        </Label>
        <div className="grid grid-cols-8 gap-1">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
            />
          ))}
        </div>
      </div>

      {/* Recent Colors */}
      <div>
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Recent
        </Label>
        <div className="grid grid-cols-8 gap-1">
          {recentColors.map((color, index) => (
            <button
              key={`${color}-${index}`}
              className="w-8 h-8 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
