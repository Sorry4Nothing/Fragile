import express from 'express'
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello Planet!');
});

app.post('login', (req, res) => {
    req.
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
