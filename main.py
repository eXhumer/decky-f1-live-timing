import decky # type: ignore
import settings # type: ignore


class Plugin:
    async def _main(self):
        decky.logger.info("Hello World!")

    async def _unload(self):
        decky.logger.info("Goodnight World!")

    async def _uninstall(self):
        decky.logger.info("Goodbye World!")
