const app = require('./app');
const dotenv = require('dotenv');
dotenv.config();
dotenv.config({ path: 'dot.env' });

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`servidor rodando em http://localhost:${port}`);
});
