import { author, name } from "@decky/manifest";
import { version } from "@decky/pkg";
import { HubConnection } from "@microsoft/signalr";

type PluginContentProps = {
  ltClient: HubConnection;
};

const PluginContent = ({ ltClient }: PluginContentProps) => {
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
        {ltClient.state}
      </p>
    </>
  );
};

export default PluginContent;
