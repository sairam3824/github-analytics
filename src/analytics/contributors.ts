export function analyzeContributors(contributors: any[], commits: any[]) {
  const contributorMap = new Map();

  contributors.forEach(c => {
    contributorMap.set(c.login, {
      login: c.login,
      totalCommits: c.contributions,
      avatarUrl: c.avatar_url
    });
  });

  commits.forEach(commit => {
    const author = commit.author?.login;
    if (author && contributorMap.has(author)) {
      const contributor = contributorMap.get(author);
      if (!contributor.firstCommit) {
        contributor.firstCommit = commit.commit.author.date;
      }
      contributor.lastCommit = commit.commit.author.date;
    }
  });

  const topContributors = Array.from(contributorMap.values())
    .sort((a, b) => b.totalCommits - a.totalCommits)
    .slice(0, 10);

  return {
    totalContributors: contributors.length,
    topContributors,
    busFactor: calculateBusFactor(contributors)
  };
}

function calculateBusFactor(contributors: any[]): number {
  const sorted = contributors.sort((a, b) => b.contributions - a.contributions);
  const totalCommits = sorted.reduce((sum, c) => sum + c.contributions, 0);
  let cumulativeCommits = 0;
  let busFactor = 0;

  for (const contributor of sorted) {
    cumulativeCommits += contributor.contributions;
    busFactor++;
    if (cumulativeCommits >= totalCommits * 0.5) {
      break;
    }
  }

  return busFactor;
}
