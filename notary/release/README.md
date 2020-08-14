# Mark Kentik Notary artifact released

This [GitHub Action][action] marks a Kentik Notary artifact
released. Appropriate AWS credentials should be injected as
environment variables.

## Inputs

| Name          | Description                     |
| ------------- | ------------------------------- |
| *name*        | artifact name                   |
| *version*     | artifact version                |

## Usage

```yaml
uses: kentik/actions/notary/release@master
with:
  name: artifact
  version: 1.0.0
env:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  AWS_REGION: ${{ secrets.AWS_REGION }}
```

[action]: https://github.com/features/actions
