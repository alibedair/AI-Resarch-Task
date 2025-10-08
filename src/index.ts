import express from 'express';
import researchRouter from './routes/research';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));
app.use('/', researchRouter);

app.listen(port, () => {
  console.log(`AI Research Assistant backend running on port ${port}`);
});