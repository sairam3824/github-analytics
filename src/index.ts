#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GitHubClient } from './github-client.js';
import { repoOverview } from './tools/repo-overview.js';
import { commitAnalysis } from './tools/commit-analysis.js';
import { contributorInsights } from './tools/contributor-insights.js';
import { prMetrics } from './tools/pr-metrics.js';
import { issueHealth } from './tools/issue-health.js';
import { codeFrequency } from './tools/code-frequency.js';
import { releaseCadence } from './tools/release-cadence.js';
import { techStackAnalysis } from './tools/tech-stack.js';
import { compareRepos } from './tools/compare-repos.js';
import { busFactor } from './tools/bus-factor.js';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

const client = new GitHubClient(GITHUB_TOKEN);
const server = new Server(
  {
    name: 'mcp-github-analytics',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'repo_overview',
      description: 'Get comprehensive repository overview including stars, forks, language breakdown, top contributors, and metadata',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner (username or org)' },
          repo: { type: 'string', description: 'Repository name' },
        },
        required: ['owner', 'repo'],
      },
    },
    {
      name: 'commit_analysis',
      description: 'Analyze commit history: commits per day, busiest days, most active authors, commit patterns',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' },
          days: { type: 'number', description: 'Number of days to analyze (default: 90)', default: 90 },
        },
        required: ['owner', 'repo'],
      },
    },
    {
      name: 'contributor_insights',
      description: 'Detailed contributor analysis: commits, activity timeline, top contributors',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' },
        },
        required: ['owner', 'repo'],
      },
    },
    {
      name: 'pr_metrics',
      description: 'Pull request analytics: time to merge, PR size distribution, top reviewers, stale PRs',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' },
        },
        required: ['owner', 'repo'],
      },
    },
    {
      name: 'issue_health',
      description: 'Issue analytics: open/closed ratio, response time, common labels, issue velocity',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' },
        },
        required: ['owner', 'repo'],
      },
    },
    {
      name: 'code_frequency',
      description: 'Lines added vs removed over time, identify major refactors, code growth trend',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' },
        },
        required: ['owner', 'repo'],
      },
    },
    {
      name: 'release_cadence',
      description: 'Release frequency, time between releases, semantic versioning compliance',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' },
        },
        required: ['owner', 'repo'],
      },
    },
    {
      name: 'tech_stack_analysis',
      description: 'Deep analysis of dependencies from package.json, requirements.txt, etc.',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' },
        },
        required: ['owner', 'repo'],
      },
    },
    {
      name: 'compare_repos',
      description: 'Compare 2-3 repositories side by side on all metrics',
      inputSchema: {
        type: 'object',
        properties: {
          repos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                owner: { type: 'string' },
                repo: { type: 'string' },
              },
              required: ['owner', 'repo'],
            },
            minItems: 2,
            maxItems: 3,
          },
        },
        required: ['repos'],
      },
    },
    {
      name: 'bus_factor',
      description: 'Calculate bus factor - how many contributors would need to leave before project is at risk',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' },
        },
        required: ['owner', 'repo'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error('Missing arguments');
    }

    switch (name) {
      case 'repo_overview': {
        const { owner, repo } = args as { owner: string; repo: string };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await repoOverview(client, owner, repo), null, 2),
            },
          ],
        };
      }

      case 'commit_analysis': {
        const { owner, repo, days } = args as { owner: string; repo: string; days?: number };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await commitAnalysis(client, owner, repo, days),
                null,
                2
              ),
            },
          ],
        };
      }

      case 'contributor_insights': {
        const { owner, repo } = args as { owner: string; repo: string };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await contributorInsights(client, owner, repo),
                null,
                2
              ),
            },
          ],
        };
      }

      case 'pr_metrics': {
        const { owner, repo } = args as { owner: string; repo: string };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await prMetrics(client, owner, repo), null, 2),
            },
          ],
        };
      }

      case 'issue_health': {
        const { owner, repo } = args as { owner: string; repo: string };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await issueHealth(client, owner, repo), null, 2),
            },
          ],
        };
      }

      case 'code_frequency': {
        const { owner, repo } = args as { owner: string; repo: string };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await codeFrequency(client, owner, repo), null, 2),
            },
          ],
        };
      }

      case 'release_cadence': {
        const { owner, repo } = args as { owner: string; repo: string };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await releaseCadence(client, owner, repo), null, 2),
            },
          ],
        };
      }

      case 'tech_stack_analysis': {
        const { owner, repo } = args as { owner: string; repo: string };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await techStackAnalysis(client, owner, repo),
                null,
                2
              ),
            },
          ],
        };
      }

      case 'compare_repos': {
        const { repos } = args as { repos: Array<{ owner: string; repo: string }> };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await compareRepos(client, repos), null, 2),
            },
          ],
        };
      }

      case 'bus_factor': {
        const { owner, repo } = args as { owner: string; repo: string };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await busFactor(client, owner, repo), null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP GitHub Analytics Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
