import { definePlugin } from "@decky/api";
import { name } from "@decky/manifest";
import { version } from "@decky/pkg";

import { FaShip } from "react-icons/fa";

import PluginContent from "./components/PluginContent";
import PluginTitleView from "./components/PluginTitleView";

import { LiveTiming } from "./utils/LiveTiming";
import { error, info } from "./utils/Logger";
import { HubConnectionState } from "@microsoft/signalr";
import { getSystemNetworkStore } from "./utils/Steam";

export default definePlugin(() => {
  // setup a self healing persistent connection
  const ltClient = new LiveTiming();

  ltClient.on("closed", (err?: Error) => {
    if (err)
      error("Connection closed due to error", err);

    else
      info("Connection closed");

    const connInterval = setInterval(() => {
      const networkStore = getSystemNetworkStore();

      if (!networkStore)
        return;

      if (!networkStore.hasInternetConnection)
        return;

      ltClient
        .start()
        .then(() => {
          clearInterval(connInterval);
        })
        .catch(() => {});
    }, 5000);
  });

  ltClient.on("connected", () => {
    info("Connected to Live Timing");

    ltClient
      .Subscribe(["SessionInfo"])
      .then((current) => {
        info("Current Session Info", current.SessionInfo);
      });
  });

  ltClient.on("disconnected", () => {
    info("Disconnected from Live Timing");
  });

  ltClient.on("feed", ([topic, data, timestamp]: [string, unknown, string]) => {
    info("Received feed", topic, data, timestamp);
  });

  ltClient.on("reconnected", (connectionId?: string) => {
    info("Reconnected to Live Timing", connectionId);
    ltClient
      .Subscribe(["SessionInfo"])
      .then((current) => {
        info("Current Session Info", current.SessionInfo);
      });
  });

  ltClient.on("reconnecting", (err?: Error) => {
    if (err)
      error("Reconnecting to Live Timing", err);

    else
      info("Reconnecting to Live Timing");
  });

  const connInterval = setInterval(() => {
    const networkStore = getSystemNetworkStore();

    if (!networkStore)
      return;

    if (!networkStore.hasInternetConnection)
      return;

    ltClient
      .start()
      .then(() => {
        clearInterval(connInterval);
      })
      .catch(() => {});
  }, 5000);

  return {
    name,
    version,
    titleView: <PluginTitleView value={name} />,
    content: <PluginContent ltClient={ltClient} />,
    icon: <FaShip />,
    onDismount: () => {
      if (ltClient.state === HubConnectionState.Connected)
        ltClient
          .stop()
          .then(() => {
            info("Disconnected from Live Timing");
          });
    },
  };
});
