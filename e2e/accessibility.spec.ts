import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { enterMyDetails, mockGeocoder } from './helpers'

/** Automated accessibility audit (axe-core). Fails on serious or critical issues. */
async function audit(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([])
}

test('home page', async ({ page }) => {
  await page.goto('/')
  await audit(page)
})

test('birth details form, including error state', async ({ page }) => {
  await page.goto('/begin')
  await page.getByRole('button', { name: 'Reveal my chart' }).click()
  await audit(page)
})

test('Kundli dashboard', async ({ page }) => {
  await mockGeocoder(page)
  await enterMyDetails(page)
  await audit(page)
})

test('Love & Marriage report', async ({ page }) => {
  await mockGeocoder(page)
  await enterMyDetails(page)
  await page.goto('/love')
  await page.getByText('/100').waitFor()
  await audit(page)
})

test('method and privacy pages', async ({ page }) => {
  await page.goto('/method')
  await audit(page)
  await page.goto('/privacy')
  await audit(page)
})
