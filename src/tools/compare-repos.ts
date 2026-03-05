import { GitHubClient } from '../github-client.js';
import { repoOverview } from './repo-overview.js';

export async function compareRepos(
  client: GitHubClient,
  repos: Array<{ owner: string; repo: string }>
) {
  if (repos.length < 2 || repos.length > 3) {
    throw new Error('Please provide 2-3 repositories to compare');
  }

  const comparisons = await Promise.all(
    repos.map(({ owner, repo }) => repoOverview(client, owner, repo))
  );

  return {
    repositories: comparisons,
    comparison: {
      mostStars: comparisons.sort((a, b) => b.stars - a.stars)[0].name,
      mostForks: comparisons.sort((a, b) => b.forks - a.forks)[0].name,
      mostActive: comparisons.sort((a, b) => 
        new Date(b.lastPush).getTime() - new Date(a.lastPush).getTime()
      )[0].name
    }
  };
}
