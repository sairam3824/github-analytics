import { GitHubClient } from '../github-client.js';
import { analyzeContributors } from '../analytics/contributors.js';

export async function contributorInsights(
  client: GitHubClient,
  owner: string,
  repo: string
) {
  const contributors = await client.getContributors(owner, repo);
  const commits = await client.getCommits(owner, repo);

  return analyzeContributors(contributors, commits);
}
