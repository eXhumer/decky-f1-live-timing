import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { DeckyHttpClient } from "./DeckyHttpClient";
import { DeckyRetryPolicy } from "./DeckyRetryPolicy";
import { ConsoleLogger } from "./Logger";
import Emittery from "emittery";
import { deepMerge } from "../../utils";

export default class LiveTiming extends Emittery {
  private m_connection: HubConnection;
  private m_current: Record<string, unknown>;

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
    this.m_current = deepMerge(this.m_current, { [topic]: data });
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

    this.m_connection = connection;
    this.m_current = {};
  }

  get Current() {
    return this.m_current;
  }

  get connectionId() {
    return this.m_connection.connectionId;
  }

  get state() {
    return this.m_connection.state;
  }

  start = () => {
    this.m_connection
      .start()
      .then(() => {
        this.emit("connected", this.m_connection.connectionId);
      })
      .catch((err) => {
        this.emit("startError", err);
      });
  };

  stop = () => {
    this.m_connection
      .stop()
      .then(() => {
        this.emit("disconnected");
      })
      .catch((err) => {
        this.emit("stopError", err);
      });
  };

  Subscribe = (topics: string[]) => {
    this.m_connection
      .invoke("Subscribe", topics)
      .then((current) => {
        this.m_current = current;
        this.emit("subscribed", Object.keys(current));
      });
  };

  Unsubscribe = (topics: string[]) => {
    this.m_connection
      .invoke("Unsubscribe", topics)
      .then(() => {
        const unsubscribed = [];

        for (const topic of topics) {
          if (topic in this.m_current) {
            unsubscribed.push(topic);
            delete this.m_current[topic];
          }
        }

        this.emit("unsubscribed", unsubscribed);
      });
  };
}
