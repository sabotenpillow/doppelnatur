import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import { Browser, BrowserContext, chromium, Page } from "playwright";

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  baseUrl: string;

  constructor(options: IWorldOptions) {
    super(options);
    this.baseUrl = (options.parameters?.baseUrl as string) || "http://localhost:3001";
  }

  async init() {
    const headlessParam = this.parameters?.headless;
    const headless = headlessParam !== false;
    this.browser = await chromium.launch({ headless });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async cleanup() {
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(CustomWorld);
