const { createHash }  = require('crypto');
const { createReadStream } = require('fs');
const { readdir } = require('fs').promises;
const { join } = require('path');

const artifact = require('@actions/artifact');
const core = require('@actions/core');

async function artifacts() {
    const client = artifact.create();
    const items  = await client.downloadAllArtifacts();
    core.debug(items);
    return await hash(items);
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

module.exports = { artifacts };
