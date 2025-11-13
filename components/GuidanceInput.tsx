
import React, { useState } from 'react';
import { WandIcon } from './icons';

interface GuidanceInputProps {
  onGenerate: (guidance: string) => void;
  onVisualPrompt: () => void;
  isLoading: boolean;
  isInitial: boolean;
}

export const GuidanceInput: React.FC<GuidanceInputProps> = ({ onGenerate, onVisualPrompt, isLoading, isInitial }) => {
  const [guidance, setGuidance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guidance.trim() && !isLoading) {
      onGenerate(guidance);
      setGuidance('');
    }
  };

  return (
    <div className="pt-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          placeholder={isInitial ? "Write the first sentence..." : "Guide the story, e.g., 'Introduce a villain'"}
          className="flex-grow bg-gray-700 text-gray-200 placeholder-gray-400 px-4 py-3 rounded-lg border-2 border-gray-600 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none transition-all duration-300"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={onVisualPrompt}
          disabled={isLoading}
          className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-md disabled:shadow-none flex-shrink-0"
          title="Get a visual prompt"
        >
          <WandIcon className="w-6 h-6" />
        </button>
        <button
          type="submit"
          disabled={isLoading || !guidance.trim()}
          className="px-6 py-3 bg-amber-500 text-gray-900 font-bold rounded-lg hover:bg-amber-400 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-md disabled:shadow-none flex-shrink-0"
        >
          {isLoading ? 'Generating...' : isInitial ? 'Begin Story' : 'Generate'}
        </button>
      </form>
    </div>
  );
};
