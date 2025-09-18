import express from 'express';
import routes from './routes/index.js';

const app = express();

app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3112;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
