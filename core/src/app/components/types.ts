import { Category, Difficulty, Entry, Game } from '@prisma/client';

export interface UserType {
  id: number;
  email: string;
  password: string;
  username: string;
  image?: string;
  createdAt: string;
}

export interface CategoryType {
  id: string;
  slug: string;
  name: string;
  sparql: string;
  imageUrl?: string | null;      
  isDynamic: boolean;
  updateSparql?: string | null;  
  createdAt: Date;
  updatedAt: Date;
}


export interface DifficultyType {
  id: string;
  categoryId: string;
  level: number;
  limit: number;
}

export interface EntryType {
  id: string;
  categoryId: string;
  label: string;
  norm: string;
  url: string;
}

export interface AliasType {
  id: string;
  entryId: string;
  label: string;
  norm: string;
}

export interface GameType {
  id: string;
  username: string;
  slug: string;
  difficultyId: string;
  time: number;
  targetCount: number;
  correct_count: number;
}

export interface DifficultyPickerProps {
  difficulties: Difficulty[];
  selectedDifficulty: Difficulty | null;
  onDifficultyChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

export interface GuessInputProps {
  category: Category;
  entries: Entry[];
  isDynamic: boolean;
  isGameCompleted: boolean;
  onCorrectGuess: (entry: Entry) => void;
  onIncorrectGuess: (guess: string) => void;
}

export interface LeaderboardPropsType { 
    category: Category;
    difficulties: Difficulty[];
    initialGames: Game[];
    slug: string;
}

export interface QuizGameClientPropsType { 
    category?: Category;
    difficulties?: Difficulty[]
    entries?: Entry[];
    totalEntries?: number; 
    slug: string;
    isDynamic?: boolean;
}

export interface QuizTablePropsType {
  correctGuesses: Entry[];
  incorrectGuesses: string[];
}