import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import dotenv from "dotenv";
dotenv.config();

const client = new DynamoDBClient({
  ...(process.env.AWS_REGION !== undefined && { region: process.env.AWS_REGION }),
});

export const db = DynamoDBDocumentClient.from(client);