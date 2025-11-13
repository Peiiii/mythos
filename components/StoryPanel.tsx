
import React, { forwardRef, useState } from 'react';
import { ImageIcon, EyeIcon } from './icons';
import { StoryBlock } from '../types';

interface StoryPanelProps {
  story: StoryBlock[];
  onVisualize: (block: StoryBlock) => void;
  onViewVisualization: (block: StoryBlock) => void;
}

const StoryParagraph: React.FC<{ block: StoryBlock; onVisualize: () => void; onViewVisualization: () => void; }> = ({ block, onVisualize, onViewVisualization }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative group"
        >
            <p className="opacity-85 leading-relaxed text-gray-300 transition-opacity duration-500 hover:opacity-100">
                {block.text}
            </p>
            {isHovered && (
                block.image ? (
                    <button
                        onClick={onViewVisualization}
                        className="absolute -top-2 -right-2 p-2 bg-gray-700 rounded-full text-sky-400 hover:bg-gray-600 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="View visualized scene"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={onVisualize}
                        className="absolute -top-2 -right-2 p-2 bg-gray-700 rounded-full text-amber-400 hover:bg-gray-600 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Visualize this scene"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                )
            )}
        </div>
    );
};


export const StoryPanel = forwardRef<HTMLDivElement, StoryPanelProps>(({ story, onVisualize, onViewVisualization }, ref) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner h-full overflow-y-auto custom-scrollbar">
      <div className="prose prose-invert prose-lg max-w-none font-serif">
        {story.length > 0 ? (
          story.map((block) => (
            <div key={block.id} className="my-4">
                {block.imagePrompt && block.image && (
                    <div className="mb-4 rounded-lg overflow-hidden shadow-lg border-2 border-indigo-500/30">
                        <img 
                            src={`data:image/jpeg;base64,${block.image}`} 
                            alt="Visual prompt for the following scene"
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}
                 <StoryParagraph 
                    block={block} 
                    onVisualize={() => onVisualize(block)} 
                    onViewVisualization={() => onViewVisualization(block)} 
                 />
            </div>
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
