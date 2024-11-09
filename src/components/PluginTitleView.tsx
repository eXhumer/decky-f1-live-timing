import { staticClasses } from "@decky/ui";

type PluginTitleViewProps = {
  value: string;
};

const PluginTitleView = ({ value }: PluginTitleViewProps) => {
  return (
    <div className={staticClasses.Title}>{value}</div>
  );
};

export default PluginTitleView;
