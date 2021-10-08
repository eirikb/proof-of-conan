export interface Target {
  os: string;
  container: string;
  toolchain: string;
  cmd: string;
  enabled: boolean;
}

export interface Job {
  os: string;
  container: string;
  toolchain: string;
  toolchainos: string;
  conancmd: string;
  path: string;
}

export interface Version {
  tag: string;
  path: string;
  selected: boolean;
}

export interface Preset {
  name: string;
  targets: Target[];
}

export interface Data {
  lookupInfo: string;
  repoUrl: string;
  formHidden: boolean;
  repository?: string;
  path?: string;
  branch?: string;
  package?: string;
  versions: Version[];
  jobs: Job[];
  status: string;
  done: boolean;
  presets: Preset[];
  preset: string;
  targets: Target[];
}
