const { writeFile } = require('fs').promises;

const artifact = require('@actions/artifact');
const core = require('@actions/core');
const github = require('@actions/github');
const { WebClient } = require('@slack/web-api');
const mustache = require('mustache');

const { artifacts } = require('./fetch');

main().catch((error) => {
    console.log(error);
    core.setFailed(error.message);
});

async function main() {
    const token   = process.env.SLACK_TOKEN;
    const channel = core.getInput('channel');
    const message = core.getInput('message');

    let items = await artifacts();
    console.log(items);
    await publish(items);

    const text = mustache.render(message, {
        context:   github.context,
        artifacts: items,
    });

    const slack = new WebClient(token);
    await slack.chat.postMessage({ channel, text });
}

async function publish(items) {
    let shasums = "";
    for (const { name, digest } of items) {
        shasums += `${digest}  ${name}\n`;
    }

    const name  = 'sha512.txt';
    const files = [name];
    const root  = '.';

    await writeFile(name, shasums);

    const client = artifact.create();
    await client.uploadArtifact(name, files, root);
}
