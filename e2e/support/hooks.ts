import { Before, After, setDefaultTimeout } from "@cucumber/cucumber";
import { CustomWorld } from "./world";

setDefaultTimeout(30000);

Before(async function (this: CustomWorld) {
  await this.init();
});

After(async function (this: CustomWorld) {
  await this.cleanup();
});
