import React, { forwardRef } from 'react';

interface StoryPanelProps {
  story: string[];
}

export const StoryPanel = forwardRef<HTMLDivElement, StoryPanelProps>(({ story }, ref) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner h-full overflow-y-auto custom-scrollbar">
      <div className="prose prose-invert prose-lg max-w-none font-serif">
        {story.length > 0 ? (
          story.map((paragraph, index) => (
            <p key={index} className="opacity-85 leading-relaxed text-gray-300 transition-opacity duration-500 hover:opacity-100">
              {paragraph}
            </p>
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