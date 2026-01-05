import express from 'express';
import userRoutes from './routes/users_routes.js';
import cors from 'cors';    

const app = express();

const corsOptions = {
  origin: true, // acepta cualquier origen dinámicamente
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

// Habilitar CORS (normal + preflight)
app.use(cors(corsOptions))


// Middlewares
app.use(express.json());

// Routes
app.use('/', userRoutes);

export default app;
