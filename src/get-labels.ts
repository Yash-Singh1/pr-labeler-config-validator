import type { HttpClient } from '@actions/http-client';
import type { Labels } from './labels';
import type { Process } from './action-args';

const defaultHeaders = { 'User-Agent': 'node.js' };

export default async function getLabels(
  httpClient: HttpClient,
  process: Process
): Promise<Labels | null> {
  let page = 1;
  let results = [];

  while (
    results.length === 0 ||
    (results[results.length - 1] && results[results.length - 1]!.length !== 0)
  ) {
    results.push(
      (
        await httpClient.getJson<Labels>(
          `${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_REPOSITORY}/labels?page=${page}`,
          process.env.GITHUB_TOKEN
            ? { Authorization: process.env.GITHUB_TOKEN, ...defaultHeaders }
            : defaultHeaders
        )
      )?.result as Labels | undefined
    );
    page++;
  }

  results = results.reduce((acc, labelsPage) => {
    if (!labelsPage) return acc;
    acc!.push(...labelsPage);
    return acc;
  }, []) as unknown as Labels;

  if (!results) {
    return null;
  } else {
    return results;
  }
}
