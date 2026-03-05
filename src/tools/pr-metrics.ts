import { GitHubClient } from '../github-client.js';
import { analyzePRs } from '../analytics/prs.js';

export async function prMetrics(client: GitHubClient, owner: string, repo: string) {
  const prs = await client.getPullRequests(owner, repo, 'all');
  return analyzePRs(prs);
}
