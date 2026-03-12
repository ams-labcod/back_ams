import express from 'express';

import userRoutes from './routes/users_routes.js';

import create_course from './routes/courses_routes.js';

import criteria_routes from './routes/criteria_routes.js';

import subject_route from './routes/subject_routes.js';

import evaluationRoute from './routes/evaluation.route.js'

import periodRoute from './routes/period.route.js'

import notesRoute from './routes/note.route.js'

import assistanceRoute from './routes/assitance.route.js'

import evaluationType from './routes/evaluationType.route.js'

import reportedRoute from './routes/report.route.js'

import logrosRoutes from './routes/logros.routes.js'

import studentRoute from './routes/student.route.js'

import teachersRoute from './routes/teachers_route.js'


import cors from 'cors';    

//import endpoint
import Routes from './routes/index.js'   

const app = express();

const corsOptions = {
  origin: true, // acepta cualquier origen dinámicamente
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
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
app.use('/', subject_route)
app.use('/', evaluationRoute)
app.use('/', periodRoute)
app.use('/', notesRoute)
app.use('/', assistanceRoute)
app.use('/', evaluationType)
app.use('/', reportedRoute)
app.use('/', logrosRoutes)  
app.use('/', studentRoute)
app.use('/', teachersRoute)
export default app;
