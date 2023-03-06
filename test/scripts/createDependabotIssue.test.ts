const issueNumber = 4;
const issueTitle = `[AUTOCUT] Dependabot Security Alert #${issueNumber}`;
const issueURL = 'some-url';
const issueBody = `Github reported a new dependabot security incident at: ${issueURL}`;
const ownerName = 'cdk8s-mock-owner';
const repoName = 'cdk8s-mock-repo';
const rawRepoName = `${ownerName}/${repoName}`;
const token = 'cdk8s-mock-token';
const P0_ISSUE_LABEL = 'priority/p0';
const TRIAGE_LABEL = 'needs-triage';
const DEPENDABOT_SECURITY_INCIDENT_LABEL = 'dependabot-security-finding';

const oldEnv = process.env;
process.env = {
  ...oldEnv,
  OWNER_NAME: ownerName,
  REPO_NAME: rawRepoName,
  GITHUB_TOKEN: token,
};

const mockListIssues = jest.fn().mockResolvedValue({
  data: [{
    labels: [DEPENDABOT_SECURITY_INCIDENT_LABEL],
    state: 'open',
  }],
});

const mockCreateIssue = jest.fn();

const mockListDependabotAlerts = jest.fn().mockResolvedValue({
  data: [{
    number: issueNumber,
    html_url: issueURL,
    state: 'open',
  }],
});

import { createOctokitClient, getRepositoryName, getRepositoryOwner, runWorkflowScript } from '../../src/components/scripts/createDependabotIssue';

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    issues: {
      listForRepo: mockListIssues,
      create: mockCreateIssue,
    },
    dependabot: {
      listAlertsForRepo: mockListDependabotAlerts,
    },
  })),
}));

describe('security workflow script', () => {
  test('creates issue', async () => {
    await runWorkflowScript();

    expect(mockListIssues).toHaveBeenCalled();
    expect(mockListIssues).toHaveBeenCalledWith({
      owner: ownerName,
      repo: repoName,
    });

    expect(mockListDependabotAlerts).toHaveBeenCalled();
    expect(mockListDependabotAlerts).toHaveBeenCalledWith({
      owner: ownerName,
      repo: repoName,
    });

    expect(mockCreateIssue).toHaveBeenCalled();
    expect(mockCreateIssue).toHaveBeenCalledWith({
      owner: ownerName,
      repo: repoName,
      title: issueTitle,
      body: issueBody,
      labels: [
        DEPENDABOT_SECURITY_INCIDENT_LABEL,
        P0_ISSUE_LABEL,
        TRIAGE_LABEL,
      ],
    });
  });

  test('does not create issue when there are no alerts', async () => {
    mockListDependabotAlerts.mockResolvedValueOnce({
      data: [],
    });

    await runWorkflowScript();

    expect(mockListIssues).toHaveBeenCalled();
    expect(mockListIssues).toHaveBeenCalledWith({
      owner: ownerName,
      repo: repoName,
    });

    expect(mockListDependabotAlerts).toHaveBeenCalled();
    expect(mockListDependabotAlerts).toHaveBeenCalledWith({
      owner: ownerName,
      repo: repoName,
    });

    expect(mockCreateIssue).not.toHaveBeenCalled();
  });

  test('does not create issue when issue already exists', async () => {
    mockListIssues.mockResolvedValueOnce({
      data: [{
        labels: [DEPENDABOT_SECURITY_INCIDENT_LABEL],
        title: issueTitle,
        state: 'open',
      }],
    });

    await runWorkflowScript();

    expect(mockListIssues).toHaveBeenCalled();
    expect(mockListIssues).toHaveBeenCalledWith({
      owner: ownerName,
      repo: repoName,
    });

    expect(mockListDependabotAlerts).toHaveBeenCalled();
    expect(mockListDependabotAlerts).toHaveBeenCalledWith({
      owner: ownerName,
      repo: repoName,
    });

    expect(mockCreateIssue).not.toHaveBeenCalled();
  });

  test('does not create issue for any other status than open for security incident', async () => {
    mockListDependabotAlerts.mockResolvedValue({
      data: [
        {
          number: 5,
          html_url: 'someUrl',
          state: 'dismissed',
        },
        {
          number: 6,
          html_url: 'anotherUrl',
          state: 'fixed',
        },
      ],
    });

    await runWorkflowScript();

    expect(mockListIssues).toHaveBeenCalled();
    expect(mockListIssues).toHaveBeenCalledWith({
      owner: ownerName,
      repo: repoName,
    });

    expect(mockListDependabotAlerts).toHaveBeenCalled();
    expect(mockListDependabotAlerts).toHaveBeenCalledWith({
      owner: ownerName,
      repo: repoName,
    });

    expect(mockCreateIssue).not.toHaveBeenCalled();
  });

  test('disregards pull requests when creating issue', async () => {
    mockListIssues.mockResolvedValueOnce({
      data: [{
        labels: [DEPENDABOT_SECURITY_INCIDENT_LABEL],
        title: issueTitle,
        state: 'open',
        pull_request: 'some_pr',
      }],
    });

    await runWorkflowScript();

    expect(mockListIssues).toHaveBeenCalled();
    expect(mockListIssues).toHaveBeenCalledWith({
      owner: ownerName,
      repo: repoName,
    });

    expect(mockListDependabotAlerts).toHaveBeenCalled();
    expect(mockListDependabotAlerts).toHaveBeenCalledWith({
      owner: ownerName,
      repo: repoName,
    });

    expect(mockCreateIssue).not.toHaveBeenCalled();
  });

  test('throws if GITHUB_TOKEN is not present', () => {
    delete process.env.GITHUB_TOKEN;

    expect(() => createOctokitClient()).toThrow('GITHUB_TOKEN must be set');
  });

  test('throws if OWNER_NAME is not present', () => {
    delete process.env.OWNER_NAME;

    expect(() => getRepositoryOwner()).toThrow('OWNER_NAME must be set');
  });

  test('throws if REPO_NAME is not present', () => {
    delete process.env.REPO_NAME;

    expect(() => getRepositoryName()).toThrow('REPO_NAME must be set');
  });

  afterEach(() => {
    jest.resetModules();
    process.env = {
      ...oldEnv,
      OWNER_NAME: ownerName,
      REPO_NAME: repoName,
      GITHUB_TOKEN: token,
    };
  });
});
