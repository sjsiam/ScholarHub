"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const database_1 = require("./database");
const crypto_1 = __importDefault(require("crypto"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({
        service: "user-service",
        status: "healthy",
    });
});
app.post("/users", async (req, res) => {
    try {
        const user = {
            id: crypto_1.default.randomUUID(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await database_1.db.send(new lib_dynamodb_1.PutCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: user,
        }));
        res.status(201).json({
            user,
        });
    }
    catch (error) {
        console.error("Failed to create user:", error);
        res.status(500).json({
            message: "Failed to create user",
        });
    }
});
app.get("/users", async (_req, res) => {
    try {
        const result = await database_1.db.send(new lib_dynamodb_1.ScanCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
        }));
        res.json({
            users: result.Items ?? [],
        });
    }
    catch (error) {
        console.error("Failed to fetch users:", error);
        res.status(500).json({
            message: "Failed to fetch users",
        });
    }
});
app.get("/users/:id", async (req, res) => {
    try {
        const result = await database_1.db.send(new lib_dynamodb_1.GetCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                id: req.params.id,
            },
        }));
        if (!result.Item) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        res.json({
            user: result.Item,
        });
    }
    catch (error) {
        console.error("Failed to fetch user:", error);
        res.status(500).json({
            message: "Failed to fetch user",
        });
    }
});
app.put("/users/:id", async (req, res) => {
    try {
        const { name, email } = req.body;
        const result = await database_1.db.send(new lib_dynamodb_1.UpdateCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                id: req.params.id,
            },
            UpdateExpression: "SET #name = :name, #email = :email, updatedAt = :updatedAt",
            ExpressionAttributeNames: {
                "#name": "name",
                "#email": "email",
            },
            ExpressionAttributeValues: {
                ":name": name,
                ":email": email,
                ":updatedAt": new Date().toISOString(),
            },
            ReturnValues: "ALL_NEW",
        }));
        res.json({
            user: result.Attributes,
        });
    }
    catch (error) {
        console.error("Failed to update user:", error);
        res.status(500).json({
            message: "Failed to update user",
        });
    }
});
app.delete("/users/:id", async (req, res) => {
    try {
        await database_1.db.send(new lib_dynamodb_1.DeleteCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: {
                id: req.params.id,
            },
        }));
        res.json({
            message: "User deleted successfully",
        });
    }
    catch (error) {
        console.error("Failed to delete user:", error);
        res.status(500).json({
            message: "Failed to delete user",
        });
    }
});
app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});
