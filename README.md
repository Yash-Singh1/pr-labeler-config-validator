# `pr-labeler-config-validator`

A configuration validator for the [PR Labeler GitHub Action](https://github.com/TimonVS/pr-labeler-action), a github action that allows you to label your PRs based on the branch name.

## Usage

GitHub automatically generates a `GITHUB_TOKEN` secret when your workflow runs.

```yaml
name: Validate PR Labeler Configuration
on: [push, pull_request]

jobs:
  pr-labeler:
    runs-on: ubuntu-latest
    steps:
      - name: Validate Configuration
        uses: Yash-Singh1/pr-labeler-config-validator@releases/v0.0.3
        with:
          configuration-path: .github/pr-labeler.yml
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Features

- Ensures all labels in the configuration file exist on the repository
- Ensures the configuration file exists
- Exists the structure of the configuration is parsable and follows a correct schema
