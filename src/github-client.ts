import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';
import { Cache } from './cache.js';

export class GitHubClient {
  private octokit: Octokit;
  private graphqlClient: typeof graphql;
  private cache: Cache;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
    this.graphqlClient = graphql.defaults({
      headers: { authorization: `token ${token}` }
    });
    this.cache = new Cache();
  }

  async getRepo(owner: string, repo: string): Promise<any> {
    const key = `repo:${owner}/${repo}`;
    const cached = this.cache.get<any>(key);
    if (cached) return cached;

    const data = await this.octokit.repos.get({ owner, repo });
    this.cache.set(key, data.data, 3600000); // 1 hour
    return data.data;
  }

  async getCommits(owner: string, repo: string, since?: string, until?: string) {
    const commits = await this.octokit.paginate(this.octokit.repos.listCommits, {
      owner,
      repo,
      since,
      until,
      per_page: 100
    });
    return commits;
  }

  async getContributors(owner: string, repo: string): Promise<any> {
    const key = `contributors:${owner}/${repo}`;
    const cached = this.cache.get<any>(key);
    if (cached) return cached;

    const contributors = await this.octokit.paginate(this.octokit.repos.listContributors, {
      owner,
      repo,
      per_page: 100
    });
    this.cache.set(key, contributors, 300000); // 5 min
    return contributors;
  }

  async getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all') {
    const prs = await this.octokit.paginate(this.octokit.pulls.list, {
      owner,
      repo,
      state,
      per_page: 100,
      sort: 'updated',
      direction: 'desc'
    });
    return prs.slice(0, 500); // Limit to recent 500
  }

  async getIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all') {
    const issues = await this.octokit.paginate(this.octokit.issues.listForRepo, {
      owner,
      repo,
      state,
      per_page: 100
    });
    return issues.filter(i => !i.pull_request).slice(0, 500);
  }

  async getCodeFrequency(owner: string, repo: string) {
    const { data } = await this.octokit.repos.getCodeFrequencyStats({ owner, repo });
    return data;
  }

  async getReleases(owner: string, repo: string) {
    const releases = await this.octokit.paginate(this.octokit.repos.listReleases, {
      owner,
      repo,
      per_page: 100
    });
    return releases;
  }

  async getLanguages(owner: string, repo: string) {
    const { data } = await this.octokit.repos.listLanguages({ owner, repo });
    return data;
  }

  async getContent(owner: string, repo: string, path: string) {
    try {
      const { data } = await this.octokit.repos.getContent({ owner, repo, path });
      return data;
    } catch {
      return null;
    }
  }
}
