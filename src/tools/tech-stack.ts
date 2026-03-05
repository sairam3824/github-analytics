import { GitHubClient } from '../github-client.js';

export async function techStackAnalysis(client: GitHubClient, owner: string, repo: string) {
  const packageFiles = [
    'package.json',
    'requirements.txt',
    'Gemfile',
    'go.mod',
    'Cargo.toml',
    'pom.xml',
    'build.gradle'
  ];

  const foundFiles: Record<string, any> = {};

  for (const file of packageFiles) {
    const content = await client.getContent(owner, repo, file);
    if (content && 'content' in content) {
      const decoded = Buffer.from(content.content, 'base64').toString('utf-8');
      foundFiles[file] = decoded;
    }
  }

  const languages = await client.getLanguages(owner, repo);

  const analysis: any = {
    languages: Object.keys(languages),
    dependencyFiles: Object.keys(foundFiles)
  };

  if (foundFiles['package.json']) {
    try {
      const pkg = JSON.parse(foundFiles['package.json']);
      analysis.npm = {
        dependencies: Object.keys(pkg.dependencies || {}),
        devDependencies: Object.keys(pkg.devDependencies || {}),
        totalDeps: Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length
      };
    } catch (e) {
      analysis.npm = { error: 'Failed to parse package.json' };
    }
  }

  if (foundFiles['requirements.txt']) {
    const deps = foundFiles['requirements.txt']
      .split('\n')
      .filter((line: string) => line.trim() && !line.startsWith('#'))
      .map((line: string) => line.split('==')[0].split('>=')[0].trim());
    analysis.python = {
      dependencies: deps,
      totalDeps: deps.length
    };
  }

  return analysis;
}
