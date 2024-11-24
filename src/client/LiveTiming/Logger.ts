import { ILogger, LogLevel } from "@microsoft/signalr";

import { trace, debug, info, warn, error, critical, log } from "../../utils";

export class ConsoleLogger implements ILogger {
  private readonly _minLevel: LogLevel;

  constructor(minimumLogLevel: LogLevel) {
    this._minLevel = minimumLogLevel;
  }

  log(logLevel: LogLevel, message: string) {
    if (logLevel < this._minLevel)
      return;

    const msg = `[${new Date().toISOString()}]: ${message}`;

    if (logLevel === LogLevel.Trace)
      trace(msg);

    else if (logLevel === LogLevel.Debug)
      debug(msg);

    else if (logLevel === LogLevel.Information)
      info(msg);

    else if (logLevel === LogLevel.Warning)
      warn(msg);

    else if (logLevel === LogLevel.Error)
      error(msg);

    else if (logLevel === LogLevel.Critical)
      critical(msg);

    else
      log(msg);
  }
}
