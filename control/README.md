# Control release process

This [GitHub Action][action] allows execution of the release
process to be controlled by edits to checklists in the body
of the release. When an item goes from unchecked to checked
it will be included in the `actions` output of this action.

## Outputs

| Name          | Description                     |
| ------------- | ------------------------------- |
| *actions*     | triggered actions               |

## Usage

```yaml
uses: kentik/actions/control@master
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

[action]: https://github.com/features/actions
