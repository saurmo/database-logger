interface DynamoConfig {
    region: string;
    dbname: string;
    service: string;
}
interface PostgresConfig {
    host: string;
    dbname: string;
    user: string;
    password: string;
    port: number;
    service: string;
}
type DbLoggerProps = {
    type: "dynamo";
    config: DynamoConfig;
} | {
    type: "postgres";
    config: PostgresConfig;
} | {
    type: "console";
    config: {
        service: string;
    };
};

interface Logger {
    log(message: string, info?: any): Promise<void>;
    error(message: string, info: any): Promise<void>;
}

declare class DatabaseLogger {
    private static instance;
    private logger;
    private constructor();
    static getInstance(config: DbLoggerProps): Promise<Logger>;
}

export { DatabaseLogger, type DbLoggerProps, type DynamoConfig, type Logger, type PostgresConfig };
