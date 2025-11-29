import express, {} from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { getPool } from './databases/database.js';
import usersRouter from './routers/usersRouter.js';

const app = express();
const PORT = 3005;
// Connect to database
getPool();
// Middleware
app.use(cors({ origin: true }));
app.use(express.json());
// Routes
app.use('/api/users', usersRouter);
// Serve static files (optional)
// app.use('/static', express.static(path.join(process.cwd(), 'static')));
// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}...`);
});
