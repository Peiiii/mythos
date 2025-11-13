
export enum AppState {
    INITIAL = 'INITIAL',
    WRITING = 'WRITING',
    VISUAL_PROMPT = 'VISUAL_PROMPT',
}

export interface StoryBlock {
  id: string;
  text: string;
  image?: string | null;
  imagePrompt?: boolean;
}
