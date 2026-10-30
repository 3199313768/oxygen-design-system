import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Keep authentication inside fetch or gh's existing keyring; never print or extract credentials.
export function createGitHubReader({ token, fetchImpl = fetch, runGh = (args) => spawnSync('gh', args, { encoding: 'utf8', timeout: 20000 }) } = {}) {
  return async (path, allowMissing = false) => {
    let status;
    let body;
    if (token) {
      const response = await fetchImpl(`https://api.github.com/${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
        signal: AbortSignal.timeout(15000),
      });
      status = response.status;
      if (allowMissing && status === 404) return null;
      if (!response.ok) throw new Error(`GitHub API ${status} for ${path}; remote enforcement could not be verified.`);
      return response.json();
    }
    const result = runGh(['api', '--hostname', 'github.com', '--include', path,
      '-H', 'Accept: application/vnd.github+json', '-H', 'X-GitHub-Api-Version: 2022-11-28']);
    const output = result.stdout ?? '';
    const match = /^HTTP\/[\d.]+\s+(\d+)/m.exec(output);
    if (!match || result.error) throw new Error('Remote state unverified: configure GH_TOKEN/GITHUB_TOKEN or log in with gh auth login.');
    status = Number(match[1]);
    if (allowMissing && status === 404) return null;
    if (result.status !== 0 || status < 200 || status >= 300) {
      throw new Error(`GitHub API ${status} for ${path}; remote enforcement could not be verified.`);
    }
    body = output.split(/\r?\n\r?\n/).slice(1).join('\n\n');
    return JSON.parse(body);
  };
}

export function evaluateRequiredChecks(required, classic, rules) {
  const contexts = new Set(classic?.contexts ?? []);
  for (const check of classic?.checks ?? []) contexts.add(check.context);
  let strict = classic?.strict === true;
  for (const rule of rules) {
    if (rule.type !== 'required_status_checks') continue;
    for (const check of rule.parameters?.required_status_checks ?? []) contexts.add(check.context);
    strict ||= rule.parameters?.strict_required_status_checks_policy === true;
  }
  const missing = required.filter((context) => !contexts.has(context));
  return { missing, strict, passed: missing.length === 0 && strict };
}

async function verify() {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY ?? '3199313768/oxygen-design-system';
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error('Invalid GITHUB_REPOSITORY.');
  const configuration = JSON.parse(await readFile(new URL('../.github/rulesets/quality-checks.json', import.meta.url), 'utf8'));
  const required = configuration.rules[0].parameters.required_status_checks.map((check) => check.context);
  const branch = configuration.conditions.ref_name.include[0].replace(/^refs\/heads\//, '');

  const readGitHub = createGitHubReader({ token });
  const get = (path, allowMissing = false) => readGitHub(`repos/${repository}${path}`, allowMissing);

  // First establish repository access: a private repository's 404 must never be
  // interpreted as evidence that protection is absent.
  await get('');
  const classic = await get(`/branches/${encodeURIComponent(branch)}/protection`, true);
  const effectiveRules = await get(`/rules/branches/${encodeURIComponent(branch)}`);
  const result = evaluateRequiredChecks(required, classic?.required_status_checks, effectiveRules);
  console.log(JSON.stringify({ repository, branch, authentication: token ? 'environment' : 'gh', ...result }, null, 2));
  if (!result.passed) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await verify();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
