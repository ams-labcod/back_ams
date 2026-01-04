import express from 'express';
import userRoutes from './routes/users_routes.js';

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use('/', userRoutes);

export default app;
