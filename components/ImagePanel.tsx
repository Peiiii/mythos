
import React from 'react';
import { LoadingSpinner, FeatherIcon, RefreshIcon } from './icons';

interface ImagePanelProps {
  text: string | null;
  image: string | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onRegenerate: () => void;
}

export const ImagePanel: React.FC<ImagePanelProps> = ({ text, image, isLoading, error, onClose, onRegenerate }) => {
  return (
    <div className="flex-grow flex flex-col bg-gray-800/50 rounded-lg shadow-inner overflow-hidden">
      <div className="p-4 bg-gray-900/50 flex justify-between items-center flex-shrink-0">
        <h2 className="text-xl font-bold text-amber-300/80">Scene Visualization</h2>
        <div className="flex items-center gap-2">
            {image && !isLoading && (
                 <button
                    onClick={onRegenerate}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors duration-200 disabled:opacity-50"
                    title="Regenerate image"
                >
                    <RefreshIcon className="w-4 h-4" />
                </button>
            )}
            <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-300"
            >
            Back to Writing
            </button>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto custom-scrollbar flex flex-col">
        {text && (
          <blockquote className="mb-4 p-4 bg-gray-900/30 border-l-4 border-amber-400 text-gray-300 italic rounded-r-lg">
            "{text}"
          </blockquote>
        )}

        <div className="flex-grow rounded-lg bg-black/20 flex items-center justify-center relative min-h-[300px]">
          {isLoading && (
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-amber-400 animate-pulse">Evoking the scene...</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="text-center text-red-400 p-4">
               <p className="font-bold">Visualization Failed</p>
               <p className="text-sm">{error}</p>
            </div>
          )}
          {image && !isLoading && (
            <img 
              src={`data:image/jpeg;base64,${image}`} 
              alt="AI generated scene" 
              className="w-full h-full object-contain rounded-lg"
            />
          )}
           {!isLoading && !image && !error && (
             <div className="text-center text-gray-500">
                <FeatherIcon className="w-16 h-16 mx-auto mb-4"/>
                <p>The canvas is ready.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
