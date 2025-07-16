import { VideoExportProgress } from '@/types/video';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Video, X, AlertCircle, CheckCircle } from 'lucide-react';

interface ExportProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  progress: VideoExportProgress;
}

export function ExportProgressModal({ 
  isOpen, 
  onClose, 
  onCancel, 
  progress 
}: ExportProgressModalProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStageColor = (stage: VideoExportProgress['stage']) => {
    switch (stage) {
      case 'preparing':
        return 'text-blue-600';
      case 'rendering':
        return 'text-purple-600';
      case 'encoding':
        return 'text-orange-600';
      case 'finalizing':
        return 'text-green-600';
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStageIcon = (stage: VideoExportProgress['stage']) => {
    switch (stage) {
      case 'complete':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return (
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Video className="text-white" size={12} />
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={progress.stage === 'complete' ? onClose : undefined}>
      <DialogContent className="max-w-md" hideCloseButton={progress.stage !== 'complete' && progress.stage !== 'error'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStageIcon(progress.stage)}
            {progress.stage === 'complete' ? 'Export Complete' : 
             progress.stage === 'error' ? 'Export Failed' : 
             'Exporting Video'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {progress.stage !== 'complete' && progress.stage !== 'error' && (
            <>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {progress.message}
                </p>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress value={progress.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className={getStageColor(progress.stage)}>
                      {progress.stage.charAt(0).toUpperCase() + progress.stage.slice(1)}...
                    </span>
                    <span>{Math.round(progress.progress)}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Details */}
              <Card>
                <CardContent className="p-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Current Stage:</span>
                    <span className={getStageColor(progress.stage)}>
                      {progress.stage.charAt(0).toUpperCase() + progress.stage.slice(1)}
                    </span>
                  </div>
                  
                  {progress.timeRemaining > 0 && (
                    <div className="flex justify-between">
                      <span>Time Remaining:</span>
                      <span>~{formatTime(progress.timeRemaining / 1000)}</span>
                    </div>
                  )}
                  
                  {progress.totalFrames > 0 && (
                    <div className="flex justify-between">
                      <span>Frames Processed:</span>
                      <span>{progress.currentFrame.toLocaleString()} / {progress.totalFrames.toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cancel Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <X size={16} className="mr-2" />
                  Cancel Export
                </Button>
              </div>
            </>
          )}

          {progress.stage === 'complete' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-500" size={32} />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Export Successful!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your video has been exported successfully and is ready for download.
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  onClick={() => {
                    // Download functionality would be implemented here
                    console.log('Download video');
                  }}
                >
                  Download Video
                </Button>
              </div>
            </div>
          )}

          {progress.stage === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="text-red-500" size={32} />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Export Failed
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {progress.message || 'An error occurred during video export. Please try again.'}
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button 
                  onClick={onClose}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
