
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

export enum EntityType {
    CHARACTER = 'Character',
    LOCATION = 'Location',
    ITEM = 'Item',
}

export interface WorldEntity {
    id: string;
    name: string;
    description: string;
    type: EntityType;
    image?: string | null;
}
