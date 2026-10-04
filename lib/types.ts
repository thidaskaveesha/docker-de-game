export interface VirtualFile {
  name: string;
  content: string;
  isReadOnly?: boolean;
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
}

export interface PortMapping {
  hostPort: string;
  containerPort: string;
}

export interface DockerContainer {
  id: string;
  name: string;
  imageId: string;
  imageName: string;
  status: 'running' | 'exited';
  command: string;
  ports: PortMapping[];
  env: Record<string, string>;
  webContent?: string;
  created: string;
  logs: string[];
}

export interface DockerEngineState {
  files: VirtualFile[];
  images: DockerImage[];
  containers: DockerContainer[];
  history: string[];
}

export interface MissionGoal {
  id: string;
  text: string;
  hint: string;
  isCompleted: boolean;
  validate: (state: DockerEngineState, lastCommand: string) => boolean;
}

export interface Mission {
  id: number;
  title: string;
  category: string;
  description: string;
  initialFiles: VirtualFile[];
  goals: MissionGoal[];
  solutionCommands: string[];
  badgeName: string;
}
