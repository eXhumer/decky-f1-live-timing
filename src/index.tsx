import {
  definePlugin,
} from "@decky/api";
import { FaShip } from "react-icons/fa";

import { setupLtConnection } from "./utils/LiveTiming";
import { error, log } from "./utils/Logger";

import PluginContent from "./components/PluginContent";
import PluginTitleView from "./components/PluginTitleView";

import { name } from "@decky/manifest";
import { version } from "@decky/pkg";
import { HubConnectionState } from "@microsoft/signalr";

export default definePlugin(() => {
  const ltClient = setupLtConnection();

  ltClient
    .start()
    .then(() => {
      log("Connected to Live Timing.");
      return ltClient.invoke("Subscribe", ["SessionInfo"]);
    })
    .then((current) => {
      log("Subscribed to Live Timing", current);
    })
    .catch((e) => {
      error("Failed to connect to Live Timing.", e);
    });

  return {
    name,
    version,
    titleView: <PluginTitleView value={name} />,
    content: <PluginContent ltClient={ltClient} />,
    icon: <FaShip />,
    onDismount: () => {
      if (ltClient.state === HubConnectionState.Connected)
        ltClient.stop()
          .then(() => {
            log("Disconnected from Live Timing.");
          })
          .catch((e) => {
            error("Failed to disconnect from Live Timing.", e);
          });
    },
  };
});
