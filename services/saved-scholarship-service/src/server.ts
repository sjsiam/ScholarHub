import express from "express";
import cors from "cors";

import "dotenv/config";
import crypto from "crypto";
import {
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { db } from "./database";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "saved-scholarship-service",
    status: "healthy",
  });
});

app.get("/saved-scholarships/:userId", async (req, res) => {
  try {
    const result = await db.send(
      new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME!,
        FilterExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": req.params.userId,
        },
      })
    );

    res.json({
      userId: req.params.userId,
      scholarships: result.Items ?? [],
    });
  } catch (error) {
    console.error("Failed to fetch saved scholarships:", error);

    res.status(500).json({
      message: "Failed to fetch saved scholarships",
    });
  }
});

app.post("/saved-scholarships", async (req, res) => {
  try {
    const savedScholarship = {
      id: crypto.randomUUID(),
      userId: req.body.userId,
      scholarshipId: req.body.scholarshipId,
      createdAt: new Date().toISOString(),
    };

    await db.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME!,
        Item: savedScholarship,
      })
    );

    res.status(201).json({
      savedScholarship,
    });
  } catch (error) {
    console.error("Failed to save scholarship:", error);

    res.status(500).json({
      message: "Failed to save scholarship",
    });
  }
});

app.delete(
  "/saved-scholarships/:userId/:scholarshipId",
  async (req, res) => {
    try {
      const result = await db.send(
        new ScanCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME!,
          FilterExpression:
            "userId = :userId AND scholarshipId = :scholarshipId",
          ExpressionAttributeValues: {
            ":userId": req.params.userId,
            ":scholarshipId": req.params.scholarshipId,
          },
        })
      );

      const item = result.Items?.[0];

      if (!item) {
        return res.status(404).json({
          message: "Saved scholarship not found",
        });
      }

      await db.send(
        new DeleteCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME!,
          Key: {
            id: item.id,
          },
        })
      );

      res.json({
        message: "Saved scholarship removed successfully",
      });
    } catch (error) {
      console.error("Failed to remove saved scholarship:", error);

      res.status(500).json({
        message: "Failed to remove saved scholarship",
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(
    `Saved Scholarship Service running on port ${PORT}`
  );
});