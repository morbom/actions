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
    let release = context.payload?.release;
    let actions = changed(context);

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

export function changed(context: any): string[] {
    let before = parse(context.payload?.changes?.body?.from ?? "");
    let after  = parse(context.payload?.release?.body       ?? "");

    core.debug(`before: ${JSON.stringify(before)}`);
    core.debug(`after:  ${JSON.stringify(after)}`);

    let actions = { ...before, ...after };
    let changed = [];

    for (let name of Object.keys(actions)) {
        if (!before[name] && after[name]) {
            changed.push(name);
        }
    }

    return changed;
}

function parse(text: string): Record<string, boolean> {
    let items = {};

    for (let item of markdown.parse(text)) {
        if (item.name == 'checklist' || item.name == 'list') {
            let text = item.values.map(v => v.value);
            let name = normalize(text.join(' '));
            if (name.startsWith('-x-')) {
                name = name.substring(3);
                item.checked = true;
            }
            items[name] = item.checked
        }
    }

    return items;
}

function normalize(str: string): string {
    return str.replace(/\W+/g, '-').toLowerCase();
}
