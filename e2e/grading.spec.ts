import { test, expect } from "@playwright/test";
import { loginViaApi } from "./utils/api-auth";

test.describe("Grading System", () => {
  let project: any;
  let teacher: any;
  let student: any;
  let task: any;
  let rubric: any;

  test.beforeEach(async ({ page }) => {
    const request = page.request;
    teacher = await loginViaApi(request, `teacher-${Date.now()}@example.com`, "pass", "Teacher", "ADMIN");
    student = await loginViaApi(request, `student-${Date.now()}@example.com`, "pass", "Student", "TEAM_DEVELOPER");

    // Create Project
    const pRes = await request.post("http://localhost:5000/api/projects", {
      data: { name: "Grading Project", description: "Test", ownerId: teacher.id }
    });
    const pData = await pRes.json();
    project = pData.data;

    // Create Rubric
    const rRes = await request.post("http://localhost:5000/api/rubrics", {
        data: {
            name: "Standard Rubric",
            projectId: project.id,
            criteria: [{ name: "Code Quality", maxScore: 50 }, { name: "Docs", maxScore: 50 }]
        }
    });
    const rData = await rRes.json();
    rubric = rData.data;

    // Assign Student
    await request.post(`http://localhost:5000/api/projects/${project.id}/members`, {
        data: { userId: student.id, role: "TEAM_DEVELOPER" }
    });

    // Create Task & Assign
    const tRes = await request.post("http://localhost:5000/api/tasks", {
        data: { title: "Task to Grade", projectId: project.id, assigneeId: student.id, status: "COMPLETED" }
    });
    const tData = await tRes.json();
    task = tData.data;
  });

  test("Teacher can grade a task and update it", async ({ page }) => {
    // Login Teacher
    await page.goto("/");
    await page.evaluate((u) => localStorage.setItem("user", JSON.stringify(u)), teacher);
    await page.reload();

    // Go to Evaluations (Admin View)
    await page.goto("/evaluations");

    // Find task
    await expect(page.getByText("Task to Grade")).toBeVisible();
    await page.getByText("Ir a Calificar").click();

    // Check if grading page loaded (Evaluation form)
    // Assuming GradingView exists and has inputs
    // We'll trust the navigation.
    // Fill Grade (Assuming input fields for criteria exist)
    // This part depends on GradingView implementation which we haven't seen in detail but know exists.
    // Let's assume standard inputs.

    // Actually, I'll update the grade via API for robustness in this turn, then verify UI reflection.
    // Or try to use UI if simple.
    // Let's verify the API endpoint we just made first.

    const evalRes = await page.request.post("http://localhost:5000/api/evaluations", {
        data: {
            projectId: project.id,
            taskId: task.id,
            evaluatorId: teacher.id,
            score: 80,
            feedback: "Good job",
            criteriaScores: [
                { criteriaId: rubric.criteria[0].id, score: 40 },
                { criteriaId: rubric.criteria[1].id, score: 40 }
            ]
        }
    });
    expect(evalRes.status()).toBe(201);
    const evalData = await evalRes.json();
    const evalId = evalData.data.id;

    // Now Update via new PUT endpoint
    const updateRes = await page.request.put(`http://localhost:5000/api/evaluations/${evalId}`, {
        data: {
            score: 90,
            feedback: "Excellent job",
            criteriaScores: [
                { criteriaId: rubric.criteria[0].id, score: 45 },
                { criteriaId: rubric.criteria[1].id, score: 45 }
            ]
        }
    });
    expect(updateRes.status()).toBe(200);
    const updatedData = await updateRes.json();
    expect(updatedData.data.score).toBe(90);
    expect(updatedData.data.feedback).toBe("Excellent job");

    // Login Student to View Grade
    await page.goto("/");
    await page.evaluate((u) => localStorage.setItem("user", JSON.stringify(u)), student);
    await page.reload();

    await page.goto("/evaluations");
    await expect(page.getByText("Excellent job")).toBeVisible();
    await expect(page.getByText("90")).toBeVisible();
  });
});
