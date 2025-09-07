import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Logger } from "../domain/logger";
import { DynamoConfig } from "../domain/config";

const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: true, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: true, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

const translateConfig = { marshallOptions, unmarshallOptions };

export class DynamoLogger implements Logger {
  private static instance: Logger;
  private constructor(
    private dynamoDoc: DynamoDBDocument,
    private tableName: string,
    private service: string
  ) {}

  static getInstance(config: DynamoConfig) {
    if (!this.instance) {
      const client = new DynamoDB({ region: config.region });
      const dynamoDoc = DynamoDBDocument.from(client, translateConfig);
      this.instance = new DynamoLogger(dynamoDoc, config.dbname, config.service);
    }
    return this.instance;
  }

  async log(message: string, info: any) {
    try {
      await this.saveLog(message, info?.detail ? info?.detail : info, "log");
    } catch (error) {
      console.error("Error logging message to database:", error);
    }
  }

  async error(message: string, info: any) {
    try {
      await this.saveLog(message, info, "error");
    } catch (error) {
      console.error("Error logging message to database:", error);
    }
  }

  private async saveLog(message: string, info: any, level: string) {
    const id = uuidv4();
    await this.dynamoDoc.put({
      TableName: this.tableName,
      Item: {
        id,
        level,
        created_at: new Date().getTime(),
        service: this.service,
        message,
        info,
        ttl: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 15, // 15 days
      },
    });
  }
}
