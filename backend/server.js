import express from 'express';
const app = express();
const port = 3000;
import bodyParser from 'body-parser';

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Hello Planet!');
});

app.post('/login', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;

	if (username == 'password' && password == 'password') {
		res.send(`Welcome, your password is ${password}`);
    } else {
        res.send('GET LOST!');
    }
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
