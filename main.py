import asyncio
import typing

import decky  # type: ignore
import settings  # type: ignore


class ConfigType(typing.TypedDict):
    debug: bool


class Plugin:
    def __init__(self) -> None:
        self._config_mgr = settings.SettingsManager(name="config", settings_directory=decky.DECKY_PLUGIN_SETTINGS_DIR)
        self._logger = decky.logger
        self._loop = asyncio.get_event_loop()

    async def _main(self):
        logger = self._logger.getChild("_main")
        logger.info("Hello World!")

    async def _unload(self):
        logger = self._logger.getChild("_unload")
        logger.info("Goodnight World!")

    async def _uninstall(self):
        logger = self._logger.getChild("_uninstall")
        logger.info("Goodbye World!")

    async def get_config(self):
        return ConfigType(
            debug=self._config_mgr.settings.get("debug", False),
        )

    async def update_config(self, config: ConfigType):
        if "debug" in config:
            self._config_mgr.settings["debug"] = config["debug"]

        self._config_mgr.commit()
