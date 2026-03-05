import { GitHubClient } from '../github-client.js';

export async function repoOverview(client: GitHubClient, owner: string, repo: string) {
  const repoData = await client.getRepo(owner, repo);
  const languages = await client.getLanguages(owner, repo);
  const contributors = await client.getContributors(owner, repo);

  const totalBytes = Object.values(languages).reduce((a: number, b: number) => a + b, 0);
  const languageBreakdown = Object.entries(languages)
    .map(([lang, bytes]) => ({
      language: lang,
      percentage: ((bytes / totalBytes) * 100).toFixed(1) + '%'
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return {
    name: repoData.full_name,
    description: repoData.description,
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    watchers: repoData.watchers_count,
    openIssues: repoData.open_issues_count,
    language: repoData.language,
    languageBreakdown,
    license: repoData.license?.name || 'None',
    topics: repoData.topics,
    createdAt: repoData.created_at,
    lastPush: repoData.pushed_at,
    defaultBranch: repoData.default_branch,
    size: `${(repoData.size / 1024).toFixed(2)} MB`,
    topContributors: contributors.slice(0, 5).map((c: any) => ({
      login: c.login,
      contributions: c.contributions
    }))
  };
}
