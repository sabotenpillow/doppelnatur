import { When, Then } from "@cucumber/cucumber";
import { expect } from "../support/assertions";
import { CustomWorld } from "../support/world";

When("I open the invite menu", async function (this: CustomWorld) {
  await this.page.click('button:has-text("招待する")');
});

Then("I should see invite options", async function (this: CustomWorld) {
  await expect(this.page.locator('text=リンクをコピー')).toBeVisible();
  await expect(this.page.locator('text=LINEで共有')).toBeVisible();
  await expect(this.page.locator('text=メールで共有')).toBeVisible();
});
