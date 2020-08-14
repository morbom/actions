import * as core from '@actions/core';
import * as github from '@actions/github';
import * as markdown from 'markdown-tree-parser';
import * as moment from 'moment';

main().catch((error) => {
    console.log(error)
    core.setFailed(error.message)
})

async function main() {
    let context = github.context;
    let changes = context.payload?.changes;
    let release = context.payload?.release;

    let before  = parse(changes?.body?.from ?? "")
    let after   = parse(release?.body       ?? "")
    let actions = [];
    
    for (let [name, done] of Object.entries(before)) {
        if (!done && after[name]) {
            actions.push(name);
        }
    }

    core.setOutput("actions", actions.join(","));

    let octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    let { owner, repo } = context.repo;
    let { body, id: release_id } = release;
    let { login: user } = context.payload?.sender;

    let timestamp = moment.utc().format("YYYY-MM-DD hh:mm");

    for (let action of actions) {
        body += `\n\`${timestamp}\` - ${action} by @${user}`;
    }

    await octokit.repos.updateRelease({ owner, repo, release_id, body });

    console.log(`Triggered actions: ${actions}`);
}

function parse(text: string): Record<string, boolean> {
    let items = {};

    for (let item of markdown.parse(text)) {
        if (item.name == 'checklist') {
            let text = item.values.map(v => v.value);
            let name = normalize(text.join(' '));
            items[name] = item.checked
        }
    }

    return items;
}

function normalize(str: string): string {
    return str.replace(/\W+/g, '-').toLowerCase();
}
