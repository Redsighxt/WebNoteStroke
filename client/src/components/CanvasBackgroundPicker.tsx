import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface CanvasBackgroundPickerProps {
  onColorSelect: (color: string) => void;
  defaultColor?: string;
}

export function CanvasBackgroundPicker({ onColorSelect, defaultColor = '#ffffff' }: CanvasBackgroundPickerProps) {
  const [selectedColor, setSelectedColor] = useState(defaultColor);

  const presetColors = [
    '#ffffff', // White
    '#f8f9fa', // Light Gray
    '#e9ecef', // Lighter Gray
    '#343a40', // Dark Gray
    '#212529', // Almost Black
    '#fff3cd', // Light Yellow
    '#d1ecf1', // Light Blue
    '#d4edda', // Light Green
    '#f8d7da', // Light Red
    '#e2e3e5'  // Medium Gray
  ];

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onColorSelect(color);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Canvas Background</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="custom-color" className="text-sm mb-2 block">
            Custom Color
          </Label>
          <div className="flex gap-2">
            <input
              id="custom-color"
              type="color"
              value={selectedColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-12 h-8 rounded border border-gray-300"
            />
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="#ffffff"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Preset Colors</Label>
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-8 h-8 rounded border-2 ${
                  selectedColor === color 
                    ? 'border-blue-500 border-2' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}