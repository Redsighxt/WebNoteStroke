import { Tool, ToolType } from '@/types/tools';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Pen, 
  Pencil, 
  Brush, 
  Highlighter, 
  Feather, 
  Eraser, 
  Square, 
  Ruler, 
  Hand 
} from 'lucide-react';

interface ToolSidebarProps {
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  tools: Tool[];
}

const toolIcons: Record<ToolType, any> = {
  'pen': Pen,
  'pencil': Pencil,
  'brush': Brush,
  'marker': Highlighter,
  'fountain-pen': Feather,
  'calligraphy': Feather,
  'eraser': Eraser,
  'select': Square,
  'ruler': Ruler,
  'hand': Hand
};

export function ToolSidebar({ currentTool, onToolChange, tools }: ToolSidebarProps) {
  return (
    <aside className="w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-3">
      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">TOOLS</div>
      
      {tools.map((tool) => {
        const IconComponent = toolIcons[tool.id];
        const isActive = currentTool === tool.id;
        
        return (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`tool-button w-12 h-12 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg scale-105' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => onToolChange(tool.id)}
              >
                <IconComponent size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tool.name}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
      
      <div className="w-full h-px bg-gray-200 dark:bg-gray-600 my-2"></div>
      
      {/* Additional tools */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`tool-button w-12 h-12 rounded-xl transition-all duration-200 ${
              currentTool === 'select' 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => onToolChange('select')}
          >
            <Square size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Selection Tool</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`tool-button w-12 h-12 rounded-xl transition-all duration-200 ${
              currentTool === 'ruler' 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => onToolChange('ruler')}
          >
            <Ruler size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Ruler Tool</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`tool-button w-12 h-12 rounded-xl transition-all duration-200 ${
              currentTool === 'hand' 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => onToolChange('hand')}
          >
            <Hand size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Pan Tool</p>
        </TooltipContent>
      </Tooltip>
    </aside>
  );
}
