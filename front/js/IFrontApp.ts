export interface IGraph {
  commit: string,
  parents: string[],
  refs: string,
  cDate: string,
  files?: string[],
  author?: string,
  message?: string
}
