import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { DeckyHttpClient } from "./DeckyHttpClient";
import { DeckyRetryPolicy } from "./DeckyRetryPolicy";
import { ConsoleLogger } from "./Logger";
import Emittery from "emittery";

export class LiveTiming extends Emittery {
  private connection: HubConnection;

  private onClose = (err?: Error) => {
    this.emit("closed", err);
  };

  private onReconnected = (connectionId?: string) => {
    this.emit("reconnected", connectionId);
  };

  private onReconnecting = (err?: Error) => {
    this.emit("reconnecting", err);
  };

  private onFeed = (topic: string, data: unknown, timestamp: string) => {
    this.emit("feed", [topic, data, timestamp]);
  };

  constructor(minLogLevel: LogLevel = LogLevel.Debug, autoReconnect = true, maxRetryCount = 5) {
    super();
    const logger = new ConsoleLogger(minLogLevel);
    const httpClient = new DeckyHttpClient(logger);

    let connBuilder = new HubConnectionBuilder()
      .withUrl("https://livetiming.formula1.com/signalrcore", {
        httpClient,
        logger,
      });

    if (autoReconnect)
      connBuilder = connBuilder.withAutomaticReconnect(new DeckyRetryPolicy(maxRetryCount));

    const connection = connBuilder.build();

    connection.on("feed", this.onFeed);
    connection.onclose(this.onClose);
    connection.onreconnected(this.onReconnected);
    connection.onreconnecting(this.onReconnecting);

    this.connection = connection;
  }

  get connectionId() {
    return this.connection.connectionId;
  }

  get state() {
    return this.connection.state;
  }

  start = async () => {
    await this.connection.start();
    this.emit("connected", this.connection.connectionId);
  };

  stop = async () => {
    await this.connection.stop();
    this.emit("disconnected");
  };

  Subscribe = async (topics: string[]) => {
    return await this.connection.invoke("Subscribe", topics);
  };

  Unsubscribe = async (topics: string[]) => {
    return await this.connection.invoke("Unsubscribe", topics);
  };
}
