import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "../support/assertions";
import { CustomWorld } from "../support/world";

Given("I open the home page", async function (this: CustomWorld) {
  await this.page.goto(this.baseUrl);
});

When("I enter nickname {string}", async function (this: CustomWorld, nickname: string) {
  await this.page.fill('input[placeholder="あなたの名前を入力"]', nickname);
});

When("I create a room", async function (this: CustomWorld) {
  await this.page.click('button:has-text("新しい部屋を作る")');
});

Then("I should see waiting room", async function (this: CustomWorld) {
  await expect(this.page.locator('h1:has-text("待機ルーム")')).toBeVisible();
});

Then("I should see room code", async function (this: CustomWorld) {
  await expect(this.page.locator('text=部屋コード')).toBeVisible();
});

Then("I should see role configuration section", async function (this: CustomWorld) {
  await expect(this.page.locator('text=役職設定')).toBeVisible();
});

Then("I should see start game button", async function (this: CustomWorld) {
  await expect(this.page.locator('button:has-text("ゲーム開始")')).toBeVisible();
});

Then("I should see participants list", async function (this: CustomWorld) {
  await expect(this.page.locator('text=参加者')).toBeVisible();
});

Then("I should see language selector", async function (this: CustomWorld) {
  await expect(this.page.locator('button[aria-label="言語を選択"]')).toBeVisible();
});

Then("I should see how-to-play button", async function (this: CustomWorld) {
  await expect(this.page.locator('a:has-text("遊び方")')).toBeVisible();
});
