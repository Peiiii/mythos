
import React, { useState } from 'react';

interface GuidanceInputProps {
  onGenerate: (guidance: string) => void;
  isLoading: boolean;
  isInitial: boolean;
}

export const GuidanceInput: React.FC<GuidanceInputProps> = ({ onGenerate, isLoading, isInitial }) => {
  const [guidance, setGuidance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guidance.trim() && !isLoading) {
      onGenerate(guidance);
      setGuidance('');
    }
  };

  return (
    <div className="mt-auto pt-4">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          placeholder={isInitial ? "Write the first sentence..." : "Guide the story, e.g., 'Introduce a villain'"}
          className="flex-grow bg-gray-700 text-gray-200 placeholder-gray-400 px-4 py-3 rounded-lg border-2 border-gray-600 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none transition-all duration-300"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !guidance.trim()}
          className="px-6 py-3 bg-amber-500 text-gray-900 font-bold rounded-lg hover:bg-amber-400 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-md disabled:shadow-none"
        >
          {isLoading ? 'Generating...' : isInitial ? 'Begin Story' : 'Generate'}
        </button>
      </form>
    </div>
  );
};
