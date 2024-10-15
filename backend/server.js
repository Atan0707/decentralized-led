const express = require('express');
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
let currentState = null;

app.post('/state', (req, res) => {
    const { state } = req.body;
    console.log('Received state:', state);
    currentState = state; // Store the state
    res.send({ message: 'State received successfully' });
});

app.get('/state', (req, res) => {
    res.send({ state: currentState });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});