export interface ICommit {
  commit: string,
  parents: string[],
  refs: string,
  cDate: string,
  author?: string,
  message?: string,
  email?: string,
  body?: string,
  files?: { status: string, file: string }[]
}
