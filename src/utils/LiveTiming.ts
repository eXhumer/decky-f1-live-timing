import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { DeckyHttpClient } from "./DeckyHttpClient";
import { ConsoleLogger } from "./Logger";

export const setupLtConnection = (minLogLevel: LogLevel = LogLevel.Debug, autoReconnect = true) => {
  const logger = new ConsoleLogger(minLogLevel);
  const httpClient = new DeckyHttpClient(logger);

  let connBuilder = new HubConnectionBuilder()
    .withUrl("https://livetiming.formula1.com/signalrcore", {
      httpClient,
      logger,
    });

  if (autoReconnect)
    connBuilder = connBuilder.withAutomaticReconnect();

  return connBuilder.build();
};
