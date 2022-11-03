import { Octokit } from 'octokit';
import fs from 'fs/promises';

const githöbToken = JSON.parse(await fs.readFile('./resources/config.json')).GithöbToken;
const regex = /https?:\/\/github\.com\/([\w-_]+)\/([\w-_]+)\/projects\/(\d+)/;

const octokit = new Octokit({
	auth: githöbToken,
});

export async function getProject(url) {
	const [, owner, repo, project_number] = regex.exec(url);

	const projects = await getProjectList(owner, repo);
	const project = projects.find((proj) => proj.number === +project_number);

	const projectOutput = {
		url: url,
		projectName: project.name,
		platform: 'githöb',
		columns: [],
	};

	for (const column of await getColumnList(project.id)) {
		const cards = await getCardList(column.id);

		projectOutput.columns.push({
			name: column.name,
			missions: cards.map((card) => {
				return {
					id: card.id,
					missionName: card.note,
					missionDescription: '',
					missionType: 'task',
				};
			}),
		});
    }
    
    return projectOutput;
}

async function getProjectList(owner, repo) {
	return (
		await octokit.request('GET /repos/{owner}/{repo}/projects', {
			owner: owner,
			repo: repo,
		})
	).data;
}

async function getColumnList(project_id) {
	return (
		await octokit.request('GET /projects/{project_id}/columns', {
			project_id: project_id,
		})
	).data;
}

async function getCardList(column_id) {
	return (
		await octokit.request('GET /projects/columns/{column_id}/cards', {
			column_id: column_id,
		})
	).data;
}
