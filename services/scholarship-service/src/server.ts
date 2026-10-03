import express from "express";
import cors from "cors";
import { scholarships } from "./data.js";
import { db } from "./database.js";
import crypto from "crypto";

import {
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";



const app = express();
const PORT = process.env.PORT || 3001;

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "scholarship-service",
    status: "healthy",
  });
});

app.get("/scholarships", async (_req, res) => {
  try {
    const result = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    res.json({
      scholarships: result.Items ?? [],
    });
  } catch (error) {
    console.error("Failed to fetch scholarships:", error);

    res.status(500).json({
      message: "Failed to fetch scholarships",
    });
  }
});

app.post("/scholarships", async (req, res) => {
  try {
    const scholarship = {
      id: crypto.randomUUID(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: scholarship,
      })
    );

    res.status(201).json({
      scholarship,
    });
  } catch (error) {
    console.error("Failed to create scholarship:", error);

    res.status(500).json({
      message: "Failed to create scholarship",
    });
  }
});

app.get("/scholarships/:id", async (req, res) => {
  try {
    const result = await db.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id: req.params.id,
        },
      })
    );

    if (!result.Item) {
      return res.status(404).json({
        message: "Scholarship not found",
      });
    }

    res.json({
      scholarship: result.Item,
    });
  } catch (error) {
    console.error("Failed to fetch scholarship:", error);

    res.status(500).json({
      message: "Failed to fetch scholarship",
    });
  }
});

app.put("/scholarships/:id", async (req, res) => {
  try {
    const updates = req.body;

    const result = await db.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          id: req.params.id,
        },
        UpdateExpression:
          "SET #title = :title, #organization = :organization, #country = :country, #degreeLevel = :degreeLevel, #fieldOfStudy = :fieldOfStudy, #fundingType = :fundingType, #amount = :amount, #deadline = :deadline, #eligibility = :eligibility, #description = :description, #applicationUrl = :applicationUrl, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#title": "title",
          "#organization": "organization",
          "#country": "country",
          "#degreeLevel": "degreeLevel",
          "#fieldOfStudy": "fieldOfStudy",
          "#fundingType": "fundingType",
          "#amount": "amount",
          "#deadline": "deadline",
          "#eligibility": "eligibility",
          "#description": "description",
          "#applicationUrl": "applicationUrl",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":title": updates.title,
          ":organization": updates.organization,
          ":country": updates.country,
          ":degreeLevel": updates.degreeLevel,
          ":fieldOfStudy": updates.fieldOfStudy,
          ":fundingType": updates.fundingType,
          ":amount": updates.amount,
          ":deadline": updates.deadline,
          ":eligibility": updates.eligibility,
          ":description": updates.description,
          ":applicationUrl": updates.applicationUrl,
          ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      })
    );

    res.json({
      scholarship: result.Attributes,
    });
  } catch (error) {
    console.error("Failed to update scholarship:", error);

    res.status(500).json({
      message: "Failed to update scholarship",
    });
  }
});

app.delete("/scholarships/:id", async (req, res) => {
  try {
    await db.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          id: req.params.id,
        },
      })
    );

    res.json({
      message: "Scholarship deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete scholarship:", error);

    res.status(500).json({
      message: "Failed to delete scholarship",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Scholarship Service running on port ${PORT}`);
});