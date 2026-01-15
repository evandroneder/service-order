import cors from "cors";
import "dotenv/config";
import express from "express";
import "./core/database";
import "./core/env";

const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import clientRoutes from "./routes/client.route";
import companyRoutes from "./routes/company.route";
import serviceOrderRoutes from "./routes/service-order.route";
import userRoutes from "./routes/user.route";

app.use(cookieParser());

app.use(
  cors({
    origin: HOST,
    credentials: true,
  })
);

app.use(express.json());

app.use("/", authRoutes);
app.use("/", serviceOrderRoutes);
app.use("/", companyRoutes);
app.use("/", clientRoutes);
app.use("/", userRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
