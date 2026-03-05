import { GitHubClient } from '../github-client.js';

export async function releaseCadence(client: GitHubClient, owner: string, repo: string) {
  const releases = await client.getReleases(owner, repo);

  if (releases.length === 0) {
    return { error: 'No releases found' };
  }

  const timeBetweenReleases: number[] = [];
  for (let i = 0; i < releases.length - 1; i++) {
    const current = new Date(releases[i].published_at || releases[i].created_at).getTime();
    const previous = new Date(releases[i + 1].published_at || releases[i + 1].created_at).getTime();
    const days = (current - previous) / (1000 * 60 * 60 * 24);
    timeBetweenReleases.push(days);
  }

  const avgDaysBetween = timeBetweenReleases.length > 0
    ? timeBetweenReleases.reduce((a, b) => a + b, 0) / timeBetweenReleases.length
    : 0;

  const semverPattern = /^v?\d+\.\d+\.\d+/;
  const semverCompliant = releases.filter(r => semverPattern.test(r.tag_name)).length;

  return {
    totalReleases: releases.length,
    latestRelease: {
      name: releases[0].name,
      tag: releases[0].tag_name,
      publishedAt: releases[0].published_at
    },
    avgDaysBetweenReleases: avgDaysBetween.toFixed(1),
    semverCompliance: `${((semverCompliant / releases.length) * 100).toFixed(1)}%`,
    recentReleases: releases.slice(0, 5).map(r => ({
      tag: r.tag_name,
      name: r.name,
      publishedAt: r.published_at
    }))
  };
}
