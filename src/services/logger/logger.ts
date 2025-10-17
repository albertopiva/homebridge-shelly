import { Logging } from 'homebridge';

export class Logger {
  private logger: Logging | undefined;
  private msgPrefix: string = '[Shelly]';

  constructor(logger?: Logging, prefix?: string) {
    this.logger = logger;
    if (prefix) {
      this.msgPrefix = prefix;
    }
  }

  public debug(message: string, ...args: unknown[]) {
    this.logger?.debug(`${this.msgPrefix} ${message}`, ...args);
  }

  public info(message: string, ...args: unknown[]) {
    this.logger?.info(`${this.msgPrefix} ${message}`, ...args);
  }

  public warn(message: string, ...args: unknown[]) {
    this.logger?.warn(`${this.msgPrefix} ${message}`, ...args);
  }

  public error(message: string, ...args: unknown[]) {
    this.logger?.error(`${this.msgPrefix} ${message}`, ...args);
  }
}
