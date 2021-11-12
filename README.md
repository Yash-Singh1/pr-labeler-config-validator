# `pr-labeler-config-validator`

A configuration validator for the [PR Labeler GitHub Action](https://github.com/TimonVS/pr-labeler-action).

## Usage

You can optionally set the `GITHUB_TOKEN` environment variable for API calls to be authorized.

```yaml
name: Validate PR Labeler Configuration
on: [push, pull_request]

jobs:
  pr-labeler:
    runs-on: ubuntu-latest
    steps:
      - name: Validate Configuration
        uses: Yash-Singh1/pr-labeler-config-validator@v0.0.1
        with:
          configuration-path: .github/pr-labeler.yml
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
```
