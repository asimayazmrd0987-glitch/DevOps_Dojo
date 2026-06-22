export interface LabStep {
  id: string;
  number: number;
  title: string;
  instructions: string; // Markdown content
  objective: string; // short summary of what is checked
  hint: string;
}

export type CategoryType = 'linux' | 'docker' | 'kubernetes' | 'cicd';

export interface Lab {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeMinutes: number;
  points: number;
  steps: LabStep[];
  startingFiles: FileSystemState;
}

export interface FileNode {
  name: string;
  isDir: boolean;
  content?: string;
  children?: { [key: string]: FileNode };
}

export interface FileSystemState {
  [key: string]: FileNode;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  text: string;
  dir?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  labsCompleted: string[];
  currentStreak: number;
}
