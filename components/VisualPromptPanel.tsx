
import React, { useState } from 'react';
import { LoadingSpinner, WandIcon } from './icons';

interface VisualPromptPanelProps {
  image: string | null;
  isLoading: boolean;
  error: string | null;
  onSubmit: (guidance: string) => void;
  onCancel: () => void;
}

export const VisualPromptPanel: React.FC<VisualPromptPanelProps> = ({ image, isLoading, error, onSubmit, onCancel }) => {
  const [guidance, setGuidance] = useState('');

  const handleSubmit = () => {
    if (guidance.trim()) {
      onSubmit(guidance);
    }
  };

  return (
    <div className="flex-grow flex flex-col bg-gray-800/50 rounded-lg shadow-inner overflow-hidden">
      <div className="p-4 bg-gray-900/50 flex justify-between items-center flex-shrink-0">
        <h2 className="text-xl font-bold text-indigo-300/80 flex items-center gap-2">
            <WandIcon className="w-6 h-6"/>
            Visual Prompt
        </h2>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-300"
        >
          Cancel
        </button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
        <div className="flex-grow rounded-lg bg-black/20 flex items-center justify-center relative min-h-[300px]">
          {isLoading && (
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-indigo-400 animate-pulse">Summoning inspiration...</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="text-center text-red-400 p-4">
               <p className="font-bold">Inspiration Failed</p>
               <p className="text-sm">{error}</p>
            </div>
          )}
          {image && !isLoading && (
            <img 
              src={`data:image/jpeg;base64,${image}`} 
              alt="AI generated visual prompt" 
              className="w-full h-full object-contain rounded-lg"
            />
          )}
        </div>
        
        {!isLoading && !error && image && (
            <div className="flex flex-col gap-2">
                <textarea
                    value={guidance}
                    onChange={(e) => setGuidance(e.target.value)}
                    placeholder="What happens in this scene? Use the image as inspiration to guide the story..."
                    className="w-full bg-gray-700 text-gray-200 placeholder-gray-400 px-4 py-3 rounded-lg border-2 border-gray-600 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-300"
                    rows={3}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!guidance.trim()}
                    className="w-full px-6 py-3 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-400 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-md disabled:shadow-none"
                >
                    Use as Guidance
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
