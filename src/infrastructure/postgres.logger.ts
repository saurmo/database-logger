import { PostgresConfig } from "../domain/config";
import { Pool } from "pg";
import { Logger } from "../domain/logger";

export class PostgresLogger implements Logger {
  private static instance: Logger;
  private pool: Pool;

  private constructor(private config: PostgresConfig) {}

  static async getInstance(config: PostgresConfig) {
    if (!this.instance) {
      const instance = new PostgresLogger(config);
      await instance.connect();
      this.instance = instance;
    }
    return this.instance;
  }

  private async connect() {
    try {
      if (this.config?.connectionString) {
        this.pool = new Pool({
          connectionString: this.config.connectionString,
        });
      } else {
        this.pool = new Pool({
          host: this.config.host,
          user: this.config.user,
          password: this.config.password,
          port: this.config.port || 5432,
          database: this.config.dbname || "postgres",
        });
      }
      const client = await this.pool.connect();
      client.release();
      console.info("Postgres connected");
    } catch (error) {
      console.error("Error connecting to Postgres:", error);
      throw error;
    }
  }

  async log(message: string, info: any) {
    try {
      await this.saveLog(message, info?.detail ? info?.detail : info, "log");
    } catch (error) {
      console.info("Error logging message to database:", error);
    }
  }

  async error(message: string, info: any) {
    try {
      await this.saveLog(message, info, "error");
    } catch (error) {
      console.info("Error logging message to database:", error);
    }
  }

  private async saveLog(message: string, metadata: any, level: string) {
    const client = await this.pool.connect();
    const query = "INSERT INTO logs(level, message, metadata, service) VALUES($1, $2, $3, $4)";
    const values = [level, message, metadata ? JSON.stringify(metadata) : null, this.config.service];
    await client.query(query, values);
    if (client) client.release();
    return true;
  }
}
