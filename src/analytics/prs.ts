export function analyzePRs(prs: any[]) {
  if (prs.length === 0) {
    return { error: 'No pull requests found' };
  }

  const mergedPRs = prs.filter(pr => pr.merged_at);
  const mergeTimes: number[] = [];
  const prSizes: number[] = [];
  const reviewers: Record<string, number> = {};

  mergedPRs.forEach(pr => {
    const created = new Date(pr.created_at).getTime();
    const merged = new Date(pr.merged_at).getTime();
    const hoursToMerge = (merged - created) / (1000 * 60 * 60);
    mergeTimes.push(hoursToMerge);

    const size = (pr.additions || 0) + (pr.deletions || 0);
    prSizes.push(size);

    if (pr.requested_reviewers) {
      pr.requested_reviewers.forEach((r: any) => {
        reviewers[r.login] = (reviewers[r.login] || 0) + 1;
      });
    }
  });

  const avgMergeTime = mergeTimes.length > 0
    ? mergeTimes.reduce((a, b) => a + b, 0) / mergeTimes.length
    : 0;

  const avgPRSize = prSizes.length > 0
    ? prSizes.reduce((a, b) => a + b, 0) / prSizes.length
    : 0;

  const topReviewers = Object.entries(reviewers)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([login, count]) => ({ login, reviews: count }));

  const openPRs = prs.filter(pr => pr.state === 'open');
  const stalePRs = openPRs.filter(pr => {
    const daysSinceUpdate = (Date.now() - new Date(pr.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 30;
  });

  return {
    totalPRs: prs.length,
    openPRs: openPRs.length,
    mergedPRs: mergedPRs.length,
    mergeRate: ((mergedPRs.length / prs.length) * 100).toFixed(1) + '%',
    avgTimeToMerge: `${(avgMergeTime / 24).toFixed(1)} days`,
    avgPRSize: Math.round(avgPRSize) + ' lines',
    stalePRs: stalePRs.length,
    topReviewers
  };
}
