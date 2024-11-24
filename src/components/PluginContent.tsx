import { author, name } from "@decky/manifest";
import { version } from "@decky/pkg";
import { useEffect, useState } from "react";

import { LiveTiming } from "../client";

type PluginContentProps = {
  ltClient: LiveTiming;
};

const PluginContent = ({ ltClient }: PluginContentProps) => {
  const [connState, setConnState] = useState(ltClient.state);

  const updateState = () => {
    setConnState(ltClient.state);
  };

  useEffect(() => {
    ltClient.on("closed", updateState);
    ltClient.on("connected", updateState);
    ltClient.on("disconnected", updateState);
    ltClient.on("reconnected", updateState);
    ltClient.on("reconnecting", updateState);

    return () => {
      ltClient.off("closed", updateState);
      ltClient.off("connected", updateState);
      ltClient.off("disconnected", updateState);
      ltClient.off("reconnected", updateState);
      ltClient.off("reconnecting", updateState);
    };
  }, []);

  return (
    <>
      <h2>Hello from plugin content!</h2>
      <p>
        Name:
        {" "}
        {name}
      </p>
      <p>
        Version:
        {" "}
        {version}
      </p>
      <p>
        Author:
        {" "}
        {author}
      </p>
      <p>
        Connection State:
        {" "}
        {connState}
      </p>
    </>
  );
};

export default PluginContent;
