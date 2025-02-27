export interface Logger {
  log(message: string, info?: any): Promise<void>;
  error(message: string, info: any): Promise<void>;
}
