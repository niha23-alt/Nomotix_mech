import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import garageRoutes from "./routes/garageRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import carRoutes from "./routes/carRoutes.js";

const app = express();
app.use(cors({
  origin: ["http://localhost:5173"], // your frontend's origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Increase payload size limit for file uploads and large requests
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use("/api/garages", garageRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cars", carRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));
const PORT = process.env.PORT || 5001;
app.get("/", (req, res) => {
    res.send("OGExpress Service is running at " + PORT);
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
export default app;


