const { createHash } = require('crypto');
const artifact = require('@actions/artifact');
const { artifacts } = require('./fetch');

jest.mock('fs', () => {
    const { basename } = require('path');
    const { Readable} = require('stream');

    return {
        promises: {
            readdir: (path) => ([path])
        },

        createReadStream: (path) => {
            let file = basename(path);
            return Readable.from([file]);
        },

        stat: () => {},
    };
});

jest.mock('@actions/artifact');
jest.mock('@actions/core');

artifact.create.mockImplementation(() => ({
    downloadAllArtifacts: () => ([
        { artifactName: "foo", downloadPath: "foo" },
        { artifactName: "bar", downloadPath: "bar" },
    ]),
}));

function sha512(bytes) {
    const hash = createHash('sha512');
    hash.update(bytes);
    return hash.digest('hex');
}

test('hash artifacts', async () => {
    expect(await artifacts()).toStrictEqual([
        { name: "foo", file: "foo/foo", digest: sha512("foo") },
        { name: "bar", file: "bar/bar", digest: sha512("bar") },
    ]);
});
