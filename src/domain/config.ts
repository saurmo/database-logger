export interface DynamoConfig {
  region: string;
  dbname: string;
  service: string;
}

export type PostgresConfig = {
      connectionString?: string;
      host: string;
      dbname: string;
      user: string;
      password: string;
      port: number;
      service: string;
    }


export interface NewRelicConfig {
  licenseKey: string;
  appName: string;
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
      type: "newrelic";
      config: NewRelicConfig;
    }
  | {
      type: "console";
      config: {
        service: string;
      };
    };
