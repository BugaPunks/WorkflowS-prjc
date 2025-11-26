import { test, expect } from '@playwright/test';

test.describe('Direct Messages', () => {
  test('should allow direct messaging between teacher and student', async ({ page, request }) => {
    // 1. Setup Users
    const timestamp = Date.now();
    // Create Teacher
    const teacherRes = await request.post('http://localhost:5000/api/auth/register', {
      data: { name: `Teacher Chat ${timestamp}`, email: `teacher_chat_${timestamp}@test.com`, password: 'password123', role: 'ADMIN' }
    });
    const teacher = (await teacherRes.json()).user;

    // Create Student
    const studentRes = await request.post('http://localhost:5000/api/auth/register', {
      data: { name: `Student Chat ${timestamp}`, email: `student_chat_${timestamp}@test.com`, password: 'password123', role: 'STUDENT' }
    });
    const student = (await studentRes.json()).user;

    // 2. Teacher sends message
    // Login Teacher
    await page.goto('/'); // Load context
    await page.evaluate((user) => localStorage.setItem('user', JSON.stringify(user)), teacher);
    await page.goto('/projects');

    // Open Chat Widget
    await page.locator('button:has(svg.lucide-message-circle)').click();

    // Start DM
    await page.click('button[title="Nuevo Chat"]');
    await expect(page.getByText('Nuevo Mensaje')).toBeVisible();

    // Select Student
    // Wait for list
    await expect(page.getByText(student.name)).toBeVisible();
    await page.click(`text=${student.name}`);

    // Verify chat opened
    // Check header has Student Name
    await expect(page.getByRole('heading', { name: student.name })).toBeVisible();

    // Send Message
    await page.fill('input[placeholder="Mensaje..."]', 'Hello Student');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Hello Student').last()).toBeVisible();

    // 3. Student replies
    // Login Student
    await page.evaluate((user) => localStorage.setItem('user', JSON.stringify(user)), student);
    await page.reload();

    // Open chat widget again as it closes on reload
    await page.locator('button:has(svg.lucide-message-circle)').click();

    // Should see chat in list with Teacher Name
    await expect(page.getByText(teacher.name)).toBeVisible();
    await page.click(`text=${teacher.name}`);

    // See message
    await expect(page.getByText('Hello Student').last()).toBeVisible();

    // Reply
    await page.fill('input[placeholder="Mensaje..."]', 'Hello Teacher');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Hello Teacher')).toBeVisible();
  });
});
