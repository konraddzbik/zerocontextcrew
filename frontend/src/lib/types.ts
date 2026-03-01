export interface StoryRequest {
  characterName: string;
  characterType: 'girl' | 'boy' | 'animal' | 'creature';
  animalCompanion: string;
  world: 'forest' | 'ocean' | 'mountains' | 'arctic';
  ageRange: '4-6' | '6-8';
}

export interface Story {
  storyId: string;
  title: string;
  chapters: Chapter[];
  summary: ParentSummary;
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  text: string;
  illustrations: Illustration[];
  audioUrl?: string;
  ecoFact?: string;
  choice?: {
    question: string;
    options: ChoiceOption[];
  };
}

export interface Illustration {
  id: string;
  imageUrl: string;
  altText: string;
  position: 'inline' | 'full-width';
}

export interface ChoiceOption {
  id: string;
  label: string;
  consequence: string;
  lessonTag: string;
}

export interface ParentSummary {
  lessonsLearned: string[];
  ecoFactsCovered: string[];
  choicesMade: { question: string; chosen: string; lesson: string }[];
}
