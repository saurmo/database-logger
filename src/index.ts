import { DbLoggerProps } from "./domain/config";
import { Logger } from "./domain/logger";
import { DynamoLogger } from "./infrastructure/dynamo.logger";
import { NewRelicLogger } from "./infrastructure/new-relic.logger";
import { PostgresLogger } from "./infrastructure/postgres.logger";

export class DatabaseLogger {
  private static instance: DatabaseLogger;
  private logger: Logger;
  private constructor() {}

  static async getInstance(config: DbLoggerProps): Promise<Logger> {
    if (!this.instance) {
      this.instance = new DatabaseLogger();
      switch (config.type) {
        case "dynamo":
          this.instance.logger = DynamoLogger.getInstance(config.config);
          break;
        case "postgres":
          this.instance.logger = await PostgresLogger.getInstance(config.config);
          break;
        case "console":
          this.instance.logger = {
            error: (message: string, info: any) => Promise.resolve(console.error(message, info)),
            log: (message: string, info: any) => Promise.resolve(console.log(message, info)),
          };
          break;
          case "newrelic":
            this.instance.logger = NewRelicLogger.getInstance(config.config);
        default:
          throw new Error("LoggerDb type not found");
      }
    }
    return Promise.resolve(this.instance.logger);
  }
}

export * from "./domain/logger";
export * from "./domain/config";