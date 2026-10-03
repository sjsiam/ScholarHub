"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({
    region: process.env.AWS_REGION,
});
exports.db = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
