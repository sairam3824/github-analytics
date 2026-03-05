import { GitHubClient } from '../github-client.js';

export async function codeFrequency(client: GitHubClient, owner: string, repo: string) {
  const data = await client.getCodeFrequency(owner, repo);
  
  if (!data || data.length === 0) {
    return { error: 'No code frequency data available' };
  }

  let totalAdded = 0;
  let totalRemoved = 0;
  const weeklyData = data.map((week: number[]) => {
    totalAdded += week[1];
    totalRemoved += Math.abs(week[2]);
    return {
      week: new Date(week[0] * 1000).toISOString().split('T')[0],
      added: week[1],
      removed: Math.abs(week[2])
    };
  });

  return {
    totalLinesAdded: totalAdded,
    totalLinesRemoved: totalRemoved,
    netChange: totalAdded - totalRemoved,
    weeklyData: weeklyData.slice(-12) // Last 12 weeks
  };
}
