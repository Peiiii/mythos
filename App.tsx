
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StoryPanel } from './components/StoryPanel';
import { SuggestionPanel } from './components/SuggestionPanel';
import { GuidanceInput } from './components/GuidanceInput';
import { ImagePanel } from './components/ImagePanel';
import { getStoryContinuations, generateImageForParagraph } from './services/geminiService';
import { AppState } from './types';
import { FeatherIcon } from './components/icons';

const initialPrompts = [
    "In a city powered by forgotten magic, a young thief discovers a relic that could change everything.",
    "The last librarian on Earth is about to find out they're not alone.",
    "On the first day of the Martian colony, the lead botanist finds a plant that shouldn't exist."
];

const App: React.FC = () => {
  const [story, setStory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.INITIAL);
  const storyEndRef = useRef<HTMLDivElement>(null);

  // State for visualization
  const [isVisualizing, setIsVisualizing] = useState<boolean>(false);
  const [visualizationParagraph, setVisualizationParagraph] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [visualizationError, setVisualizationError] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

  const scrollToBottom = () => {
    storyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [story]);

  const handleGenerate = useCallback(async (userGuidance: string) => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    if(appState === AppState.INITIAL) {
        setAppState(AppState.WRITING);
    }

    try {
      const newSuggestions = await getStoryContinuations(story, userGuidance);
      setSuggestions(newSuggestions);
    } catch (err) {
      console.error(err);
      setError('Failed to generate suggestions. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [story, appState]);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setStory(prevStory => [...prevStory, suggestion]);
    setSuggestions([]);
    
    // Automatically generate next suggestions, using the selected suggestion
    // as the new guidance to maintain language continuity.
    handleGenerate(suggestion);
  }, [handleGenerate]);

  const handleStartOver = () => {
    setStory([]);
    setSuggestions([]);
    setError(null);
    setIsLoading(false);
    setAppState(AppState.INITIAL);
    // Reset visualization state
    setIsVisualizing(false);
    setVisualizationParagraph(null);
    setGeneratedImage(null);
    setVisualizationError(null);
    setIsGeneratingImage(false);
  };

  const handleVisualize = useCallback(async (paragraph: string) => {
    setIsVisualizing(true);
    setVisualizationParagraph(paragraph);
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    setVisualizationError(null);

    try {
        const imageData = await generateImageForParagraph(paragraph);
        setGeneratedImage(imageData);
    } catch (err) {
        console.error(err);
        setVisualizationError('Failed to evoke the scene. The muses may be busy.');
    } finally {
        setIsGeneratingImage(false);
    }
  }, []);

  const handleCloseVisualization = () => {
    setIsVisualizing(false);
    setVisualizationParagraph(null);
    setGeneratedImage(null);
    setVisualizationError(null);
  };

  return (
    <div className="h-screen bg-gray-900 text-gray-200 flex flex-col p-4 sm:p-6 lg:p-8 font-sans">
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
            <FeatherIcon className="w-8 h-8 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wider">
              Mythos
            </h1>
        </div>
        {appState !== AppState.INITIAL && (
            <button
            onClick={handleStartOver}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300"
            >
            Start Over
            </button>
        )}
      </header>
      
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <StoryPanel story={story} ref={storyEndRef} onVisualize={handleVisualize} />

        <div className="flex flex-col gap-8 h-full min-h-0">
          {isVisualizing ? (
             <ImagePanel
                paragraph={visualizationParagraph}
                image={generatedImage}
                isLoading={isGeneratingImage}
                error={visualizationError}
                onClose={handleCloseVisualization}
              />
          ) : (
            <>
              {appState === AppState.INITIAL && (
                <div className="flex flex-col items-center justify-center h-full bg-gray-800/50 rounded-lg p-8 border border-dashed border-gray-600">
                    <FeatherIcon className="w-16 h-16 text-gray-500 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to your novel.</h2>
                    <p className="text-gray-400 text-center max-w-md mb-8">
                    Start by writing an opening line, describing a character, or setting a scene. The AI will provide you with paths to continue.
                    </p>
                    <div className="w-full max-w-xl">
                        <p className="text-center text-gray-500 mb-3 text-sm font-semibold tracking-wider">OR TRY A STARTING POINT</p>
                        <div className="flex flex-col gap-3">
                            {initialPrompts.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleGenerate(prompt)}
                                    disabled={isLoading}
                                    className="text-left p-3 bg-gray-700/60 rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <p className="text-gray-300 font-serif italic">"{prompt}"</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
              )}
              
              <SuggestionPanel 
                suggestions={suggestions} 
                isLoading={isLoading} 
                onSelect={handleSelectSuggestion}
                hasStory={story.length > 0}
              />
              
              <GuidanceInput onGenerate={handleGenerate} isLoading={isLoading} isInitial={appState === AppState.INITIAL} />
            </>
          )}
        </div>
      </main>
      
      {error && !isVisualizing && (
        <div className="fixed bottom-4 right-4 bg-red-800 text-white p-4 rounded-lg shadow-lg">
          <p><span className="font-bold">Error:</span> {error}</p>
        </div>
      )}
    </div>
  );
};

export default App;
