import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error';
import accountsRouter from './routes/accounts';
import cardsRouter from './routes/cards';
import transactionsRouter from './routes/transactions';
import goalsRouter from './routes/goals';
import budgetsRouter from './routes/budgets';
import analyticsRouter from './routes/analytics';
import recommendationsRouter from './routes/recommendations';
import categoriesRouter from './routes/categories';
import { initDb, closeDriver } from './db';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.use('/api/accounts', accountsRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/categories', categoriesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const server = app.listen(PORT, async () => {
  console.log(`Personal Finance Network API listening on http://localhost:${PORT}`);
  await initDb();
});
process.on('SIGTERM', async () => {
  server.close();
  await closeDriver();
});

export default app;
