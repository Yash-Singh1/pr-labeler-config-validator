import type { Core, Process, ReadFileSync } from '../src/action-args';
import { existsSync, readFileSync, readdirSync } from 'fs';
import type ActionArgs from '../src/action-args';
import { HttpClient } from '@actions/http-client';
import type { Labels } from '../src/labels';
import action from '../src/action';
import path from 'path';
import validate from '../src/validate';

function getSetupArgs(
  repo: string,
  pass: boolean | 'default',
  testConfigFile: string,
  labels: string[] = [],
  authToken?: string
): ActionArgs {
  const apiURL = 'https://api.github.com';
  const queriedPages: string[] = [];
  const maxQuery = Math.ceil(labels.length / 9) + 2;

  return [
    {
      getJson: jest.fn(
        async (
          url: string,
          headers?: Record<string, unknown>
        ): Promise<{ result: Labels }> => {
          queriedPages.push(url);
          if (url.endsWith(maxQuery.toString())) {
            for (const [
              queriedPageNumber,
              queriedPage
            ] of queriedPages.entries()) {
              expect(queriedPage).toEqual(
                `${apiURL}/repos/${repo}/labels?page=${queriedPageNumber + 1}`
              );
            }
          }
          const defaultHeaders = { 'User-Agent': 'node.js' };
          if (authToken) {
            expect(headers).toEqual({
              Authentication: authToken,
              ...defaultHeaders
            });
          } else {
            expect(headers).toEqual(defaultHeaders);
          }
          const urlPartsSliceEndIndex =
            +url
              .split('=')
              .find(
                (_urlPart, urlPartIndex, urlParts) =>
                  urlPartIndex === urlParts.length - 1
              )! * 9;
          return {
            result: (
              labels.map((label) => ({
                name: label
              })) as unknown as Labels
            ).slice(urlPartsSliceEndIndex - 9, urlPartsSliceEndIndex)
          };
        }
      )
    } as unknown as HttpClient,
    {
      getInput: jest.fn(() => testConfigFile)
    } as unknown as Core,
    function (pathTo: string, type: BufferEncoding) {
      expect(path.resolve(pathTo)).toEqual(path.resolve(testConfigFile));
      expect(type).toEqual('utf-8');
      return readFileSync(pathTo, type);
    } as ReadFileSync,
    {
      env: {
        GITHUB_REPOSITORY: 'Yash-Singh1/pr-labeler-config-validator',
        GITHUB_API_URL: apiURL,
        GITHUB_TOKEN: authToken
      },
      stdout: {
        write: jest.fn()
      },
      exit: jest.fn()
    } as unknown as Process,
    pass === 'default'
      ? validate
      : function () {
          return pass;
        }
  ];
}

describe('action', () => {
  beforeEach(() => {
    console.log = jest.fn();
  });

  it('fails with invalid configuration file name', async () => {
    const setupArgs = getSetupArgs(
      'Yash-Singh1/pr-labeler-config-validator',
      true,
      123 as unknown as string
    );

    await expect(async () => await action(...setupArgs)).rejects.toThrowError(
      new Error('Passed configuration file must be a string...')
    );
  });

  describe('succeeds with valid configuration', () => {
    for (const dir of ['__tests__', '.github']) {
      it(`succeeds with ${dir}/`, (done) => {
        const setupArgs = getSetupArgs(
          'Yash-Singh1/pr-labeler-config-validator',
          'default',
          `${dir}/pr-labeler.yml`,
          ['feature', 'fix', 'chore', 'bug']
        );

        action(...setupArgs).then(() => {
          expect(console.log).toHaveBeenNthCalledWith(1, 'done');
          expect(console.log).toHaveBeenNthCalledWith(2, 'done');
          expect(console.log).toHaveBeenNthCalledWith(3, 'done');
          expect(console.log).toHaveBeenCalledTimes(3);
          expect(setupArgs[3].stdout.write).toHaveBeenNthCalledWith(
            1,
            'Fetching repository labels...'
          );
          expect(setupArgs[3].stdout.write).toHaveBeenNthCalledWith(
            2,
            'Reading configuration file...'
          );
          expect(setupArgs[3].stdout.write).toHaveBeenNthCalledWith(
            3,
            'Validating config...'
          );
          expect(setupArgs[3].stdout.write).toHaveBeenCalledTimes(3);
          expect(setupArgs[0].getJson).toHaveBeenCalled();
          expect(setupArgs[3].exit).not.toHaveBeenCalled();
          done();
        });
      });
    }
  });

  describe('fails with invalid configuration', () => {
    const invalidDir = path.join(__dirname, 'invalid/');
    for (const exactOrNot of [false, true]) {
      describe(exactOrNot ? 'exact paths' : 'relative paths', () => {
        for (const dir of readdirSync(invalidDir)) {
          it(`fails with ${dir}`, (done) => {
            const invalidSubDirectory = path.join(invalidDir, dir);
            const configFilePath = path.join(
              invalidSubDirectory,
              'pr-labeler.yml'
            );
            const setupArgs = getSetupArgs(
              'Yash-Singh1/pr-labeler-config-validator',
              'default',
              exactOrNot ? configFilePath : path.resolve(configFilePath),
              existsSync(path.join(invalidSubDirectory, 'labels.json'))
                ? JSON.parse(
                    readFileSync(
                      path.join(invalidSubDirectory, 'labels.json'),
                      'utf-8'
                    )
                  )
                : [],
              existsSync(path.join(invalidSubDirectory, 'token.txt'))
                ? readFileSync(
                    path.join(invalidSubDirectory, 'token.txt'),
                    'utf-8'
                  )
                : undefined
            );

            action(...setupArgs).then(() => {
              expect(console.log).toHaveBeenNthCalledWith(1, 'done');
              expect(console.log).toHaveBeenNthCalledWith(2, 'done');
              expect(console.log).toHaveBeenCalledTimes(3);
              expect(setupArgs[3].stdout.write).toHaveBeenNthCalledWith(
                1,
                'Fetching repository labels...'
              );
              expect(setupArgs[3].stdout.write).toHaveBeenNthCalledWith(
                2,
                'Reading configuration file...'
              );
              expect(setupArgs[3].stdout.write).toHaveBeenNthCalledWith(
                3,
                'Validating config...'
              );
              expect(setupArgs[3].stdout.write).toHaveBeenCalledTimes(3);
              expect(setupArgs[0].getJson).toHaveBeenCalled();
              expect(setupArgs[3].exit).toHaveBeenCalledWith(1);
              done();
            });
          });
        }
      });
    }
  });
});
