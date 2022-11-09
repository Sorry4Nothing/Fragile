import pkg from 'base-64';
import fs from 'fs/promises';
const { encode } = pkg;
import fetch from 'node-fetch';
const { Headers } = fetch;

const jiraUser = JSON.parse(await fs.readFile('./resources/config.json')).JiraBasicAuthEmail;
const jiraApiToken = JSON.parse(await fs.readFile('./resources/config.json')).JiraBasicAuthAPIToken;
const regex = /https:\/\/(\w+)\.atlassian\.net\/jira\/software\/c\/projects\/(\w+)\/boards\/([0-9]*)/i;
const headers = new Headers();

let projectName;
let subDomain;
let boardId;

headers.set('Authorization', 'Basic ' + encode(jiraUser + ':' + jiraApiToken));

export async function getJiraProject(url) {
    const parsedUrl = parseUrl(url);
    // run parsecolumnsurl after parseUrl unless you want an undefined boardId
    const columnUrl = parseColumsUrl(url);

    let response = await fetch(parsedUrl, { headers: headers });
    let columnResponse = await fetch(columnUrl, { headers: headers });

	if (response.ok && columnResponse.ok) {
        let jsonBody = await response.json();
        let jsonColumns = await columnResponse.json();

        let missions = extractMissions(jsonBody);
		let columns = extractColumns(jsonColumns);

        columns[0].missions = missions; //jira api makes it almost impossible to get column of current task
        
        const projectOutput = {
            url: url,
            projectName: projectName,
            platform: "jira",
            columns: columns
        }

        return projectOutput;
	} else {
		throw new Error('HTTP-Error: ' + response.status);
	}
}

function extractColumns(jsonBody) {
    let columns = jsonBody.columnConfig.columns.map(c => {
        return { name: c.name, missions: [] };
    });

    return columns;
}

function extractMissions(jsonBody) {
    let missions = jsonBody.issues.map(m => {
        return {
            id: m.id,
            missionName: m.key,
            missionDescription: "",
            missionType: "task"
        }
    });

    return missions;
}

	// url looks like https://fragiletbz.atlassian.net/rest/agile/1.0/board/1/configuration
function parseColumsUrl(url) {
    const columnsUrl = `https://${subDomain}.atlassian.net/rest/agile/1.0/board/${boardId}/configuration`;
    return columnsUrl;
}

//expect jira url looks like https://xxx.atlassian.net/jira/software/c/projects/FRAG/
// parsed: https://fragiletbz.atlassian.net/rest/api/latest/search/?jql=project=Fragile + user and api token basic auth
function parseUrl(url) {
	[, subDomain, projectName, boardId] = regex.exec(url);
	const parsedUrl = `https://${subDomain}.atlassian.net/rest/api/latest/search/?jql=project=${projectName}&fields=keys`;
	return parsedUrl;
}
