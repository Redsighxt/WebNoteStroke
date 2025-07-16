import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Play, Download, X } from 'lucide-react';

interface PageManagerProps {
  canvasId: number | null;
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  onPreviewAnimation: () => void;
  onExportAll: () => void;
}

interface Page {
  id: string;
  name: string;
  thumbnail?: string;
  strokeCount: number;
  lastModified: Date;
}

export function PageManager({
  canvasId,
  currentPageIndex,
  onPageChange,
  onPreviewAnimation,
  onExportAll
}: PageManagerProps) {
  const [pages, setPages] = useState<Page[]>([
    {
      id: '1',
      name: 'Page 1',
      strokeCount: 24,
      lastModified: new Date()
    },
    {
      id: '2',
      name: 'Page 2',
      strokeCount: 12,
      lastModified: new Date()
    },
    {
      id: '3',
      name: 'Page 3',
      strokeCount: 8,
      lastModified: new Date()
    }
  ]);

  const addPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      name: `Page ${pages.length + 1}`,
      strokeCount: 0,
      lastModified: new Date()
    };
    setPages([...pages, newPage]);
  };

  const deletePage = (pageId: string) => {
    if (pages.length > 1) {
      setPages(pages.filter(page => page.id !== pageId));
      // Adjust current page index if necessary
      if (currentPageIndex >= pages.length - 1) {
        onPageChange(Math.max(0, pages.length - 2));
      }
    }
  };

  const duplicatePage = (pageId: string) => {
    const pageIndex = pages.findIndex(page => page.id === pageId);
    if (pageIndex !== -1) {
      const originalPage = pages[pageIndex];
      const duplicatedPage: Page = {
        ...originalPage,
        id: Date.now().toString(),
        name: `${originalPage.name} Copy`,
        lastModified: new Date()
      };
      const newPages = [...pages];
      newPages.splice(pageIndex + 1, 0, duplicatedPage);
      setPages(newPages);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Pages
          </span>
          
          <div className="flex items-center gap-2">
            {pages.map((page, index) => (
              <div key={page.id} className="relative group">
                <div
                  className={`w-16 h-20 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${
                    index === currentPageIndex
                      ? 'bg-white dark:bg-gray-700 border-2 border-blue-600 shadow-md'
                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-md'
                  }`}
                  onClick={() => onPageChange(index)}
                >
                  <div className="w-full h-full bg-gray-50 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {index + 1}
                    </span>
                  </div>
                </div>
                
                {/* Page Actions */}
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-4 h-4 rounded-full p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(page.id);
                    }}
                  >
                    <X size={10} />
                  </Button>
                </div>
                
                {/* Page Info Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <div>{page.name}</div>
                  <div>Strokes: {page.strokeCount}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                </div>
              </div>
            ))}
            
            {/* Add Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={addPage}
              className="w-16 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <Plus size={16} className="text-gray-400 dark:text-gray-500" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviewAnimation}
            className="text-xs"
          >
            <Play size={14} className="mr-1" />
            Preview Animation
          </Button>
          
          <Button
            onClick={onExportAll}
            className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Download size={14} className="mr-1" />
            Export All
          </Button>
        </div>
      </div>
    </div>
  );
}
