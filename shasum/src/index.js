const { createHash }  = require('crypto');
const { createReadStream } = require('fs');
const { readdir, writeFile } = require('fs').promises;
const { join } = require('path');

const artifact = require('@actions/artifact');
const core = require('@actions/core');
const github = require('@actions/github');
const { WebClient } = require('@slack/web-api');
const mustache = require('mustache');

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

async function artifacts() {
    const client = artifact.create();
    const items  = await client.downloadAllArtifacts();
    core.debug(items);
    return await hash(items);
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

async function hash(artifacts) {
    const options = {
        encoding:      null,
        highWaterMark: 8 * 1024,
    };

    const items = [];

    for (const { artifactName, downloadPath } of artifacts) {
        const name = artifactName;
        const path = downloadPath;

        const ents = await readdir(path);
        const file = join(path, ents[0]);
        const hash = createHash('sha512');

        const stream = createReadStream(file, options);
        for await (const chunk of stream) {
            hash.update(chunk);
        }
        const digest = hash.digest('hex');

        items.push({ name, file, digest });
    }

    return items;
}
