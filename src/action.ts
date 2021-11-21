import type ActionArgs from './action-args';
import getLabels from './get-labels';
import path from 'path';
import yaml from 'js-yaml';

async function action(
  ...[httpClient, core, readFileSync, process, validate]: ActionArgs
): Promise<void> {
  process.stdout.write('Fetching repository labels...');

  const labels = await getLabels(httpClient, process);

  console.log('done');

  process.stdout.write('Reading configuration file...');

  const configFile = core.getInput('configuration-path', { required: true });

  if (typeof configFile !== 'string') {
    throw new Error('Passed configuration file must be a string...');
  }

  const config = yaml.load(
    readFileSync(
      configFile.startsWith('/')
        ? configFile
        : path.join(
            process.env.GITHUB_WORKSPACE
              ? `/${process.env.GITHUB_WORKSPACE}`
              : '.',
            configFile
          ),
      'utf-8'
    )
  );

  console.log('done');

  process.stdout.write('Validating config...');

  if (!validate(config, labels)) {
    process.exit(1);
  } else {
    console.log('done');
  }
}

export default action;
