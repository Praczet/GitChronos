import { Request, Response } from 'express';
import simpleGit, { SimpleGit } from 'simple-git';
import { ServerResponse } from '../models/ServerResponse.js';
import HttpService from '../models/HttpService.js';


export const getGit = (req: Request, res: Response): SimpleGit | undefined => {
  try {

    const parameters = HttpService.createResponseObject(req);
    const gitOptions = parameters && parameters.path ? parameters.path : undefined;
    const git = simpleGit(gitOptions);
    return git;
  }
  catch (error) {
    const response = new ServerResponse('Failed to get git', 'error', 500, null, error);
    res.status(500).json(response);
  }
};

export const getGitInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const git = getGit(req, res);
    if (!git) throw new Error('Failed to get git');
    const gitInfo = await git.status();
    const response = new ServerResponse('Git info fetched successfully', 'info', 200, gitInfo);
    res.status(200).json(response);
  } catch (error) {
    const response = new ServerResponse('Failed to fetch git info', 'error', 500, null, error);
    res.status(500).json(response);
  }
};

export const getCommits = async (req: Request, res: Response): Promise<void> => {
  try {
    const git = getGit(req, res);
    if (!git) throw new Error('Failed to get git');
    const gitLog = await git.log();
    const response = new ServerResponse('Commit history fetched successfully', 'info', 200, gitLog.all);
    res.status(200).json(response);
  } catch (error) {
    const response = new ServerResponse('Failed to fetch commit history', 'error', 500, null, error);
    res.status(500).json(response);
  }
};

export const getLogGraph = async (req: Request, res: Response): Promise<void> => {
  try {
    const git = getGit(req, res);
    if (!git) throw new Error('Failed to get git');
    // const gitLog = await git.log();
    const gitLog = await git.log({ '--all': null, '--pretty=format:"%h|%p|%d|%ad"': null, '--date=iso': null });
    // const gitLog = await git.log({ '--graph': null, '--decorate': null, '--all': null });
    let log = gitLog.all;
    let graph: { commit: string, parents: string[], refs: string, cDate: string }[] = [];
    if (log.length === 1) {
      let lines = log[0].hash.split('\n');
      lines.forEach((line: string) => {
        line = line.replace(/^"|"$/g, '');
        let parts = line.split('|');
        if (parts.length === 4) {
          let commit = parts[0];
          let parents = parts[1].split(' ');
          let refs = parts[2].replace(/^ \(/, "(");
          let cDate = parts[3];
          graph.push({ commit, parents, refs, cDate });
        }
      });
    }
    const response = new ServerResponse('Commit history fetched successfully', 'info', 200, graph);
    res.status(200).json(response);
  } catch (error) {
    const response = new ServerResponse('Failed to fetch commit history', 'error', 500, null, error);
    res.status(500).json(response);
  }
}



export const getBranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const git = getGit(req, res);
    if (!git) throw new Error('Failed to get git');
    const gitBranches = await git.branchLocal();
    const response = new ServerResponse('Branches fetched successfully', 'info', 200, gitBranches.all);
    res.status(200).json(response);
  } catch (error) {
    const response = new ServerResponse('Failed to fetch branches', 'error', 500, null, error);
    res.status(500).json(response);
  }
};

export const getTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const git = getGit(req, res);
    if (!git) throw new Error('Failed to get git');
    const gitTags = await git.tags();
    const response = new ServerResponse('Tags fetched successfully', 'info', 200, gitTags.all);
    res.status(200).json(response);
  } catch (error) {
    const response = new ServerResponse('Failed to fetch tags', 'error', 500, null, error);
    res.status(500).json(response);
  }
}

export const getCommit = async (req: Request, res: Response): Promise<void> => {
  try {
    const git = getGit(req, res);
    if (!git) throw new Error('Failed to get git');
    const parameters = HttpService.createResponseObject(req);
    if (!parameters || !parameters.commitHash) throw new Error('Failed to get commit hash');
    const commitHash = parameters.commitHash;
    // const gitCommit = await git.show(commitHash);
    const gitCommit = await git.show([commitHash, '--pretty=format:%h|=!=|%an|=!=|%ae|=!=|%ad|=!=|%s|=!=|%b|=!=|', '--name-status', "--date=iso"]);
    let resData = {};
    if (gitCommit && gitCommit !== '') {
      let lData = gitCommit.split('|=!=|');
      if (lData && lData.length === 7) {
        const lfiles = lData[6].trim().split('\n');
        const temp: { status: string, file: string }[] = [];
        lfiles.forEach((file: string) => {
          let parts = file.trim().split('\t');
          if (parts.length === 2) {
            temp.push({ status: parts[0], file: parts[1] });
          }
        });
        resData = {
          commit: lData[0],
          author: lData[1],
          email: lData[2],
          cDate: lData[3],
          message: lData[4],
          body: lData[5],
          files: temp
        }
      }
    }
    const response = new ServerResponse('Commit fetched successfully', 'info', 200, resData);
    res.status(200).json(response);
  } catch (error) {
    const response = new ServerResponse('Failed to fetch commit', 'error', 500, null, error);
    res.status(500).json(response);
  }
};
