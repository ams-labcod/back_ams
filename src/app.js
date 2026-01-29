import express from 'express';
import userRoutes from './routes/users_routes.js';
import create_course from './routes/courses_routes.js';
import criteria_routes from './routes/criteria_routes.js';
import cors from 'cors';    
//import endpoint
import Routes from './routes/index.js'

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
app.use('/', create_course);
app.use('/', criteria_routes);

export default app;
