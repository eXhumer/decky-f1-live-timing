import { definePlugin } from "@decky/api";
import { name } from "@decky/manifest";
import { version } from "@decky/pkg";

import { FaShip } from "react-icons/fa";
import { HubConnectionState } from "@microsoft/signalr";

import { PluginContent, PluginTitleView } from "./components";

import { LiveTiming } from "./client";
import { error, info, getSystemNetworkStore } from "./utils";

export default definePlugin(() => {
  // setup a self healing persistent connection
  const ltClient = new LiveTiming();

  ltClient.on("closed", (err?: Error) => {
    if (err)
      error("Connection closed due to error", err);

    else
      info("Connection closed");

    const connInterval = setInterval(() => {
      const connClearInterval = () => {
        clearInterval(connInterval);
        ltClient.off("connected", connClearInterval);
      };

      const networkStore = getSystemNetworkStore();

      if (!networkStore)
        return;

      if (!networkStore.hasInternetConnection)
        return;

      ltClient.on("connected", connClearInterval);

      ltClient.start();
    }, 5000);
  });

  ltClient.on("connected", () => {
    info("Connected to Live Timing");
    ltClient.Subscribe(["SessionInfo"]);
  });

  ltClient.on("disconnected", () => {
    info("Disconnected from Live Timing");
  });

  ltClient.on("feed", ([topic, data, timestamp]: [string, unknown, string]) => {
    info("Received feed", topic, data, timestamp);
  });

  ltClient.on("reconnected", (connectionId?: string) => {
    info("Reconnected to Live Timing", connectionId);
    ltClient.Subscribe(["SessionInfo"]);
  });

  ltClient.on("reconnecting", (err?: Error) => {
    if (err)
      error("Reconnecting to Live Timing", err);

    else
      info("Reconnecting to Live Timing");
  });

  ltClient.on("subscribed", (topics: string[]) => {
    info("Subscribed to Live Timing");

    for (const topic of topics)
      info(topic, ltClient.Current[topic]);
  });

  ltClient.on("unsubscribed", (topics: string[]) => {
    info("Unsubscribed from Live Timing", topics);
  });

  ltClient.on("startError", (err: Error) => {
    error("Failed to start Live Timing", err);
  });

  ltClient.on("stopError", (err: Error) => {
    error("Failed to stop Live Timing", err);
  });

  const connInterval = setInterval(() => {
    const connClearInterval = () => {
      clearInterval(connInterval);
      ltClient.off("connected", connClearInterval);
    };

    const networkStore = getSystemNetworkStore();

    if (!networkStore)
      return;

    if (!networkStore.hasInternetConnection)
      return;

    ltClient.on("connected", connClearInterval);

    ltClient.start();
  }, 5000);

  return {
    name,
    version,
    titleView: <PluginTitleView value={name} />,
    content: <PluginContent ltClient={ltClient} />,
    icon: <FaShip />,
    onDismount: () => {
      const networkStore = getSystemNetworkStore();

      if (ltClient.state === HubConnectionState.Connected && networkStore?.hasInternetConnection)
        ltClient.stop();
    },
  };
});
