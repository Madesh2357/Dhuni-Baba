import type { Page } from '@playwright/test'

/** Answer place searches locally so tests never depend on the real Open-Meteo service. */
export async function mockGeocoder(page: Page) {
  const places = [
    { name: 'Chennai', latitude: 13.08784, longitude: 80.27847, timezone: 'Asia/Kolkata', country: 'India', admin1: 'Tamil Nadu' },
    { name: 'New Delhi', latitude: 28.63576, longitude: 77.22445, timezone: 'Asia/Kolkata', country: 'India', admin1: 'Delhi' },
  ]
  await page.route('https://geocoding-api.open-meteo.com/**', (route) => {
    const q = (new URL(route.request().url()).searchParams.get('name') ?? '').toLowerCase()
    const results = places.filter((p) => p.name.toLowerCase().includes(q.slice(0, 4)))
    return route.fulfill({ json: { results }, headers: { 'access-control-allow-origin': '*' } })
  })
}

export async function enterMyDetails(page: Page) {
  await page.goto('/begin')
  await page.getByLabel('Your name').fill('Zero')
  await page.getByLabel('Date of birth').fill('1995-08-20')
  await page.getByLabel('Time of birth').fill('06:45')
  await page.getByLabel('Place of birth').fill('Chennai')
  await page.getByRole('button', { name: /Chennai, Tamil Nadu, India/ }).click()
  await page.getByRole('button', { name: 'Reveal my chart' }).click()
  await page.getByRole('heading', { name: 'Namaste, Zero.' }).waitFor()
}
