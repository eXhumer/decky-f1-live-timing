import externalGlobals from "rollup-plugin-external-globals";

import deckyPlugin from "@decky/rollup";

import pkg from "./package.json" assert { type: "json" };

export default deckyPlugin({
  plugins: [
    externalGlobals({
      "@decky/pkg": JSON.stringify(pkg),
    }),
  ],
});
