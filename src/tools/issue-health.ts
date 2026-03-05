import { GitHubClient } from '../github-client.js';
import { analyzeIssues } from '../analytics/issues.js';

export async function issueHealth(client: GitHubClient, owner: string, repo: string) {
  const issues = await client.getIssues(owner, repo, 'all');
  return analyzeIssues(issues);
}
