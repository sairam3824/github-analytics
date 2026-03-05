# MCP GitHub Analytics

Deep GitHub repository insights via natural language. Analyze commit patterns, contributor activity, code quality metrics, PR velocity, issue response times, and technology stack — all accessible through Claude or any MCP client.

## Features

- **repo_overview** — Full repository summary with stars, forks, language breakdown, top contributors
- **commit_analysis** — Commit history patterns, busiest days, most active authors
- **contributor_insights** — Detailed contributor analysis with activity timelines
- **pr_metrics** — Pull request analytics: merge time, review turnaround, PR sizes
- **issue_health** — Issue analytics: response times, close rates, common labels
- **code_frequency** — Lines added vs removed over time, identify major refactors
- **release_cadence** — Release frequency, semantic versioning compliance
- **tech_stack_analysis** — Deep dependency analysis from package.json, requirements.txt, etc.
- **compare_repos** — Side-by-side comparison of 2-3 repositories
- **bus_factor** — Calculate project risk based on contributor concentration

## Installation

```bash
npm install -g mcp-github-analytics
```

Or use with npx:

```bash
npx mcp-github-analytics
```

## Quick Start

### 1. Get a GitHub Token

Create a personal access token at https://github.com/settings/tokens with `public_repo` or `repo` scope.

### 2. Configure MCP Client

Add to your MCP settings file (e.g., Claude Desktop config):

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

If running from this cloned repository, use `node` to run the built output:

```json
{
  "mcpServers": {
    "github-analytics": {
      "command": "node",
      "args": ["/Users/sairammaruri/Documents/New git projects/github-analytics/build/index.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

### 3. Restart and Use

Restart your MCP client and start asking questions:

- "Analyze the commit patterns for facebook/react"
- "What's the bus factor for vercel/next.js?"
- "Compare facebook/react and vuejs/vue"
- "Show me PR metrics for microsoft/vscode"

## Example Outputs

### Repository Overview (facebook/react)

```json
{
  "name": "facebook/react",
  "description": "The library for web and native user interfaces",
  "stars": 228000,
  "forks": 46500,
  "language": "JavaScript",
  "languageBreakdown": [
    { "language": "JavaScript", "percentage": "91.2%" },
    { "language": "TypeScript", "percentage": "5.8%" }
  ],
  "license": "MIT License",
  "topContributors": [
    { "login": "gaearon", "contributions": 1542 },
    { "login": "sophiebits", "contributions": 892 }
  ]
}
```

### Commit Analysis (vercel/next.js)

```json
{
  "totalCommits": 1247,
  "topAuthors": [
    { "name": "JJ Kasper", "commits": 342 },
    { "name": "Tim Neutkens", "commits": 198 }
  ],
  "busiestDayOfWeek": { "day": "Wednesday", "commits": 245 },
  "commitsPerDay": "13.86"
}
```

### Bus Factor (nodejs/node)

```json
{
  "busFactor": 4,
  "interpretation": "MODERATE: Limited contributor diversity",
  "criticalContributors": [
    { "login": "bnoordhuis", "contributions": 2847, "percentage": "12.3%" },
    { "login": "jasnell", "contributions": 2156, "percentage": "9.3%" }
  ],
  "totalContributors": 3142
}
```

## Architecture

```
src/
├── index.ts              # MCP server setup
├── github-client.ts      # Authenticated Octokit wrapper with caching
├── cache.ts              # Smart caching with TTL
├── tools/                # One file per tool
│   ├── repo-overview.ts
│   ├── commit-analysis.ts
│   ├── contributor-insights.ts
│   ├── pr-metrics.ts
│   ├── issue-health.ts
│   ├── code-frequency.ts
│   ├── release-cadence.ts
│   ├── tech-stack.ts
│   ├── compare-repos.ts
│   └── bus-factor.ts
└── analytics/            # Calculation logic
    ├── commits.ts
    ├── contributors.ts
    ├── prs.ts
    └── issues.ts
```

## Development

```bash
# Clone and install
git clone https://github.com/yourusername/mcp-github-analytics.git
cd mcp-github-analytics
npm install

# Build
npm run build

# Run locally
export GITHUB_TOKEN=your_token
node build/index.js
```

## Requirements

- Node.js 18+
- GitHub Personal Access Token

## Use Cases

- **Engineering Managers**: Track team velocity, PR review times, contributor health
- **Open Source Maintainers**: Monitor project health, identify bus factor risks
- **Developers**: Compare frameworks, analyze dependency health before adoption
- **DevRel**: Generate repository insights for blog posts and presentations

## License

Apache-2.0

## Contributing

Contributions welcome! Please open an issue or PR on GitHub.
