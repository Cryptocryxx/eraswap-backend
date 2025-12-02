import express from 'express';
import cors from 'cors';
import db from './databases/database.js';
import usersRouter from './routers/usersRouter.js';
import itemsRouter from './routers/itemsRouter.js';
import cartsRouter from './routers/cartsRouter.js';
import ordersRouter from './routers/ordersRouter.js';
import inventoryRouter from './routers/inventoryRouter.js';

const app = express();

const PORT = 3005;
// Connect to database
db.getPool(); // Initialize the pool
// Middleware
app.use(cors({ origin: true }));
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

app.use('/api/users', usersRouter);
app.use('/api/items', itemsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/inventory', inventoryRouter);

// Serve static files (optional)
// app.use('/static', express.static(path.join(process.cwd(), 'static')));
// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}...`);
});
