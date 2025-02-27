"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DatabaseLogger: () => DatabaseLogger
});
module.exports = __toCommonJS(index_exports);

// src/infrastructure/dynamo.logger.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var import_uuid = require("uuid");
var marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false,
  // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: true,
  // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: true
  // false, by default.
};
var unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false
  // false, by default.
};
var translateConfig = { marshallOptions, unmarshallOptions };
var DynamoLogger = class _DynamoLogger {
  constructor(dynamoDoc, tableName, service) {
    this.dynamoDoc = dynamoDoc;
    this.tableName = tableName;
    this.service = service;
  }
  static getInstance(config) {
    if (!this.instance) {
      const client = new import_client_dynamodb.DynamoDB({ region: config.region });
      const dynamoDoc = import_lib_dynamodb.DynamoDBDocument.from(client, translateConfig);
      this.instance = new _DynamoLogger(dynamoDoc, config.dbname, config.service);
    }
    return this.instance;
  }
  log(message, info) {
    return __async(this, null, function* () {
      try {
        yield this.saveLog(message, (info == null ? void 0 : info.detail) ? info == null ? void 0 : info.detail : info, "log");
      } catch (error) {
        console.error("Error logging message to database:", error);
      }
    });
  }
  error(message, info) {
    return __async(this, null, function* () {
      try {
        yield this.saveLog(message, info, "error");
      } catch (error) {
        console.error("Error logging message to database:", error);
      }
    });
  }
  saveLog(message, info, level) {
    return __async(this, null, function* () {
      const id = (0, import_uuid.v4)();
      yield this.dynamoDoc.put({
        TableName: this.tableName,
        Item: {
          id,
          level,
          created_at: (/* @__PURE__ */ new Date()).getTime(),
          service: this.service,
          message,
          info
        }
      });
    });
  }
};

// src/infrastructure/postgres.logger.ts
var import_pg = require("pg");
var PostgresLogger = class _PostgresLogger {
  constructor(config) {
    this.config = config;
  }
  static getInstance(config) {
    return __async(this, null, function* () {
      if (!this.instance) {
        const instance = new _PostgresLogger(config);
        yield instance.connect();
        this.instance = instance;
      }
      return this.instance;
    });
  }
  connect() {
    return __async(this, null, function* () {
      try {
        this.pool = new import_pg.Pool({
          host: this.config.host,
          user: this.config.user,
          password: this.config.password,
          port: this.config.port || 5432,
          database: this.config.dbname || "postgres"
        });
        const client = yield this.pool.connect();
        client.release();
        console.info("Postgres connected");
      } catch (error) {
        console.error("Error connecting to Postgres:", error);
        throw error;
      }
    });
  }
  log(message, info) {
    return __async(this, null, function* () {
      try {
        yield this.saveLog(message, (info == null ? void 0 : info.detail) ? info == null ? void 0 : info.detail : info, "log");
      } catch (error) {
        console.info("Error logging message to database:", error);
      }
    });
  }
  error(message, info) {
    return __async(this, null, function* () {
      try {
        yield this.saveLog(message, info, "error");
      } catch (error) {
        console.info("Error logging message to database:", error);
      }
    });
  }
  saveLog(message, metadata, level) {
    return __async(this, null, function* () {
      const client = yield this.pool.connect();
      const query = "INSERT INTO logs(level, message, metadata, service) VALUES($1, $2, $3, $4)";
      const values = [level, message, metadata ? JSON.stringify(metadata) : null, this.config.service];
      yield client.query(query, values);
      if (client) client.release();
      return true;
    });
  }
};

// src/index.ts
var DatabaseLogger = class _DatabaseLogger {
  constructor() {
  }
  static getInstance(config) {
    return __async(this, null, function* () {
      if (!this.instance) {
        this.instance = new _DatabaseLogger();
        switch (config.type) {
          case "dynamo":
            this.instance.logger = DynamoLogger.getInstance(config.config);
            break;
          case "postgres":
            this.instance.logger = yield PostgresLogger.getInstance(config.config);
            break;
          case "console":
            this.instance.logger = {
              error: (message, info) => Promise.resolve(console.error(message, info)),
              log: (message, info) => Promise.resolve(console.log(message, info))
            };
            break;
          default:
            throw new Error("LoggerDb type not found");
        }
      }
      return Promise.resolve(this.instance.logger);
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DatabaseLogger
});
