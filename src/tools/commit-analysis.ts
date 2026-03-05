import { GitHubClient } from '../github-client.js';
import { analyzeCommits } from '../analytics/commits.js';

export async function commitAnalysis(
  client: GitHubClient,
  owner: string,
  repo: string,
  days: number = 90
) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const commits = await client.getCommits(owner, repo, since);

  return analyzeCommits(commits);
}
