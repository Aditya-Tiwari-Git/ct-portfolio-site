import { expect, test } from '@playwright/test';
import { pageDefinitions } from '../../src/data/routes';
test('public routes render with unique metadata, working logo and no horizontal overflow', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && /hydrat|React error/i.test(m.text())) errors.push(m.text()); });
  for (const route of pageDefinitions) {
    await page.goto(route.path); await expect(page.locator('main h1')).toBeVisible(); await expect(page).toHaveTitle(`${route.title} | Consultix Technologies`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://consultixtech.com${route.path}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
    expect(await page.locator('.brand img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();
  }
  expect(errors).toEqual([]);
});
test('AI conversation, safe text rendering, handoff, clear and error recovery', async ({ page }) => {
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ reply: 'We can explore your requirement. <script>alert(1)</script>', handoff: true, sources: [{ title: 'AI & Intelligent Automation', url: '/services/ai-intelligent-automation' }] }) }));
  await page.goto('/'); await page.getByRole('button', { name: 'Chat with Consultix AI Assistant', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible(); await page.getByRole('button', { name: 'Explore AI Solutions', exact: true }).click();
  await expect(page.locator('.chat-message.assistant')).toContainText('<script>alert(1)</script>'); expect(await page.locator('.chat-message script').count()).toBe(0);
  await expect(page.getByRole('link', { name: 'Continue on WhatsApp' })).toHaveAttribute('href', /https:\/\/wa.me\/918447844097\?text=/);
  await page.getByRole('button', { name: 'Clear conversation' }).click(); await expect(page.locator('.chat-message')).toHaveCount(0);
  await page.route('**/api/chat', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'The assistant is temporarily unavailable.' }) }));
  await page.getByRole('button', { name: 'ITSM Solutions', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('temporarily unavailable');
  await page.getByRole('button', { name: 'Clear conversation' }).click(); await expect(page.getByLabel('Your question about Consultix')).toBeEnabled();
  await page.getByRole('button', { name: 'Minimize assistant' }).click(); await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('solution filters and contact fallback are usable', async ({ page }) => {
  await page.goto('/solutions'); await page.getByRole('button', { name: 'Data & Insights', exact: true }).click(); await expect(page.locator('.solution-card')).toHaveCount(1);
  await page.route('**/api/contact', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Your enquiry has not been sent.', fallback: true }) }));
  await page.goto('/contact'); await page.getByLabel('Full Name').fill('Test User'); await page.getByLabel('Business Email').fill('test@example.com'); await page.getByLabel('Company', { exact: false }).fill('Test Company'); await page.getByLabel('Service / Solution').selectOption({ label: 'AI & Intelligent Automation' }); await page.getByLabel('Project Requirements').fill('We need a company knowledge assistant.'); await page.locator('input[name="consent"]').check(); await page.getByRole('button', { name: 'Send Project Enquiry' }).click(); await expect(page.getByRole('alert')).toContainText('not been sent'); await expect(page.getByRole('link', { name: 'Continue on WhatsApp' })).toBeVisible();
});
test('404 and mobile navigation', async ({ page }, testInfo) => { await page.goto('/missing-page'); await expect(page.locator('main h1')).toContainText('back on track'); if (testInfo.project.name === 'mobile') { await page.getByRole('button', { name: 'Open navigation' }).click(); await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Services', exact: true }).click(); await expect(page).toHaveURL(/\/services$/); } });
