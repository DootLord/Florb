import express from 'express';
import routes from './routes/index.js';

const app = express();

// Test route directly in app.ts
app.get('/test-direct', (req, res) => {
  res.json({ message: 'Direct route works!' });
});

app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3112;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
