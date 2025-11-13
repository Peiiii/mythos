
import React from 'react';
import { LoadingSpinner, RefreshIcon } from './icons';

interface SuggestionPanelProps {
  suggestions: string[];
  isLoading: boolean;
  onSelect: (suggestion: string) => void;
  onRegenerate: () => void;
  hasStory: boolean;
}

const SuggestionCard: React.FC<{ text: string; onClick: () => void }> = ({ text, onClick }) => (
    <div 
        className="bg-gray-800 p-4 rounded-lg cursor-pointer border border-gray-700 hover:border-amber-400 hover:bg-gray-700/50 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-amber-500/10"
        onClick={onClick}
    >
        <p className="text-gray-300">{text}</p>
    </div>
);

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ suggestions, isLoading, onSelect, onRegenerate, hasStory }) => {
  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-gray-800/30 rounded-lg p-8">
        <LoadingSpinner />
        <p className="mt-4 text-amber-400 animate-pulse">The muses are thinking...</p>
      </div>
    );
  }

  if (suggestions.length === 0 && hasStory) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-gray-800/30 rounded-lg p-8 border border-dashed border-gray-700">
        <p className="text-gray-500 text-center">
            The next chapter awaits your command.
            <br/>
            Provide guidance below to generate new paths for your story.
        </p>
      </div>
    );
  }
  
  if(suggestions.length === 0 && !hasStory) {
    return null; // Don't show anything on initial load
  }

  return (
    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-amber-300/80">Choose the next path...</h2>
                {suggestions.length > 0 && (
                    <button 
                        onClick={onRegenerate}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors duration-200 disabled:opacity-50"
                        title="Regenerate suggestions"
                    >
                        <RefreshIcon className="w-4 h-4" />
                        Regenerate
                    </button>
                )}
            </div>
            {suggestions.map((suggestion, index) => (
                <SuggestionCard key={index} text={suggestion} onClick={() => onSelect(suggestion)} />
            ))}
        </div>
    </div>
  );
};
