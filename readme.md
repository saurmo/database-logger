# 📜 database-logger
`database-logger` is a flexible and simple logging library that supports storing logs in **DynamoDB (AWS), PostgreSQL, New Relic, or the console**. Designed with an interface pattern for maximum flexibility and easy integration into Node.js applications.

## ✨ Features
- 📌 **DynamoDB support** (AWS)
- 🛢️ **PostgreSQL support**
- 📊 **New Relic APM integration**
- 🖥️ **Console logging** (local logs)
- 🔌 **Easy integration** into any Node.js application
- 🎯 **Interface-based implementation** for flexibility
- 🔐 **AWS Secrets Manager** integration
- ⚡ **Singleton pattern** for optimal performance

---

## 📦 Installation
```sh
npm install database-logger
```

---

## ⚙️ Configuration
You can configure the logger to use **DynamoDB, PostgreSQL, New Relic, or the console**.

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

📌 **Esquema de la tabla DynamoDB (`logs`)**  
| Columna      | Tipo                | Descripción                        |
|--------------|---------------------|------------------------------------|
| `id`         | `STRING`            | ID único del log (UUID)            |
| `level`      | `STRING`            | Nivel del log (`info`, `error`)    |
| `message`    | `STRING`            | Mensaje del log                    |
| `info`       | `MAP`               | Metadatos adicionales              |
| `service`    | `STRING`            | Nombre del servicio                |
| `created_at` | `NUMBER` (timestamp)| Fecha de creación del log          |
| `ttl`        | `NUMBER` (timestamp)| Tiempo de vida (TTL) en segundos   |

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

### **3️⃣ New Relic Configuration**
To use New Relic for APM monitoring, provide the license key and application name.

```ts
import { DatabaseLogger } from "database-logger";

const logger = await DatabaseLogger.getInstance({
  type: "newrelic",
  config: {
    licenseKey: "your-license-key",
    appName: "my-application"
  }
});

logger.log("User action completed", { userId: "xyz123" });
logger.error("API request failed", { status: 500 });
```

### **4️⃣ Console Logger (Default)**
If no database is configured, logs will be printed to the console.

```ts
import { DatabaseLogger } from "database-logger";

const logger = await DatabaseLogger.getInstance({
  type: "console",
  config: {
    service: "my-service"
  }
});

logger.log("User signed up", { userId: "xyz123" });
logger.error("API request failed", { status: 500 });
```

---

## 🚀 Usage
All logger implementations follow the same interface and use the singleton pattern for optimal performance:

```ts
export interface Logger {
  log(message: string, info?: any): Promise<void>;
  error(message: string, info: any): Promise<void>;
}
```

This allows you to easily switch between logging providers using the `DatabaseLogger` factory.

### **Recommended Usage Pattern**
```ts
import { DatabaseLogger } from "database-logger";

async function main() {
  // Initialize logger with your preferred backend
  const logger = await DatabaseLogger.getInstance({
    type: "dynamo",
    config: {
      region: "us-east-1",
      dbname: "logs",
      service: "api-service"
    }
  });

  // Use the logger
  await logger.log("Service started");
  await logger.error("Unexpected error", { code: 500, details: "Internal Server Error" });
}

main();
```

### **Alternative Direct Usage**
```ts
import { DynamoLogger } from "database-logger";

const logger = DynamoLogger.getInstance({
  region: "us-east-1",
  dbname: "logs", 
  service: "api-service"
});

await logger.log("Service started");
```

---

## 🔐 AWS Secrets Manager Integration
For secure credential management, you can use AWS Secrets Manager:

```ts
import { getSecret } from "database-logger";

// Get database credentials from AWS Secrets Manager
const dbCredentials = await getSecret("prod/database/credentials");

const logger = await DatabaseLogger.getInstance({
  type: "postgres",
  config: {
    host: dbCredentials.host,
    user: dbCredentials.username,
    password: dbCredentials.password,
    port: dbCredentials.port,
    dbname: "logs",
    service: "api-service"
  }
});
```

---

## 🔧 Implementation Details

### **DynamoDB Logger**
Logs are stored using AWS SDK's `put` method with automatic TTL:

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
      ttl: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 15, // 15 days
    },
  });
}
```

**Key Features:**
- Automatic 15-day TTL for log cleanup
- UUID-based unique identifiers
- Optimized marshall/unmarshall configuration
- Error handling with console fallback

### **PostgreSQL Logger**
Logs are inserted into the PostgreSQL database using connection pooling:

```ts
private async saveLog(message: string, metadata: any, level: string) {
  const client = await this.pool.connect();
  const query = "INSERT INTO logs(level, message, metadata, service) VALUES($1, $2, $3, $4)";
  const values = [level, message, metadata ? JSON.stringify(metadata) : null, this.config.service];
  await client.query(query, values);
  if (client) client.release();
  return true;
}
```

**Key Features:**
- Connection pool for optimal performance
- JSONB metadata support
- Automatic connection management
- Connection validation on initialization

---

## 🏗️ Architecture & Design Patterns

### **Design Patterns Used**
- **Singleton Pattern**: Each logger type uses singleton for optimal resource usage
- **Factory Pattern**: `DatabaseLogger` acts as a factory to create logger instances
- **Interface Segregation**: Clean `Logger` interface for easy switching between providers
- **Dependency Injection**: Configurations injected via constructor

### **Technical Features**
- **Error Handling**: Try-catch in all logging methods with console fallback
- **Performance Optimizations**: 
  - Connection pooling for PostgreSQL
  - Optimized DynamoDB marshall/unmarshall configuration
  - Singleton pattern to avoid multiple instances
- **Security**: AWS Secrets Manager integration for secure credential management
- **Flexibility**: Easy switching between logging providers without code changes

### **Build Configuration**
- **Dual Format**: ESM and CommonJS support
- **TypeScript**: Full type definitions included
- **Entry Points**: 
  - `dist/index.js` (CommonJS)
  - `dist/index.mjs` (ESM)
  - `dist/index.d.ts` (TypeScript definitions)

---

## 📜 License
MIT License. Feel free to use and modify.

