import express from "express";
import cors from "cors";

const app = express();

// CORS Configuration
const corsOptions = {
    origin: "https://password-reset-nit-ui.netlify.app", // Allow requests from your frontend
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true
};

app.use(cors(corsOptions));

// Middleware for parsing JSON
app.use(express.json());

// Your routes here...
app.post("/api/register", (req, res) => {
    res.json({ message: "User registered successfully!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
