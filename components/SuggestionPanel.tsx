import React from 'react';
import { LoadingSpinner } from './icons';

interface SuggestionPanelProps {
  suggestions: string[];
  isLoading: boolean;
  onSelect: (suggestion: string) => void;
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

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ suggestions, isLoading, onSelect, hasStory }) => {
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
            <h2 className="text-xl font-bold text-amber-300/80 mb-2">Choose the next path...</h2>
            {suggestions.map((suggestion, index) => (
                <SuggestionCard key={index} text={suggestion} onClick={() => onSelect(suggestion)} />
            ))}
        </div>
    </div>
  );
};