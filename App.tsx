

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StoryPanel } from './components/StoryPanel';
import { SuggestionPanel } from './components/SuggestionPanel';
import { GuidanceInput } from './components/GuidanceInput';
import { ImagePanel } from './components/ImagePanel';
import { VisualPromptPanel } from './components/VisualPromptPanel';
import { WorldPanel } from './components/WorldPanel';
import { AddEditEntityModal } from './components/AddEditEntityModal';
import { getStoryContinuations, generateImageForParagraph, generateImagePrompt, generateSpeechForParagraph, askWorldOracle } from './services/geminiService';
import { AppState, StoryBlock, WorldEntity, OracleMessage } from './types';
import { FeatherIcon, BookOpenIcon, UsersIcon, OracleIcon, LoadingSpinner } from './components/icons';

const initialPrompts = [
    "In a city powered by forgotten magic, a young thief discovers a relic that could change everything.",
    "The last librarian on Earth is about to find out they're not alone.",
    "On the first day of the Martian colony, the lead botanist finds a plant that shouldn't exist."
];

const TabButton: React.FC<{ name: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }> = ({ name, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-lg transition-colors duration-300 ${
            isActive
                ? 'bg-gray-800/60 text-white'
                : 'text-gray-400 hover:bg-gray-800/30 hover:text-gray-200'
        }`}
    >
        {icon}
        {name}
    </button>
);

// Oracle Panel Component defined locally to avoid creating a new file
const OraclePanel: React.FC<{
    conversation: OracleMessage[];
    isLoading: boolean;
    onAsk: (question: string) => void;
}> = ({ conversation, isLoading, onAsk }) => {
    const [question, setQuestion] = useState('');
    const conversationEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim() && !isLoading) {
            onAsk(question.trim());
            setQuestion('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const Message: React.FC<{ message: OracleMessage }> = ({ message }) => {
        const isUser = message.author === 'user';
        
        if (isUser) {
            return (
                <div className="flex justify-end">
                    <div className="bg-amber-600/30 text-gray-200 p-3 rounded-lg max-w-lg">
                        <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                </div>
            );
        }
    
        return (
            <div className="flex justify-start gap-3">
                <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
                    <OracleIcon className="w-5 h-5 text-purple-300" />
                </div>
                <div className="bg-gray-900/50 p-3 rounded-lg max-w-lg">
                    <p className="text-gray-300 whitespace-pre-wrap">{message.text}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-grow flex flex-col h-full bg-gray-800/60 p-4 rounded-b-lg rounded-tr-lg min-h-0">
            <div className="flex items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <OracleIcon className="w-6 h-6 text-purple-300" />
                    World Oracle
                </h2>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {conversation.length === 0 && (
                     <div className="flex justify-start gap-3">
                        <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
                            <OracleIcon className="w-5 h-5 text-purple-300" />
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg max-w-lg">
                            <p className="text-gray-400 italic">The threads of fate are tangled. Ask, and I shall reveal what is known about your world.</p>
                        </div>
                    </div>
                )}
                {conversation.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex justify-start gap-3">
                         <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
                            <OracleIcon className="w-5 h-5 text-purple-300 animate-pulse" />
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg max-w-lg flex items-center justify-center">
                           <LoadingSpinner />
                        </div>
                    </div>
                )}
                 <div ref={conversationEndRef} />
            </div>
            <div className="mt-4 flex-shrink-0">
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your world..."
                        className="w-full bg-gray-700 text-gray-200 placeholder-gray-400 px-4 py-3 rounded-lg border-2 border-gray-600 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:outline-none transition-all duration-300 resize-none"
                        rows={2}
                        disabled={isLoading}
                    />
                     <button type="submit" className="hidden">Submit</button>
                </form>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [story, setStory] = useState<StoryBlock[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.INITIAL);
  const [lastGuidance, setLastGuidance] = useState<string | null>(null);
  const storyEndRef = useRef<HTMLDivElement>(null);

  // New state for World Building
  const [worldEntities, setWorldEntities] = useState<WorldEntity[]>([]);
  const [activeTab, setActiveTab] = useState<'writer' | 'world' | 'oracle'>('writer');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entityToEdit, setEntityToEdit] = useState<WorldEntity | null>(null);

  // Generalized visualization state
  const [isVisualizing, setIsVisualizing] = useState<boolean>(false);
  const [visualizingContent, setVisualizingContent] = useState<{ id: string, text: string, image?: string | null } | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [visualizationError, setVisualizationError] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

  // State for visual prompt
  const [visualPromptImage, setVisualPromptImage] = useState<string | null>(null);
  const [isVisualPromptLoading, setIsVisualPromptLoading] = useState<boolean>(false);
  const [visualPromptError, setVisualPromptError] = useState<string | null>(null);

  // V2: Narration State
  const [narratingBlock, setNarratingBlock] = useState<{ id: string, status: 'loading' | 'playing' | 'error' } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // V2: Oracle State
  const [oracleConversation, setOracleConversation] = useState<OracleMessage[]>([]);
  const [isOracleLoading, setIsOracleLoading] = useState<boolean>(false);

  // V2: Audio decoding functions
  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }


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
    setActiveTab('writer');
    if(appState === AppState.INITIAL) {
        setAppState(AppState.WRITING);
    }

    try {
      const storySoFar = story.map(block => block.text);
      // Pass world entities to the generation service
      const newSuggestions = await getStoryContinuations(storySoFar, userGuidance, worldEntities);
      setSuggestions(newSuggestions);
      setLastGuidance(userGuidance);
    } catch (err) {
      console.error(err);
      setError('Failed to generate suggestions. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [story, appState, worldEntities]);
  
  const handleRegenerateSuggestions = useCallback(() => {
    if (lastGuidance && !isLoading) {
      handleGenerate(lastGuidance);
    }
  }, [lastGuidance, isLoading, handleGenerate]);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    const newBlock: StoryBlock = {
      id: `${Date.now()}-${Math.random()}`,
      text: suggestion,
      image: visualPromptImage,
      imagePrompt: !!visualPromptImage,
    };

    setStory(prevStory => [...prevStory, newBlock]);
    setSuggestions([]);
    
    if (visualPromptImage) {
      setVisualPromptImage(null);
    }
    
    handleGenerate(suggestion);
  }, [handleGenerate, visualPromptImage]);

  const stopNarration = useCallback(() => {
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
    }
    setNarratingBlock(null);
  }, []);

  const handleStartOver = () => {
    setStory([]);
    setSuggestions([]);
    setError(null);
    setIsLoading(false);
    setAppState(AppState.INITIAL);
    setLastGuidance(null);
    setIsVisualizing(false);
    setVisualizingContent(null);
    setGeneratedImage(null);
    setVisualizationError(null);
    setIsGeneratingImage(false);
    setVisualPromptImage(null);
    setIsVisualPromptLoading(false);
    setVisualPromptError(null);
    setWorldEntities([]);
    setActiveTab('writer');
    setOracleConversation([]);
    setIsOracleLoading(false);
    stopNarration();
  };
  
  const handleVisualize = useCallback(async (content: { id: string, text: string }) => {
    setIsVisualizing(true);
    setVisualizingContent(content);
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    setVisualizationError(null);
    setActiveTab('writer');

    try {
        const imageData = await generateImageForParagraph(content.text);
        setGeneratedImage(imageData);
        // Save the generated image to the story block or world entity
        setStory(prevStory => 
            prevStory.map(b => b.id === content.id ? { ...b, image: imageData } : b)
        );
        setWorldEntities(prevEntities =>
            prevEntities.map(e => e.id === content.id ? { ...e, image: imageData } : e)
        );
    } catch (err) {
        console.error(err);
        setVisualizationError('Failed to evoke the scene. The muses may be busy.');
    } finally {
        setIsGeneratingImage(false);
    }
  }, []);

  const handleRegenerateVisualization = useCallback(async () => {
    if (!visualizingContent) return;
    handleVisualize(visualizingContent);
  }, [visualizingContent, handleVisualize]);

  const handleViewVisualization = useCallback((block: StoryBlock) => {
    setIsVisualizing(true);
    setVisualizingContent(block);
    setGeneratedImage(block.image || null);
    setVisualizationError(null);
    setIsGeneratingImage(false);
  }, []);


  const handleCloseVisualization = () => {
    setIsVisualizing(false);
    setVisualizingContent(null);
    setGeneratedImage(null);
    setVisualizationError(null);
  };

  const handleStartVisualPrompt = useCallback(async () => {
    setAppState(AppState.VISUAL_PROMPT);
    setIsVisualPromptLoading(true);
    setVisualPromptError(null);
    setVisualPromptImage(null);
    setSuggestions([]);

    try {
      const storySoFar = story.map(block => block.text);
      const imagePrompt = await generateImagePrompt(storySoFar);
      const imageData = await generateImageForParagraph(imagePrompt);
      setVisualPromptImage(imageData);
    } catch (err) {
      console.error(err);
      setVisualPromptError('Failed to summon inspiration. The cosmos is quiet.');
    } finally {
      setIsVisualPromptLoading(false);
    }
  }, [story]);

  const handleSubmitVisualPrompt = useCallback((guidance: string) => {
    setAppState(AppState.WRITING);
    handleGenerate(guidance);
  }, [handleGenerate]);

  const handleCancelVisualPrompt = useCallback(() => {
    setAppState(story.length > 0 ? AppState.WRITING : AppState.INITIAL);
    setVisualPromptImage(null);
    setIsVisualPromptLoading(false);
    setVisualPromptError(null);
  }, [story]);

  // World Entity Handlers
  const handleOpenModal = (entity: WorldEntity | null = null) => {
    setEntityToEdit(entity);
    setIsModalOpen(true);
  };

  const handleSaveEntity = (entity: WorldEntity) => {
    setWorldEntities(prev => {
        const exists = prev.find(e => e.id === entity.id);
        if (exists) {
            return prev.map(e => e.id === entity.id ? entity : e);
        }
        return [...prev, entity];
    });
  };

  // V2: Narration Handler
  const handleNarrate = useCallback(async (block: StoryBlock) => {
      if (narratingBlock?.id === block.id && narratingBlock?.status === 'playing') {
          stopNarration();
          return;
      }

      if (narratingBlock) {
          stopNarration();
      }

      setNarratingBlock({ id: block.id, status: 'loading' });
      
      try {
          if (!audioContextRef.current) {
              // Fix: Cast window to any to allow for webkitAudioContext for cross-browser compatibility.
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }
          const audioContext = audioContextRef.current;
          
          const base64Audio = await generateSpeechForParagraph(block.text);
          const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
          
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          
          source.onended = () => {
              if (audioSourceRef.current === source) {
                  setNarratingBlock(null);
                  audioSourceRef.current = null;
              }
          };
          
          source.start();
          audioSourceRef.current = source;
          setNarratingBlock({ id: block.id, status: 'playing' });

      } catch (err) {
          console.error("Narration failed", err);
          setNarratingBlock({ id: block.id, status: 'error' });
          setTimeout(() => {
              setNarratingBlock(current => (current?.id === block.id ? null : current));
          }, 2000);
      }
  }, [narratingBlock, stopNarration]);

  // V2: Oracle Handler
  const handleAskOracle = useCallback(async (question: string) => {
    setIsOracleLoading(true);
    const newConversation: OracleMessage[] = [...oracleConversation, { author: 'user', text: question }];
    setOracleConversation(newConversation);
    setError(null);

    try {
        const storySoFar = story.map(block => block.text);
        const answer = await askWorldOracle(question, storySoFar, worldEntities);
        setOracleConversation([...newConversation, { author: 'oracle', text: answer }]);
    } catch(err: any) {
        console.error(err);
        const errorMessage = `The Oracle is silent. ${err.message || 'An unknown disturbance occurred.'}`;
        setOracleConversation([...newConversation, { author: 'oracle', text: errorMessage }]);
    } finally {
        setIsOracleLoading(false);
    }
  }, [story, worldEntities, oracleConversation]);

  const handleTabChange = (tab: 'writer' | 'world' | 'oracle') => {
    if (isVisualizing) {
        handleCloseVisualization();
    }
    setActiveTab(tab);
  };


  return (
    <>
      <div className="min-h-screen lg:h-screen bg-gray-900 text-gray-200 flex flex-col p-4 sm:p-6 lg:p-8 font-sans lg:overflow-hidden">
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
        
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 lg:min-h-0">
          <StoryPanel 
              story={story} 
              ref={storyEndRef} 
              onVisualize={handleVisualize}
              onViewVisualization={handleViewVisualization}
              onNarrate={handleNarrate}
              narratingBlock={narratingBlock}
          />

          <div className="flex flex-col gap-2 lg:h-full lg:min-h-0">
            {isVisualizing ? (
              <ImagePanel
                  text={visualizingContent?.text || null}
                  image={generatedImage}
                  isLoading={isGeneratingImage}
                  error={visualizationError}
                  onClose={handleCloseVisualization}
                  onRegenerate={handleRegenerateVisualization}
                />
            ) : appState === AppState.VISUAL_PROMPT ? (
              <VisualPromptPanel
                image={visualPromptImage}
                isLoading={isVisualPromptLoading}
                error={visualPromptError}
                onSubmit={handleSubmitVisualPrompt}
                onCancel={handleCancelVisualPrompt}
                onRegenerate={handleStartVisualPrompt}
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
                
                {appState !== AppState.INITIAL && (
                    <div className="flex border-b border-gray-700">
                        <TabButton name="Writer" icon={<BookOpenIcon className="w-5 h-5"/>} isActive={activeTab === 'writer'} onClick={() => handleTabChange('writer')} />
                        <TabButton name="World" icon={<UsersIcon className="w-5 h-5"/>} isActive={activeTab === 'world'} onClick={() => handleTabChange('world')} />
                        <TabButton name="Oracle" icon={<OracleIcon className="w-5 h-5"/>} isActive={activeTab === 'oracle'} onClick={() => handleTabChange('oracle')} />
                    </div>
                )}

                <div className="flex-grow flex flex-col min-h-0">
                    {/* Fix: Refactor conditional rendering to simplify logic and resolve potential TypeScript type inference errors. */}
                    {appState !== AppState.INITIAL && (
                        <>
                            {activeTab === 'writer' && (
                                <SuggestionPanel 
                                    suggestions={suggestions} 
                                    isLoading={isLoading} 
                                    onSelect={handleSelectSuggestion}
                                    onRegenerate={handleRegenerateSuggestions}
                                    hasStory={story.length > 0}
                                />
                            )}
                            {activeTab === 'world' && (
                                <WorldPanel 
                                    entities={worldEntities} 
                                    onAddEntity={() => handleOpenModal()} 
                                    onEditEntity={(entity) => handleOpenModal(entity)}
                                    onVisualize={(entity) => handleVisualize({id: entity.id, text: `${entity.type}: ${entity.name}\n${entity.description}`})}
                                />
                            )}
                            {activeTab === 'oracle' && (
                                <OraclePanel 
                                  conversation={oracleConversation}
                                  isLoading={isOracleLoading}
                                  onAsk={handleAskOracle}
                                />
                            )}
                        </>
                    )}
                </div>

                {(appState === AppState.INITIAL || (appState !== AppState.INITIAL && activeTab === 'writer')) && (
                    <GuidanceInput onGenerate={handleGenerate} onVisualPrompt={handleStartVisualPrompt} isLoading={isLoading || isVisualPromptLoading || isOracleLoading} isInitial={appState === AppState.INITIAL} />
                )}
              </>
            )}
          </div>
        </main>
        
        {error && !isVisualizing && appState !== AppState.VISUAL_PROMPT && (
          <div className="fixed bottom-4 right-4 bg-red-800 text-white p-4 rounded-lg shadow-lg">
            <p><span className="font-bold">Error:</span> {error}</p>
          </div>
        )}
      </div>
      <AddEditEntityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEntity}
        entityToEdit={entityToEdit}
      />
    </>
  );
};

export default App;