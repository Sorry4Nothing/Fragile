import express, { response } from 'express';
const app = express();
const port = 3000;
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import { generateToken, verifyToken } from './tokenOperations.js';
import { getGithöbProject } from './githöbOperations.js';
import { getJiraProject } from './jiraOperations.js';

app.use(bodyParser.json());

const db = new sqlite3.Database('../DB/fragile.sqlite');

const sqlInitData = await fs.readFile('../DB/fragile.sql');

if (!sqlInitData.toString()) {
	console.log('Error: No data');
	process.exit(1);
}

db.serialize(() => {
	db.run(sqlInitData.toString());

	const isSeededSql = 'SELECT EXISTS (SELECT 1 FROM Fraccounts)';
	db.get(isSeededSql, (err, row) => {
		if (err) {
			console.log('Error: ', err);
			process.exit(1);
		}

		if (row['EXISTS (SELECT 1 FROM Fraccounts)'] === 0) {
			const stmt = db.prepare("INSERT INTO Fraccounts('name', 'password') VALUES ('TEST', 'test')");
			stmt.run();
			stmt.finalize();
		}
	});
});

app.get('/', (req, res) => {
	res.send('Hello Planet!');
});

app.post('/login', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;

	db.serialize(() => {
		const validLoginStmt = db.prepare('SELECT * FROM Fraccounts WHERE name = ? AND password = ?', [username, password]);
		validLoginStmt.get(async (err, row) => {
			if (err || !row) {
				console.log(err);
				res.status(401).send('Invalid username or password');
			} else {
				const user = {
					id: row.id,
					username: row.name,
					password: row.password,
				};
				const token = await generateToken(user);
				res.send(token);
			}
		});
	});
});

app.post('/register', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;

	db.serialize(() => {
		const insertStmt = db.prepare("INSERT INTO Fraccounts('name', 'password') VALUES (?, ?)", [username, password]);
		insertStmt.run(async (err) => {
			if (err) {
				console.log(err);
				res.status(400).send('Username already exists');
			} else {
				const user = {
					username: username,
					password: password,
				};
				const token = await generateToken(user);
				res.send(token);
			}
		});
		insertStmt.finalize();
	});
});

app.get('/isloggedin', async (req, res) => {
	if (!isLoggedIn(req, res)) {
		return;
	}

	res.sendStatus(204);
});

app.get('/import', async (req, res) => {
	if (!isLoggedIn(req, res)) {
		return;
	}

	const platform = req.query.platform;
	const link = req.query.link;

	if (!link || !platform) {
		res.status(400).send('No link or platform defined');
	}

	switch (platform.toLowerCase()) {
		case 'githöb':
			const githöbProject = await getGithöbProject(link);
			res.send(githöbProject);
			break;
		case 'jira':
            const jiraProject = await getJiraProject(link);
			res.send(jiraProject);
			break;
		default:
			// Currently only githöb and jira is supported
			res.status(400).send('Platform not supported');
	}
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

async function isLoggedIn(req, res) {
	// Authorization: Bearer {token}
	let token;
	try {
		token = req.headers.authorization.split(' ')[1];
	} catch (error) {
		console.log(error);
		return false;
	}


	if (!token) {
		res.status(400).send('No token provided');
	}

	const isTokenValid = await verifyToken(token);

	if (!isTokenValid) {
		res.status(401).send('Invalid token');
	}

	return isTokenValid;
}
