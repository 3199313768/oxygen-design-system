import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  if (!token) throw new Error('Remote state unverified: no GH_TOKEN or GITHUB_TOKEN is configured. Use an authorized GitHub connection to enable required checks.');
  const repository = process.env.GITHUB_REPOSITORY ?? '3199313768/oxygen-design-system';
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error('Invalid GITHUB_REPOSITORY.');
  const configuration = JSON.parse(await readFile(new URL('../.github/rulesets/quality-checks.json', import.meta.url), 'utf8'));
  const required = configuration.rules[0].parameters.required_status_checks.map((check) => check.context);
  const branch = configuration.conditions.ref_name.include[0].replace(/^refs\/heads\//, '');

  async function get(path, allowMissing = false) {
    const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      signal: AbortSignal.timeout(15000),
    });
    if (allowMissing && response.status === 404) return null;
    if (!response.ok) throw new Error(`GitHub API ${response.status} for ${path}; remote enforcement could not be verified.`);
    return response.json();
  }

  // First establish repository access: a private repository's 404 must never be
  // interpreted as evidence that protection is absent.
  await get('');
  const classic = await get(`/branches/${encodeURIComponent(branch)}/protection`, true);
  const effectiveRules = await get(`/rules/branches/${encodeURIComponent(branch)}`);
  const result = evaluateRequiredChecks(required, classic?.required_status_checks, effectiveRules);
  console.log(JSON.stringify({ repository, branch, ...result }, null, 2));
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
