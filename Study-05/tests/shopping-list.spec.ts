import { test, expect } from '@playwright/test';

test.describe('쇼핑 리스트 앱', () => {

  test.beforeEach(async ({ page }) => {
    // localStorage 초기화 후 페이지 로드
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('쇼핑 리스트');
    await expect(page.locator('#item-input')).toBeVisible();
    await expect(page.locator('#add-form button')).toBeVisible();
  });

  test('아이템을 추가할 수 있다', async ({ page }) => {
    await page.fill('#item-input', '우유');
    await page.click('#add-form button');

    const items = page.locator('.list-item');
    await expect(items).toHaveCount(1);
    await expect(items.first().locator('.item-text')).toHaveText('우유');
  });

  test('Enter 키로 아이템을 추가할 수 있다', async ({ page }) => {
    await page.fill('#item-input', '계란');
    await page.press('#item-input', 'Enter');

    await expect(page.locator('.list-item')).toHaveCount(1);
    await expect(page.locator('.item-text').first()).toHaveText('계란');
  });

  test('여러 아이템을 추가할 수 있다', async ({ page }) => {
    const items = ['사과', '바나나', '딸기'];

    for (const item of items) {
      await page.fill('#item-input', item);
      await page.press('#item-input', 'Enter');
    }

    await expect(page.locator('.list-item')).toHaveCount(3);
    await expect(page.locator('.item-text').nth(0)).toHaveText('사과');
    await expect(page.locator('.item-text').nth(1)).toHaveText('바나나');
    await expect(page.locator('.item-text').nth(2)).toHaveText('딸기');
  });

  test('빈 입력은 추가되지 않는다', async ({ page }) => {
    await page.fill('#item-input', '');
    await page.press('#item-input', 'Enter');

    await expect(page.locator('.list-item')).toHaveCount(0);
  });

  test('공백만 입력하면 추가되지 않는다', async ({ page }) => {
    await page.fill('#item-input', '   ');
    await page.press('#item-input', 'Enter');

    await expect(page.locator('.list-item')).toHaveCount(0);
  });

  test('아이템을 체크할 수 있다', async ({ page }) => {
    await page.fill('#item-input', '우유');
    await page.press('#item-input', 'Enter');

    const checkbox = page.locator('.list-item input[type="checkbox"]').first();
    await checkbox.check();

    await expect(page.locator('.list-item').first()).toHaveClass(/checked/);
    await expect(checkbox).toBeChecked();
  });

  test('체크한 아이템을 다시 해제할 수 있다', async ({ page }) => {
    await page.fill('#item-input', '우유');
    await page.press('#item-input', 'Enter');

    const checkbox = page.locator('.list-item input[type="checkbox"]').first();
    await checkbox.check();
    await expect(page.locator('.list-item').first()).toHaveClass(/checked/);

    await checkbox.uncheck();
    await expect(page.locator('.list-item').first()).not.toHaveClass(/checked/);
    await expect(checkbox).not.toBeChecked();
  });

  test('아이템을 삭제할 수 있다', async ({ page }) => {
    await page.fill('#item-input', '우유');
    await page.press('#item-input', 'Enter');

    await expect(page.locator('.list-item')).toHaveCount(1);

    await page.click('.delete-btn');

    await expect(page.locator('.list-item')).toHaveCount(0);
  });

  test('여러 아이템 중 특정 아이템만 삭제할 수 있다', async ({ page }) => {
    for (const item of ['사과', '바나나', '딸기']) {
      await page.fill('#item-input', item);
      await page.press('#item-input', 'Enter');
    }

    // 바나나(두 번째) 삭제
    await page.locator('.delete-btn').nth(1).click();

    await expect(page.locator('.list-item')).toHaveCount(2);
    await expect(page.locator('.item-text').nth(0)).toHaveText('사과');
    await expect(page.locator('.item-text').nth(1)).toHaveText('딸기');
  });

  test('요약 정보가 올바르게 표시된다', async ({ page }) => {
    // 아이템이 없으면 요약이 숨겨져야 함
    await expect(page.locator('#summary')).toHaveClass(/hidden/);

    // 아이템 추가 후 요약 표시
    await page.fill('#item-input', '우유');
    await page.press('#item-input', 'Enter');
    await page.fill('#item-input', '빵');
    await page.press('#item-input', 'Enter');

    await expect(page.locator('#summary')).not.toHaveClass(/hidden/);
    await expect(page.locator('#summary-text')).toHaveText('총 2개 중 0개 완료');

    // 하나 체크
    await page.locator('.list-item input[type="checkbox"]').first().check();
    await expect(page.locator('#summary-text')).toHaveText('총 2개 중 1개 완료');
  });

  test('체크된 항목을 일괄 삭제할 수 있다', async ({ page }) => {
    for (const item of ['사과', '바나나', '딸기']) {
      await page.fill('#item-input', item);
      await page.press('#item-input', 'Enter');
    }

    // 사과, 딸기 체크
    await page.locator('.list-item input[type="checkbox"]').nth(0).check();
    await page.locator('.list-item input[type="checkbox"]').nth(2).check();

    // 체크 항목 삭제
    await page.click('#clear-checked');

    await expect(page.locator('.list-item')).toHaveCount(1);
    await expect(page.locator('.item-text').first()).toHaveText('바나나');
  });

  test('데이터가 localStorage에 저장되어 새로고침 후에도 유지된다', async ({ page }) => {
    await page.fill('#item-input', '우유');
    await page.press('#item-input', 'Enter');
    await page.fill('#item-input', '빵');
    await page.press('#item-input', 'Enter');

    // 첫 번째 아이템 체크
    await page.locator('.list-item input[type="checkbox"]').first().check();

    // 새로고침
    await page.reload();

    // 데이터 유지 확인
    await expect(page.locator('.list-item')).toHaveCount(2);
    await expect(page.locator('.item-text').nth(0)).toHaveText('우유');
    await expect(page.locator('.item-text').nth(1)).toHaveText('빵');
    await expect(page.locator('.list-item input[type="checkbox"]').first()).toBeChecked();
    await expect(page.locator('.list-item input[type="checkbox"]').nth(1)).not.toBeChecked();
  });

  test('추가 후 입력 필드가 비워진다', async ({ page }) => {
    await page.fill('#item-input', '우유');
    await page.press('#item-input', 'Enter');

    await expect(page.locator('#item-input')).toHaveValue('');
  });
});
