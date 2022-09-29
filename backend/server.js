import express from 'express';
const app = express();
const port = 3000;
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import { generateToken } from './tokenGenerator.js';

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
                    password: row.password
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
                    password: password
                };
                const token = await generateToken(user);
                res.send(token);
            }
        });
        insertStmt.finalize();
    });
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
