
import React, { forwardRef, useState } from 'react';
import { ImageIcon } from './icons';

interface StoryPanelProps {
  story: string[];
  onVisualize: (paragraph: string) => void;
}

const StoryParagraph: React.FC<{ paragraph: string; onVisualize: () => void }> = ({ paragraph, onVisualize }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <p 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative opacity-85 leading-relaxed text-gray-300 transition-opacity duration-500 hover:opacity-100 group"
        >
            {paragraph}
            {isHovered && (
                 <button
                    onClick={onVisualize}
                    className="absolute -top-2 -right-2 p-2 bg-gray-700 rounded-full text-amber-400 hover:bg-gray-600 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Visualize this scene"
                 >
                    <ImageIcon className="w-5 h-5" />
                </button>
            )}
        </p>
    );
};


export const StoryPanel = forwardRef<HTMLDivElement, StoryPanelProps>(({ story, onVisualize }, ref) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner h-full overflow-y-auto custom-scrollbar">
      <div className="prose prose-invert prose-lg max-w-none font-serif">
        {story.length > 0 ? (
          story.map((paragraph, index) => (
            <StoryParagraph key={index} paragraph={paragraph} onVisualize={() => onVisualize(paragraph)} />
          ))
        ) : (
          <p className="text-gray-500 italic">Your story will appear here...</p>
        )}
      </div>
       <div ref={ref} />
    </div>
  );
});

StoryPanel.displayName = 'StoryPanel';
