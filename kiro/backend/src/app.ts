import express from 'express';
import cors from 'cors';
import subscriptionRouter from './routes/subscriptions';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/subscriptions', subscriptionRouter);

export default app;
