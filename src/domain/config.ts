export interface DynamoConfig {
  region: string;
  dbname: string;
  service: string;
}

export interface PostgresConfig {
  host: string;
  dbname: string;
  user: string;
  password: string;
  port: number;
  service: string;
}

export type DbLoggerProps =
  | {
      type: "dynamo";
      config: DynamoConfig;
    }
  | {
      type: "postgres";
      config: PostgresConfig;
    }
  | {
      type: "console";
      config: {
        service: string;
      };
    };
