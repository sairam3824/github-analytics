export function analyzeIssues(issues: any[]) {
  if (issues.length === 0) {
    return { error: 'No issues found' };
  }

  const openIssues = issues.filter(i => i.state === 'open');
  const closedIssues = issues.filter(i => i.state === 'closed');
  
  const closeTimes: number[] = [];
  const responseTimes: number[] = [];
  const labels: Record<string, number> = {};

  closedIssues.forEach(issue => {
    if (issue.closed_at) {
      const created = new Date(issue.created_at).getTime();
      const closed = new Date(issue.closed_at).getTime();
      const hoursToClose = (closed - created) / (1000 * 60 * 60);
      closeTimes.push(hoursToClose);
    }

    issue.labels.forEach((label: any) => {
      const name = typeof label === 'string' ? label : label.name;
      labels[name] = (labels[name] || 0) + 1;
    });
  });

  const avgCloseTime = closeTimes.length > 0
    ? closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length
    : 0;

  const topLabels = Object.entries(labels)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return {
    totalIssues: issues.length,
    openIssues: openIssues.length,
    closedIssues: closedIssues.length,
    openClosedRatio: openIssues.length > 0 
      ? (closedIssues.length / openIssues.length).toFixed(2)
      : 'N/A',
    avgTimeToClose: `${(avgCloseTime / 24).toFixed(1)} days`,
    topLabels
  };
}
