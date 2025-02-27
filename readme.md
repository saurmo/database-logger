# 📜 database-logger
A simple and flexible logging library that supports storing logs in **DynamoDB (AWS), PostgreSQL, or the console**.

## ✨ Features
- 📌 **DynamoDB support** (AWS)
- 🛢️ **PostgreSQL support**
- 🖥️ **Console logging** (local logs)
- 🔌 **Easy integration** into any Node.js application
- 🎯 **Interface-based implementation** for flexibility

---

## 📦 Installation
```sh
npm install database-logger
npm install ../@database-logger/database-logger-1.0.0.tgz
```

---

## ⚙️ Configuration
You can configure the logger to use **DynamoDB, PostgreSQL, or the console**.

### **1️⃣ DynamoDB Configuration**
To use DynamoDB as the storage backend, provide the required AWS credentials and the table name.

```ts
import { DynamoLogger } from "database-logger";

const logger = new DynamoLogger({
  tableName: "logs",
  service: "my-service",
  awsConfig: {
    region: "us-east-1",
    accessKeyId: "your-access-key",
    secretAccessKey: "your-secret-key",
  },
});

logger.log("This is an info message", { user: "JohnDoe" });
logger.error("This is an error message", { error: "Something went wrong" });
```

📌 **DynamoDB Table Schema (`logs`)**  
| Column       | Type          | Description                  |
|-------------|--------------|------------------------------|
| `id`        | `STRING`      | Unique log ID (UUID)        |
| `level`     | `STRING`      | Log level (`info`, `error`) |
| `message`   | `STRING`      | Log message                 |
| `info`      | `MAP`         | Additional metadata         |
| `service`   | `STRING`      | Service name                |
| `created_at`| `NUMBER` (timestamp) | Log creation time |

### **2️⃣ PostgreSQL Configuration**
To use PostgreSQL as the storage backend, provide the database connection details.

```ts
import { PostgresLogger } from "database-logger";

const logger = new PostgresLogger({
  connectionString: "postgres://user:password@localhost:5432/logs",
  service: "my-service",
});

logger.log("User logged in", { user: "JohnDoe" });
logger.error("Failed to process request", { requestId: "1234" });
```

📌 **PostgreSQL Table Schema (`logs`)**
```sql
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  service TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **3️⃣ Console Logger (Default)**
If no database is configured, logs will be printed to the console.

```ts
import { ConsoleLogger } from "database-logger";

const logger = new ConsoleLogger();

logger.log("User signed up", { userId: "xyz123" });
logger.error("API request failed", { status: 500 });
```

---

## 🚀 Usage
All logger implementations follow the same interface:

```ts
export interface Logger {
  log(message: string, info?: any): Promise<void>;
  error(message: string, info: any): Promise<void>;
}
```

This allows you to easily switch between logging providers.

Example:
```ts
async function main() {
  const logger: Logger = new DynamoLogger({ tableName: "logs", service: "api-service" });

  await logger.log("Service started");
  await logger.error("Unexpected error", { code: 500, details: "Internal Server Error" });
}

main();
```

---

## 🔧 Implementation Details

### **DynamoDB Logger**
Logs are stored using AWS SDK's `put` method:

```ts
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
    },
  });
}
```

### **PostgreSQL Logger**
Logs are inserted into the PostgreSQL database:

```ts
private async saveLog(message: string, metadata: any, level: string) {
  const client = await this.pool.connect();
  const query = "INSERT INTO logs(level, message, metadata, service) VALUES($1, $2, $3, $4)";
  const values = [level, message, metadata ? JSON.stringify(metadata) : null, this.config.service];
  await client.query(query, values);
  client.release();
}
```

---

## 📜 License
MIT License. Feel free to use and modify.

