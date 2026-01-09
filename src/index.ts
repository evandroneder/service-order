import express from "express";
import "dotenv/config";
import "./core/env";
import "./core/database";

const app = express();
const PORT = process.env.PORT || 3000;

import userRoutes from "./routes/user.route";
import clientRoutes from "./routes/client.route";
import companyRoutes from "./routes/company.route";
import serviceOrderRoutes from "./routes/service-order.route";
import authRoutes from "./routes/auth.route";

app.use(express.json());

app.use("/", authRoutes);
app.use("/", serviceOrderRoutes);
app.use("/", companyRoutes);
app.use("/", clientRoutes);
app.use("/", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
