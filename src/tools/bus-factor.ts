import { GitHubClient } from '../github-client.js';

export async function busFactor(client: GitHubClient, owner: string, repo: string) {
  const contributors = await client.getContributors(owner, repo);

  const sorted = contributors.sort((a: any, b: any) => b.contributions - a.contributions);
  const totalCommits = sorted.reduce((sum: number, c: any) => sum + c.contributions, 0);

  let cumulativeCommits = 0;
  let factor = 0;
  const criticalContributors = [];

  for (const contributor of sorted) {
    cumulativeCommits += contributor.contributions;
    factor++;
    criticalContributors.push({
      login: contributor.login,
      contributions: contributor.contributions,
      percentage: ((contributor.contributions / totalCommits) * 100).toFixed(1) + '%'
    });

    if (cumulativeCommits >= totalCommits * 0.5) {
      break;
    }
  }

  return {
    busFactor: factor,
    interpretation: factor === 1
      ? 'CRITICAL: Single point of failure'
      : factor <= 3
        ? 'HIGH RISK: Very few key contributors'
        : factor <= 5
          ? 'MODERATE: Limited contributor diversity'
          : 'HEALTHY: Good contributor distribution',
    criticalContributors,
    totalContributors: contributors.length
  };
}
