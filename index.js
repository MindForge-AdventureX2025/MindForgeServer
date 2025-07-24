import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import journalsRoutes from './routes/journals.routes.js';
// import chatsRoutes from './routes/chats.routes.js';
import { clerkMiddleware } from '@clerk/express';

dotenv.config();
import helmet from 'helmet';
import { connect } from 'http2';
import connectDB from './database/db.js';
const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN || '*', // Allow all origins by default
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow specific HTTP methods
        credentials: true // Allow credentials if needed
    }
));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware()); // Middleware for Clerk authentication

app.use('/api/journals', journalsRoutes);
// app.use('/api/chats', chatsRoutes);

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    connectDB(); // Ensure the database connection is established
});