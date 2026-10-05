import express from "express";
import cors from "cors";

import "dotenv/config";
import {
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { db } from "./database";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "user-service",
    status: "healthy",
  });
});

app.post("/users", async (req, res) => {
  try {
    const user = {
      id: crypto.randomUUID(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME!,
        Item: user,
      })
    );

    res.status(201).json({
      user,
    });
  } catch (error) {
    console.error("Failed to create user:", error);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
});

app.get("/users", async (_req, res) => {
  try {
    const result = await db.send(
      new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME!,
      })
    );

    res.json({
      users: result.Items ?? [],
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const result = await db.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME!,
        Key: {
          id: req.params.id,
        },
      })
    );

    if (!result.Item) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: result.Item,
    });
  } catch (error) {
    console.error("Failed to fetch user:", error);

    res.status(500).json({
      message: "Failed to fetch user",
    });
  }
});

// Upsert: creates the profile if it doesn't exist, otherwise merges in all provided fields
app.put("/users/:id", async (req, res) => {
  try {
    const now = new Date().toISOString();

    const existing = await db.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME!,
        Key: { id: req.params.id },
      })
    );

    // Never let the request body change the id or createdAt
    const { id: _id, createdAt: _createdAt, ...updates } = req.body ?? {};

    const user = {
      ...(existing.Item ?? {}),
      ...updates,
      id: req.params.id,
      createdAt: existing.Item?.createdAt ?? now,
      updatedAt: now,
    };

    await db.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME!,
        Item: user,
      })
    );

    res.status(existing.Item ? 200 : 201).json({ user });
  } catch (error) {
    console.error("Failed to save user:", error);
    res.status(500).json({ message: "Failed to save user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    await db.send(
      new DeleteCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME!,
        Key: {
          id: req.params.id,
        },
      })
    );

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete user:", error);

    res.status(500).json({
      message: "Failed to delete user",
    });
  }
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});