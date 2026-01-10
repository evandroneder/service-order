import cors from "cors";
import "dotenv/config";
import express from "express";
import "./core/database";
import "./core/env";

const app = express();
const PORT = process.env.PORT || 3000;

import authRoutes from "./routes/auth.route";
import clientRoutes from "./routes/client.route";
import companyRoutes from "./routes/company.route";
import serviceOrderRoutes from "./routes/service-order.route";
import userRoutes from "./routes/user.route";

app.use(
  cors({
    origin: "http://localhost:5173", // front (Vite)
    credentials: true, // se usar cookies / refresh token
  })
);

app.use(express.json());

app.use("/", authRoutes);
app.use("/", serviceOrderRoutes);
app.use("/", companyRoutes);
app.use("/", clientRoutes);
app.use("/", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
