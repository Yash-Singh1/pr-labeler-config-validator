import type ActionArgs from './action-args';
import type { Labels } from './labels';
import yaml from 'js-yaml';

async function action(
  ...[httpClient, core, readFileSync, process, validate]: ActionArgs
): Promise<void> {
  process.stdout.write('Fetching repository labels...');

  const labels = await httpClient.getJson<Labels>(
    `${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_REPOSITORY}/labels`,
    process.env.GITHUB_TOKEN
      ? { Authorization: process.env.GITHUB_TOKEN }
      : undefined
  );

  console.log('done');

  process.stdout.write('Reading configuration file...');

  const configFile = core.getInput('configuration-path', { required: true });

  if (typeof configFile !== 'string') {
    throw new Error('Passed configuration file must be a string...');
  }

  const config = yaml.load(readFileSync(configFile, 'utf-8'));

  console.log('done');

  process.stdout.write('Validating config...');

  if (!validate(config, labels as unknown as Labels)) {
    process.exit(1);
  } else {
    console.log('done');
  }
}

export default action;
