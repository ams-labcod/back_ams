import express from 'express';
import userRoutes from './routes/users_routes.js';
import cors from 'cors';    

const app = express();

// Habilitar CORS
app.use(cors());

// Middlewares
app.use(express.json());

// Routes
app.use('/', userRoutes);

export default app;
