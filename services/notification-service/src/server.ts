import express from "express";
import cors from "cors";
import crypto from "crypto";
import "dotenv/config";
import { SESClient } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION,
});

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "notification-service",
    status: "healthy",
  });
});

app.post("/notifications", async (req, res) => {
  try {
    const { userId, email, subject, message } = req.body;

    if (!userId || !email || !subject || !message) {
      return res.status(400).json({
        message: "userId, email, subject, and message are required",
      });
    }

    const notification = {
      id: crypto.randomUUID(),
      userId,
      email,
      subject,
      message,
      status: "queued",
      createdAt: new Date().toISOString(),
    };

    console.log("Notification queued:", notification);

    res.status(202).json({
      message: "Notification queued successfully",
      notification,
    });
  } catch (error) {
    console.error("Failed to queue notification:", error);

    res.status(500).json({
      message: "Failed to queue notification",
    });
  }
});

app.get("/notifications/:userId", (req, res) => {
  res.json({
    userId: req.params.userId,
    notifications: [],
  });
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});