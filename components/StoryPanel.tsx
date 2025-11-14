
import React, { forwardRef, useState } from 'react';
import { ImageIcon, EyeIcon, SpeakerIcon, SpeakerWaveIcon, LoadingSpinner } from './icons';
import { StoryBlock } from '../types';

interface StoryPanelProps {
  story: StoryBlock[];
  onVisualize: (block: StoryBlock) => void;
  onViewVisualization: (block: StoryBlock) => void;
  onNarrate: (block: StoryBlock) => void;
  narratingBlock: { id: string, status: 'loading' | 'playing' | 'error' } | null;
}

const StoryParagraph: React.FC<{
    block: StoryBlock; 
    onVisualize: () => void; 
    onViewVisualization: () => void;
    onNarrate: () => void;
    narrationStatus: 'loading' | 'playing' | 'error' | null;
}> = ({ block, onVisualize, onViewVisualization, onNarrate, narrationStatus }) => {
    const [isHovered, setIsHovered] = useState(false);

    const showActions = isHovered || narrationStatus === 'loading' || narrationStatus === 'playing';

    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative group"
        >
            <p className="opacity-85 leading-relaxed text-gray-300 transition-opacity duration-500 hover:opacity-100">
                {block.text}
            </p>
             <div
                className="absolute -top-3 -right-2 flex items-center gap-1 bg-gray-800 p-1 rounded-full shadow-lg transition-opacity duration-200"
                style={{ opacity: showActions ? 1 : 0, pointerEvents: showActions ? 'auto' : 'none' }}
            >
                <button
                    onClick={onNarrate}
                    className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 hover:scale-110 transition-all duration-200 flex items-center justify-center w-9 h-9"
                    title={narrationStatus === 'playing' ? "Stop narration" : "Listen to this paragraph"}
                    disabled={narrationStatus === 'loading'}
                >
                    {narrationStatus === 'loading' && <LoadingSpinner />}
                    {narrationStatus === 'playing' && <SpeakerWaveIcon className="w-5 h-5 text-green-400" />}
                    {narrationStatus !== 'loading' && narrationStatus !== 'playing' && <SpeakerIcon className="w-5 h-5 text-sky-400" />}
                </button>
                {block.image ? (
                    <button
                        onClick={onViewVisualization}
                        className="p-2 bg-gray-700 rounded-full text-sky-400 hover:bg-gray-600 hover:scale-110 transition-all duration-200"
                        title="View visualized scene"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={onVisualize}
                        className="p-2 bg-gray-700 rounded-full text-amber-400 hover:bg-gray-600 hover:scale-110 transition-all duration-200"
                        title="Visualize this scene"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};


export const StoryPanel = forwardRef<HTMLDivElement, StoryPanelProps>(({ story, onVisualize, onViewVisualization, onNarrate, narratingBlock }, ref) => {
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
                    onNarrate={() => onNarrate(block)}
                    narrationStatus={narratingBlock?.id === block.id ? narratingBlock.status : null}
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
