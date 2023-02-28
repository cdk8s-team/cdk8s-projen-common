import { Octokit } from '@octokit/rest';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';

const SECURITY_INCIDENT_LABEL = 'gh-security-finding';
const P0_ISSUE_LABEL = 'priority/p0';

const owner = getRepositoryOwner();
const repository = getRepositoryName();
const client = createOctokitClient();

/**
 * Runs as part of Security Notification workflow.
 * This creates an issue for any code scanning alerts that github creates for the repository.
 */
export async function createSecurityWorkflow() {
  const existingIssues = await client.issues.listForRepo({
    owner: owner,
    repo: repository,
  });

  // This also returns pull requests, so making sure we are only considering issues
  // https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues
  const existingSecurityIssues = existingIssues.data.filter((issue) =>
    issue.labels.includes(SECURITY_INCIDENT_LABEL) && !('pull_request' in issue) && issue.state === 'open',
  );

  await codeScanningAlerts(existingSecurityIssues);
}

/**
 * Create issues for code scanning alerts
 * @param existingSecurityIssues List of existing security issues
 */
async function codeScanningAlerts(existingSecurityIssues: GetResponseDataTypeFromEndpointMethod<typeof client.issues.listForRepo>) {
  const csIncidents = await client.codeScanning.listAlertsForRepo({
    owner: owner,
    repo: repository,
  });

  for (const securityIncident of csIncidents.data) {
    const issueTitle = `[AUTOCUT] GH CodeScanning Alert #${securityIncident.number}`;

    const issueExists = existingSecurityIssues.find((issue) => issue.title === issueTitle);

    if (issueExists === undefined) {
      await createSecurityIssue(issueTitle, securityIncident.html_url);
    }
  }
}

/**
 * Helper method to create a code scanning alert issue.
 * @param issueTitle The title of the issue to create.
 * @param incidentUrl The URL to the code scanning alert.
 */
async function createSecurityIssue(issueTitle: string, incidentUrl: string) {
  await client.issues.create({
    owner: owner,
    repo: repository,
    title: issueTitle,
    body: `Github reported a new security incident at: ${incidentUrl}`,
    labels: [
      SECURITY_INCIDENT_LABEL,
      P0_ISSUE_LABEL,
    ],
  });
}

/**
 * Create an octokit client.
 * @returns Octokit
 */
export function createOctokitClient(): Octokit {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error('GITHUB_TOKEN must be set');
  }

  return new Octokit({ auth: token });
}

/**
 * Retrieves the repository owner from environment
 * @returns Repository owner
 */
export function getRepositoryOwner(): string {
  const ownerName = process.env.OWNER_NAME;

  if (!ownerName) {
    throw new Error('OWNER_NAME must be set');
  }

  return ownerName;
}

/**
 * Retrieves the repository name from environment
 * @returns Repository name
 */
export function getRepositoryName(): string {
  const repositoryName = process.env.REPO_NAME;

  if (!repositoryName) {
    throw new Error('REPO_NAME must be set');
  }

  // Repository name is of format 'owner/repositoryName'
  // https://docs.github.com/en/actions/learn-github-actions/contexts#github-context
  return repositoryName.split('/')[1];
}

createSecurityWorkflow().catch((err) => {
  throw new Error(err);
});