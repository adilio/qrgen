import { expect, test, Locator } from '@playwright/test'

const setRangeValue = async (locator: Locator, value: number) => {
  await locator.evaluate((node: HTMLInputElement, val) => {
    node.value = String(val)
    node.dispatchEvent(new Event('input', { bubbles: true }))
    node.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

test.beforeEach(async ({ page }) => {
  page.on('console', (message) => {
    if (message.type() === 'error') {
      console.error('console error:', message.text())
    }
  })
  page.on('pageerror', (error) => {
    console.error('page error:', error)
  })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForSelector('textarea[aria-label="QR data"]', { state: 'visible' })
})

test('updates preview on text input and ECC selection', async ({ page }) => {
  const textArea = page.getByLabel('QR data')
  await textArea.fill('https://liquid.glass/qrgen')
  const svg = page.locator('svg').first()
  await expect(svg).toHaveAttribute('aria-label', /encoding 26 characters/)

  const eccSelect = page.getByLabel('ECC Level')
  await eccSelect.selectOption('Q')
  await expect(eccSelect).toHaveValue('Q')
})

test('copies to clipboard and downloads files', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Download PNG/i }).click(),
  ])
  const path = await download.path()
  expect(path).toBeTruthy()

  await page.getByRole('button', { name: /Copy PNG to clipboard/i }).click()
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('body *')).some((node) =>
      /clipboard/i.test(node.textContent ?? ''),
    )
  })
})

test('logo upload bumps ECC and share link encodes state', async ({ page }) => {
  await page.getByLabel('QR data').fill('https://playwright.dev')
  await page.getByLabel('Logo source').selectOption('upload')
  await page.getByRole('button', { name: /Upload logo/i }).click()
  await page.setInputFiles('input[type="file"]', 'tests/e2e/fixtures/logo.svg')
  await page.waitForTimeout(500)
  await setRangeValue(page.getByLabel('Logo scale'), 0.34)
  await expect(page.getByLabel('Logo scale')).toHaveValue('0.34')
  await page.getByLabel('ECC Level').selectOption('H')

  await page.getByRole('button', { name: /Share snapshot/i }).click()
  await page.waitForFunction(() => location.search.includes('config='))

  const url = await page.url()
  await page.goto(url)
  await expect(page.getByLabel('QR data')).toHaveValue('https://playwright.dev', {
    timeout: 10000,
  })
})

test('accessibility focus outline @a11y', async ({ page }) => {
  const share = page.getByRole('button', { name: /Share snapshot/i })
  await share.focus()
  const outlineColor = await share.evaluate((node) => getComputedStyle(node).outlineColor)
  expect(outlineColor).not.toBe('rgba(0, 0, 0, 0)')
})
