import { expect, test } from '@playwright/test';

// Every menu screen, loaded directly as a visitor's link would.
const SCREENS = ['overview', 'experience', 'pictos', 'skills', 'luminas', 'skill-tree'];

// The UI kit draws each texture on a `Texture…-tex` layer, as a border-image (9-slice) or a background.
const texturesWithoutImage = () =>
  [...document.querySelectorAll<HTMLElement>('[class*="-tex"]')]
    .filter((el) => [...el.classList].some((name) => /^Texture\w+-tex$/.test(name)))
    .filter((el) => {
      const style = getComputedStyle(el);
      return [style.borderImageSource, style.backgroundImage, style.maskImage].every(
        (image) => image === 'none'
      );
    })
    .map((el) => el.className);

for (const screen of SCREENS) {
  test(`${screen}: every texture has its image, and every file loads`, async ({ page }) => {
    const failed: string[] = [];
    page.on('response', (response) => {
      if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
    });
    page.on('requestfailed', (request) => failed.push(`failed ${request.url()}`));

    await page.goto(`${screen}/`);
    await page.waitForLoadState('networkidle');

    // A regression: the CSS layers' order was lost in the bundle and Tailwind's reset removed every border-image.
    const count = await page.locator('[class*="-tex"]').count();
    expect(count).toBeGreaterThan(0);
    expect(await page.evaluate(texturesWithoutImage)).toEqual([]);
    expect(failed).toEqual([]);
  });
}
