import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import { ApiError, notFound } from './utils/ApiError.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// API routes
app.use("/api", routes);

// 404 for unmatched API routes
app.use('/api', (req, res, next) => {
	next(notFound('API route not found'));
});

// Central error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
	if (err instanceof ApiError || err.statusCode) {
		return res.status(err.statusCode).json({ success: false, message: err.message, details: err.details });
	}
	console.error('Unhandled error:', err);
	return res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;
