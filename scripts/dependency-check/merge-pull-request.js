const {
  PULL_REQUEST_TITLE,
  OWNER,
  REPOSITORY,
  createGitClient,
  createGithubClient,
} = require('./utils');

async function main() {
  const githubClient = createGithubClient();

  const { data: pullRequests } = await githubClient.pulls.list({
    owner: OWNER,
    repo: REPOSITORY,
    state: 'open',
  });

  const latestPullRequest = pullRequests
    .filter((pullRequest) => pullRequest.title === PULL_REQUEST_TITLE)
    .sort((a, b) => b.number - a.number)[0];

  if (!latestPullRequest) {
    return;
  }

  const {
    data: { check_runs: checkRuns },
  } = await githubClient.checks.listForRef({
    owner: OWNER,
    repo: REPOSITORY,
    ref: latestPullRequest.head.sha,
    filter: 'latest',
  });

  const allCheckRunsSuccessful = checkRuns.every(
    ({ status, conclusion }) => status === 'completed' && conclusion === 'success'
  );

  if (!allCheckRunsSuccessful) {
    return;
  }

  await githubClient.pulls.merge({
    owner: OWNER,
    repo: REPOSITORY,
    pull_number: latestPullRequest.number,
    merge_method: 'squash',
  });

  const gitClient = createGitClient();
  await gitClient.pull('origin', 'master');
}

main();
