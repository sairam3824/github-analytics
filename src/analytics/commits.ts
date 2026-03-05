export function analyzeCommits(commits: any[]) {
  if (commits.length === 0) {
    return { error: 'No commits found' };
  }

  const commitsByDay: Record<string, number> = {};
  const commitsByAuthor: Record<string, number> = {};
  const commitsByDayOfWeek: Record<string, number> = {};
  const messageLengths: number[] = [];

  commits.forEach(commit => {
    const date = new Date(commit.commit.author.date);
    const day = date.toISOString().split('T')[0];
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const author = commit.commit.author.name;

    commitsByDay[day] = (commitsByDay[day] || 0) + 1;
    commitsByAuthor[author] = (commitsByAuthor[author] || 0) + 1;
    commitsByDayOfWeek[dayOfWeek] = (commitsByDayOfWeek[dayOfWeek] || 0) + 1;
    messageLengths.push(commit.commit.message.length);
  });

  const sortedAuthors = Object.entries(commitsByAuthor)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const busiestDay = Object.entries(commitsByDayOfWeek)
    .sort(([, a], [, b]) => b - a)[0];

  const avgMessageLength = messageLengths.reduce((a, b) => a + b, 0) / messageLengths.length;

  return {
    totalCommits: commits.length,
    dateRange: {
      first: commits[commits.length - 1]?.commit.author.date,
      last: commits[0]?.commit.author.date
    },
    topAuthors: sortedAuthors.map(([name, count]) => ({ name, commits: count })),
    busiestDayOfWeek: { day: busiestDay[0], commits: busiestDay[1] },
    averageMessageLength: Math.round(avgMessageLength),
    commitsPerDay: Object.keys(commitsByDay).length > 0 
      ? (commits.length / Object.keys(commitsByDay).length).toFixed(2)
      : '0'
  };
}
