import 'newrelic';
import { Logger } from '../domain/logger';
import { NewRelicConfig } from '../domain/config';


export class NewRelicLogger implements Logger {
  private static instance: Logger;
  private constructor() {}

  static  getInstance(config: NewRelicConfig) {
    if (!this.instance) {
      const instance = new NewRelicLogger();
      process.env.NEW_RELIC_APP_NAME = config.appName;
      process.env.NEW_RELIC_LICENSE_KEY = config.licenseKey;
      this.instance = instance;
    }
    return this.instance;
  }

  async log(message: string, info: any) {
    console.info("NewRelicLogger log", message, info);
  }

  async error(message: string, info: any) {
    console.info("NewRelicLogger error", message, info);
  }
}