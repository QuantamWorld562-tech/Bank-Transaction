import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import accountRoute from "./routes/account.route.js";
import transactionRoute from "./routes/transaction.route.js";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();

const app = express();

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// api routes
app.use("/api/user", userRoute);
app.use("/api/account", accountRoute);
app.use("/api/transaction", transactionRoute);

app.use(express.static(path.join(__dirname,"/client/dist")));
app.get("*", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
});

await connectDB();
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
