
export interface IProjectConfig {
  uuid?: number;
  name: string;
  path: string;
  theme?: 'dark' | 'light';
  lastView?: {
    type: 'timeline' | 'file';
    data: any;
  };
}

export interface IConfig {
  projects: IProjectConfig[];
  globalSettings: {
    theme: 'dark' | 'light';
  };
}
