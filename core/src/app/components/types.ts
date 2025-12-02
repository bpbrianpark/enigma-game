import { Alias, Category, Difficulty, Entry, Game, User } from "@prisma/client";

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
  isDaily?: boolean | null;
  hasBeenSelected?: boolean | null;
  playedOn?: Date | null;
  tags?: string[];
}

export interface TagCardProps {
  tagName: string;
  categories: CategoryType[];
  imageUrl?: string | null;
}

export interface DifficultyType {
  id: string;
  categoryId: string;
  level: number;
  limit: number;
  timeLimit: number | null;
  name?: string;
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
  isBlitzGame?: boolean | null;
}

export interface DifficultyPickerProps {
  difficulties: DifficultyType[];
  selectedDifficulty: DifficultyType | null;
  onDifficultyChange: (difficulty: DifficultyType) => void;
  disabled?: boolean;
  isDaily?: boolean;
}

export interface GuessInputProps {
  aliases: Alias[];
  category: Category;
  disabled: boolean;
  entries: Entry[];
  isDynamic: boolean;
  isGameCompleted: boolean;
  onCorrectGuess: (entry: EntryType) => void;
  onIncorrectGuess: (guess: string) => void;
  correctGuesses?: EntryType[];
  incorrectGuesses?: string[];
}

export interface LeaderboardPropsType {
  category: Category;
  difficulties: Difficulty[];
  initialGames: Game[];
  slug: string;
}

export interface QuizGameClientPropsType {
  aliases?: Alias[];
  category?: Category;
  difficulties?: Difficulty[];
  entries?: Entry[];
  totalEntries?: number;
  slug: string;
  isDynamic?: boolean;
}

export interface QuizTablePropsType {
  correctGuesses: EntryType[];
  incorrectGuesses: string[];
}

export interface ProfileClientPropsType {
  categories: Category[];
  difficulties: Difficulty[];
  user: User;
  games: Game[];
}

export interface CompletedDialogPropsType {
  isOpen: boolean;
  onClose: () => void;
  finalTime: number;
  correctGuesses: number;
  targetEntries: number;
  categoryName: string;
  difficultyName: string;
  isLoggedIn: boolean;
  gameType: string;
}

export interface InfoDialogPropsType {
  isOpen: boolean;
  onClose: () => void;
  gameType?: string;
}
