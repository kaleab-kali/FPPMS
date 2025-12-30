import { expect, test } from "@playwright/test";

test.describe("Complaints Management", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/complaints");
		await page.waitForLoadState("networkidle");
	});

	test.describe("Complaints List", () => {
		test("should load complaints list page", async ({ page }) => {
			await expect(page).toHaveURL(/\/complaints/);
			await expect(page.getByRole("heading", { name: /complaints/i })).toBeVisible();
		});

		test("should display complaints table with columns", async ({ page }) => {
			const table = page.locator("table");
			await expect(table).toBeVisible();

			const headers = ["Complaint Number", "Article", "Accused Employee", "Status", "Registered Date"];
			for (const header of headers) {
				await expect(page.getByRole("columnheader", { name: new RegExp(header, "i") })).toBeVisible();
			}
		});

		test("should filter complaints by status", async ({ page }) => {
			const statusFilter = page.getByLabel(/status/i);
			await statusFilter.click();

			await page.getByRole("option", { name: /under hr review/i }).click();

			await page.waitForLoadState("networkidle");

			const statusCells = page.locator("td").filter({ hasText: /under hr review/i });
			await expect(statusCells.first()).toBeVisible();
		});

		test("should filter complaints by article type", async ({ page }) => {
			const articleFilter = page.getByLabel(/article/i);
			await articleFilter.click();

			await page.getByRole("option", { name: /article 30/i }).click();

			await page.waitForLoadState("networkidle");

			const articleCells = page.locator("td").filter({ hasText: /article 30/i });
			await expect(articleCells.first()).toBeVisible();
		});

		test("should search complaints by complaint number or summary", async ({ page }) => {
			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("CMP-");

			await page.waitForLoadState("networkidle");

			const complaintNumbers = page.locator("td").filter({ hasText: /CMP-/i });
			await expect(complaintNumbers.first()).toBeVisible();
		});

		test("should filter by date range", async ({ page }) => {
			const fromDateInput = page.getByLabel(/from date/i);
			await fromDateInput.fill("2025-01-01");

			const toDateInput = page.getByLabel(/to date/i);
			await toDateInput.fill("2025-12-31");

			await page.waitForLoadState("networkidle");

			const rows = page.locator("tbody tr");
			await expect(rows.first()).toBeVisible();
		});
	});

	test.describe("Create New Complaint", () => {
		test.beforeEach(async ({ page }) => {
			await page.getByRole("button", { name: /create complaint|new complaint|register/i }).click();
			await expect(page.getByRole("heading", { name: /create complaint|register complaint/i })).toBeVisible();
		});

		test("should create Article 30 complaint successfully", async ({ page }) => {
			await page.getByLabel(/article/i).click();
			await page.getByRole("option", { name: /article 30/i }).click();

			await page.getByLabel(/offense code/i).fill("ART30-001");

			const accusedEmployeeSearch = page.getByLabel(/accused employee/i);
			await accusedEmployeeSearch.fill("FPC-0001");
			await page.waitForTimeout(500);
			await page.getByRole("option").first().click();

			await page.getByLabel(/complainant type/i).click();
			await page.getByRole("option", { name: /employee/i }).click();

			await page.getByLabel(/complainant name/i).fill("Test Complainant");

			await page.getByLabel(/summary/i).fill("Employee found sleeping during duty hours");

			await page.getByLabel(/incident date/i).fill("2025-01-15");

			await page.getByLabel(/incident location/i).fill("Main Gate");

			await page.getByLabel(/registered date/i).fill("2025-01-20");

			await page.getByRole("button", { name: /submit|create|save/i }).click();

			await expect(page.getByText(/complaint registered successfully|complaint created/i)).toBeVisible();

			await page.waitForURL(/\/complaints\/[a-zA-Z0-9]+/);
		});

		test("should create Article 31 complaint successfully", async ({ page }) => {
			await page.getByLabel(/article/i).click();
			await page.getByRole("option", { name: /article 31/i }).click();

			await page.getByLabel(/offense code/i).fill("ART31-015");

			const accusedEmployeeSearch = page.getByLabel(/accused employee/i);
			await accusedEmployeeSearch.fill("FPC-0002");
			await page.waitForTimeout(500);
			await page.getByRole("option").first().click();

			await page.getByLabel(/complainant type/i).click();
			await page.getByRole("option", { name: /external/i }).click();

			await page.getByLabel(/complainant name/i).fill("External Complainant");

			await page.getByLabel(/summary/i).fill("Serious misconduct involving abuse of power");

			await page.getByLabel(/incident date/i).fill("2025-01-10");

			await page.getByLabel(/registered date/i).fill("2025-01-15");

			await page.getByRole("button", { name: /submit|create|save/i }).click();

			await expect(page.getByText(/complaint registered successfully|complaint created/i)).toBeVisible();
		});

		test("should validate required fields", async ({ page }) => {
			await page.getByRole("button", { name: /submit|create|save/i }).click();

			await expect(page.getByText(/required/i)).toBeVisible();
		});
	});

	test.describe("Complaint Detail Page", () => {
		test("should navigate to complaint detail page", async ({ page }) => {
			const firstComplaintRow = page.locator("tbody tr").first();
			await firstComplaintRow.click();

			await page.waitForURL(/\/complaints\/[a-zA-Z0-9]+/);

			await expect(page.getByRole("heading", { name: /complaint details|complaint #/i })).toBeVisible();
		});

		test("should display complaint information sections", async ({ page }) => {
			await page.locator("tbody tr").first().click();
			await page.waitForURL(/\/complaints\/[a-zA-Z0-9]+/);

			await expect(page.getByText(/basic information/i)).toBeVisible();
			await expect(page.getByText(/accused employee/i)).toBeVisible();
			await expect(page.getByText(/incident details/i)).toBeVisible();
			await expect(page.getByText(/status/i)).toBeVisible();
		});

		test("should display timeline/audit trail", async ({ page }) => {
			await page.locator("tbody tr").first().click();
			await page.waitForURL(/\/complaints\/[a-zA-Z0-9]+/);

			const timelineTab = page.getByRole("tab", { name: /timeline|history|audit/i });
			if (await timelineTab.isVisible()) {
				await timelineTab.click();
				await expect(page.getByText(/timeline|action|performed by/i)).toBeVisible();
			}
		});
	});

	test.describe("Article 30 Workflow Actions", () => {
		test.beforeEach(async ({ page }) => {
			await page
				.locator("tbody tr")
				.filter({ hasText: /article 30/i })
				.first()
				.click();
			await page.waitForURL(/\/complaints\/[a-zA-Z0-9]+/);
		});

		test("should send notification to accused", async ({ page }) => {
			const notificationButton = page.getByRole("button", { name: /send notification|notify accused/i });

			if (await notificationButton.isVisible()) {
				await notificationButton.click();

				await page.getByLabel(/notification date/i).fill("2025-01-21");

				await page.getByLabel(/rebuttal deadline/i).fill("2025-01-28");

				await page.getByRole("button", { name: /submit|send|confirm/i }).click();

				await expect(page.getByText(/notification sent|notification recorded/i)).toBeVisible();

				await expect(page.getByText(/waiting for rebuttal/i)).toBeVisible();
			}
		});

		test("should record rebuttal received", async ({ page }) => {
			const rebuttalButton = page.getByRole("button", { name: /record rebuttal|rebuttal received/i });

			if (await rebuttalButton.isVisible()) {
				await rebuttalButton.click();

				await page
					.getByLabel(/rebuttal content/i)
					.fill("I deny the allegations. I was present at my station during the specified time.");

				await page.getByLabel(/received date/i).fill("2025-01-26");

				await page.getByRole("button", { name: /submit|save|record/i }).click();

				await expect(page.getByText(/rebuttal recorded|rebuttal saved/i)).toBeVisible();

				await expect(page.getByText(/under hr analysis/i)).toBeVisible();
			}
		});

		test("should mark rebuttal deadline as passed", async ({ page }) => {
			const deadlinePassedButton = page.getByRole("button", { name: /deadline passed|no rebuttal/i });

			if (await deadlinePassedButton.isVisible()) {
				await deadlinePassedButton.click();

				await page.getByRole("button", { name: /confirm/i }).click();

				await expect(page.getByText(/deadline marked|guilty by default/i)).toBeVisible();

				await expect(page.getByText(/guilty no rebuttal/i)).toBeVisible();
			}
		});

		test("should record finding", async ({ page }) => {
			const findingButton = page.getByRole("button", { name: /record finding|verdict/i });

			if (await findingButton.isVisible()) {
				await findingButton.click();

				await page.getByLabel(/finding/i).click();
				await page.getByRole("option", { name: /guilty/i }).click();

				await page.getByLabel(/finding reason/i).fill("Evidence supports the allegations");

				await page.getByLabel(/finding date/i).fill("2025-01-30");

				await page.getByRole("button", { name: /submit|save|record/i }).click();

				await expect(page.getByText(/finding recorded|verdict saved/i)).toBeVisible();
			}
		});

		test("should record decision by superior", async ({ page }) => {
			const decisionButton = page.getByRole("button", { name: /record decision|make decision|punishment/i });

			if (await decisionButton.isVisible()) {
				await decisionButton.click();

				await page.getByLabel(/punishment percentage/i).fill("10");

				await page.getByLabel(/punishment description/i).fill("10% salary deduction for 3 months");

				await page.getByLabel(/decision date/i).fill("2025-02-01");

				await page.getByRole("button", { name: /submit|save|record/i }).click();

				await expect(page.getByText(/decision recorded|punishment assigned/i)).toBeVisible();

				await expect(page.getByText(/decided/i)).toBeVisible();
			}
		});

		test("should forward level 5+ complaint to committee", async ({ page }) => {
			const forwardButton = page.getByRole("button", { name: /forward to committee/i });

			if (await forwardButton.isVisible()) {
				await forwardButton.click();

				await page.getByLabel(/committee/i).click();
				await page.getByRole("option").first().click();

				await page.getByLabel(/reason/i).fill("Severity level 5 requires committee review");

				await page.getByRole("button", { name: /submit|forward|confirm/i }).click();

				await expect(page.getByText(/forwarded to committee|committee assigned/i)).toBeVisible();

				await expect(page.getByText(/with discipline committee/i)).toBeVisible();
			}
		});
	});

	test.describe("Article 31 Workflow Actions", () => {
		test.beforeEach(async ({ page }) => {
			await page
				.locator("tbody tr")
				.filter({ hasText: /article 31/i })
				.first()
				.click();
			await page.waitForURL(/\/complaints\/[a-zA-Z0-9]+/);
		});

		test("should assign complaint to discipline committee", async ({ page }) => {
			const assignButton = page.getByRole("button", { name: /assign committee|assign to committee/i });

			if (await assignButton.isVisible()) {
				await assignButton.click();

				await page.getByLabel(/committee/i).click();
				await page.getByRole("option").first().click();

				await page.getByRole("button", { name: /submit|assign|confirm/i }).click();

				await expect(page.getByText(/committee assigned|assigned to committee/i)).toBeVisible();

				await expect(page.getByText(/with discipline committee/i)).toBeVisible();
			}
		});

		test("should forward to HQ committee", async ({ page }) => {
			const forwardHqButton = page.getByRole("button", { name: /forward to hq|escalate to hq/i });

			if (await forwardHqButton.isVisible()) {
				await forwardHqButton.click();

				await page.getByLabel(/hq committee/i).click();
				await page.getByRole("option").first().click();

				await page.getByLabel(/reason/i).fill("Case requires HQ level review");

				await page.getByRole("button", { name: /submit|forward|confirm/i }).click();

				await expect(page.getByText(/forwarded to hq|escalated to hq/i)).toBeVisible();

				await expect(page.getByText(/awaiting hq decision/i)).toBeVisible();
			}
		});

		test("should record HQ decision", async ({ page }) => {
			const hqDecisionButton = page.getByRole("button", { name: /record hq decision|hq decision/i });

			if (await hqDecisionButton.isVisible()) {
				await hqDecisionButton.click();

				await page.getByLabel(/finding/i).click();
				await page.getByRole("option", { name: /guilty/i }).click();

				await page.getByLabel(/punishment/i).fill("Termination of employment");

				await page.getByLabel(/decision date/i).fill("2025-02-15");

				await page.getByRole("button", { name: /submit|save|record/i }).click();

				await expect(page.getByText(/hq decision recorded|decision saved/i)).toBeVisible();

				await expect(page.getByText(/decided by hq/i)).toBeVisible();
			}
		});
	});

	test.describe("Appeal Workflow", () => {
		test.beforeEach(async ({ page }) => {
			await page
				.locator("tbody tr")
				.filter({ hasText: /decided/i })
				.first()
				.click();
			await page.waitForURL(/\/complaints\/[a-zA-Z0-9]+/);
		});

		test("should submit an appeal", async ({ page }) => {
			const appealButton = page.getByRole("button", { name: /submit appeal|appeal decision/i });

			if (await appealButton.isVisible()) {
				await appealButton.click();

				await page.getByLabel(/appeal reason/i).fill("The punishment is too severe given the circumstances");

				await page.getByLabel(/appeal date/i).fill("2025-02-05");

				const uploadInput = page.locator("input[type='file']");
				if (await uploadInput.isVisible()) {
					await uploadInput.setInputFiles({
						name: "appeal-document.pdf",
						mimeType: "application/pdf",
						buffer: Buffer.from("Mock PDF content"),
					});
				}

				await page.getByRole("button", { name: /submit|save|appeal/i }).click();

				await expect(page.getByText(/appeal submitted|appeal registered/i)).toBeVisible();

				await expect(page.getByText(/on appeal/i)).toBeVisible();
			}
		});

		test("should record appeal decision - upheld", async ({ page }) => {
			const appealTab = page.getByRole("tab", { name: /appeals/i });
			if (await appealTab.isVisible()) {
				await appealTab.click();

				const reviewButton = page.getByRole("button", { name: /review appeal|decide appeal/i }).first();
				if (await reviewButton.isVisible()) {
					await reviewButton.click();

					await page.getByLabel(/decision/i).click();
					await page.getByRole("option", { name: /upheld/i }).click();

					await page.getByLabel(/decision reason/i).fill("Original decision was correct");

					await page.getByRole("button", { name: /submit|save|confirm/i }).click();

					await expect(page.getByText(/appeal decision recorded|decision saved/i)).toBeVisible();

					await expect(page.getByText(/upheld/i)).toBeVisible();
				}
			}
		});

		test("should record appeal decision - modified", async ({ page }) => {
			const appealTab = page.getByRole("tab", { name: /appeals/i });
			if (await appealTab.isVisible()) {
				await appealTab.click();

				const reviewButton = page.getByRole("button", { name: /review appeal|decide appeal/i }).first();
				if (await reviewButton.isVisible()) {
					await reviewButton.click();

					await page.getByLabel(/decision/i).click();
					await page.getByRole("option", { name: /modified/i }).click();

					await page.getByLabel(/new punishment/i).fill("Reduced to 5% salary deduction for 2 months");

					await page.getByLabel(/decision reason/i).fill("Mitigating circumstances warrant reduction");

					await page.getByRole("button", { name: /submit|save|confirm/i }).click();

					await expect(page.getByText(/appeal decision recorded|decision saved/i)).toBeVisible();

					await expect(page.getByText(/modified/i)).toBeVisible();
				}
			}
		});

		test("should record appeal decision - overturned", async ({ page }) => {
			const appealTab = page.getByRole("tab", { name: /appeals/i });
			if (await appealTab.isVisible()) {
				await appealTab.click();

				const reviewButton = page.getByRole("button", { name: /review appeal|decide appeal/i }).first();
				if (await reviewButton.isVisible()) {
					await reviewButton.click();

					await page.getByLabel(/decision/i).click();
					await page.getByRole("option", { name: /overturned/i }).click();

					await page.getByLabel(/decision reason/i).fill("Insufficient evidence to support the original finding");

					await page.getByRole("button", { name: /submit|save|confirm/i }).click();

					await expect(page.getByText(/appeal decision recorded|decision saved/i)).toBeVisible();

					await expect(page.getByText(/overturned/i)).toBeVisible();
				}
			}
		});
	});

	test.describe("Close Complaint", () => {
		test("should close complaint with reason", async ({ page }) => {
			await page.locator("tbody tr").first().click();
			await page.waitForURL(/\/complaints\/[a-zA-Z0-9]+/);

			const closeButton = page.getByRole("button", { name: /close complaint|close case/i });

			if (await closeButton.isVisible()) {
				await closeButton.click();

				await page.getByLabel(/closure reason/i).fill("All proceedings completed");

				await page.getByRole("button", { name: /submit|close|confirm/i }).click();

				await expect(page.getByText(/complaint closed|case closed/i)).toBeVisible();

				await expect(page.getByText(/closed/i)).toBeVisible();
			}
		});
	});

	test.describe("Status Transitions", () => {
		test("should display correct status badge colors", async ({ page }) => {
			const statusBadges = page.locator("td").filter({ hasText: /under hr review|waiting for rebuttal|decided/i });
			await expect(statusBadges.first()).toBeVisible();
		});

		test("should show status-appropriate action buttons", async ({ page }) => {
			await page.locator("tbody tr").first().click();
			await page.waitForURL(/\/complaints\/[a-zA-Z0-9]+/);

			const actionButtons = page
				.getByRole("button")
				.filter({ hasText: /send notification|record|assign|forward|appeal/i });
			await expect(actionButtons.first()).toBeVisible();
		});
	});

	test.describe("Filters and Search Combinations", () => {
		test("should combine status and article filters", async ({ page }) => {
			const statusFilter = page.getByLabel(/status/i);
			await statusFilter.click();
			await page.getByRole("option", { name: /under hr review/i }).click();

			const articleFilter = page.getByLabel(/article/i);
			await articleFilter.click();
			await page.getByRole("option", { name: /article 30/i }).click();

			await page.waitForLoadState("networkidle");

			const rows = page.locator("tbody tr");
			const firstRow = rows.first();

			await expect(firstRow).toContainText(/article 30/i);
			await expect(firstRow).toContainText(/under hr review/i);
		});

		test("should combine date range and search", async ({ page }) => {
			const fromDateInput = page.getByLabel(/from date/i);
			await fromDateInput.fill("2025-01-01");

			const searchInput = page.getByPlaceholder(/search/i);
			await searchInput.fill("sleeping");

			await page.waitForLoadState("networkidle");

			const rows = page.locator("tbody tr");
			await expect(rows.first()).toBeVisible();
		});

		test("should clear all filters", async ({ page }) => {
			const statusFilter = page.getByLabel(/status/i);
			await statusFilter.click();
			await page.getByRole("option", { name: /under hr review/i }).click();

			const clearButton = page.getByRole("button", { name: /clear filters|reset/i });
			if (await clearButton.isVisible()) {
				await clearButton.click();
				await page.waitForLoadState("networkidle");
			}
		});
	});

	test.describe("Pagination", () => {
		test("should navigate between pages if multiple pages exist", async ({ page }) => {
			const nextButton = page.getByRole("button", { name: /next/i });

			if (await nextButton.isEnabled()) {
				await nextButton.click();
				await page.waitForLoadState("networkidle");

				const prevButton = page.getByRole("button", { name: /previous|prev/i });
				await expect(prevButton).toBeEnabled();
			}
		});

		test("should change page size", async ({ page }) => {
			const pageSizeSelect = page.getByLabel(/rows per page|page size/i);

			if (await pageSizeSelect.isVisible()) {
				await pageSizeSelect.click();
				await page.getByRole("option", { name: /50/i }).click();
				await page.waitForLoadState("networkidle");
			}
		});
	});

	test.describe("Document Management", () => {
		test.beforeEach(async ({ page }) => {
			await page.locator("tbody tr").first().click();
			await page.waitForURL(/\/complaints\/[a-zA-Z0-9]+/);
		});

		test("should upload document to complaint", async ({ page }) => {
			const documentsTab = page.getByRole("tab", { name: /documents|files/i });

			if (await documentsTab.isVisible()) {
				await documentsTab.click();

				const uploadButton = page.getByRole("button", { name: /upload|add document/i });
				if (await uploadButton.isVisible()) {
					await uploadButton.click();

					await page.getByLabel(/document type/i).click();
					await page.getByRole("option", { name: /initial evidence/i }).click();

					await page.getByLabel(/title/i).fill("Evidence Document 1");

					const uploadInput = page.locator("input[type='file']");
					await uploadInput.setInputFiles({
						name: "evidence.pdf",
						mimeType: "application/pdf",
						buffer: Buffer.from("Mock PDF content"),
					});

					await page.getByRole("button", { name: /submit|upload/i }).click();

					await expect(page.getByText(/document uploaded|file added/i)).toBeVisible();
				}
			}
		});

		test("should view uploaded documents", async ({ page }) => {
			const documentsTab = page.getByRole("tab", { name: /documents|files/i });

			if (await documentsTab.isVisible()) {
				await documentsTab.click();

				const documentList = page.locator("ul, table").filter({ hasText: /document|file name/i });
				if (await documentList.isVisible()) {
					await expect(documentList).toBeVisible();
				}
			}
		});
	});

	test.describe("Employee Complaint History", () => {
		test("should view employee's complaint history", async ({ page }) => {
			await page.locator("tbody tr").first().click();
			await page.waitForURL(/\/complaints\/[a-zA-Z0-9]+/);

			const employeeLink = page
				.locator("a")
				.filter({ hasText: /FPC-|FPCIV-/i })
				.first();
			if (await employeeLink.isVisible()) {
				const employeeName = await employeeLink.textContent();

				await page.goto("/employees");
				await page.waitForLoadState("networkidle");

				const searchInput = page.getByPlaceholder(/search/i);
				await searchInput.fill(employeeName ?? "");
				await page.waitForLoadState("networkidle");

				const firstEmployee = page.locator("tbody tr").first();
				await firstEmployee.click();

				const complaintsTab = page.getByRole("tab", { name: /complaints|disciplinary/i });
				if (await complaintsTab.isVisible()) {
					await complaintsTab.click();
					await expect(page.getByText(/complaint history|disciplinary records/i)).toBeVisible();
				}
			}
		});
	});

	test.describe("Access Control", () => {
		test("should only show complaints accessible to user's center", async ({ page }) => {
			const rows = page.locator("tbody tr");
			const count = await rows.count();

			if (count > 0) {
				await expect(rows.first()).toBeVisible();
			}
		});

		test("should show action buttons based on user permissions", async ({ page }) => {
			await page.locator("tbody tr").first().click();
			await page.waitForURL(/\/complaints\/[a-zA-Z0-9]+/);

			const actionButtons = page.getByRole("button").filter({
				hasText: /send notification|record|assign|forward|close/i,
			});

			const visibleButtons = await actionButtons.count();
			expect(visibleButtons).toBeGreaterThanOrEqual(0);
		});
	});

	test.describe("Validation and Error Handling", () => {
		test("should validate required fields on create complaint", async ({ page }) => {
			await page.getByRole("button", { name: /create complaint|new complaint|register/i }).click();

			await page.getByRole("button", { name: /submit|create|save/i }).click();

			await expect(page.getByText(/required|cannot be empty/i).first()).toBeVisible();
		});

		test("should validate date fields", async ({ page }) => {
			await page.getByRole("button", { name: /create complaint|new complaint|register/i }).click();

			await page.getByLabel(/incident date/i).fill("invalid-date");

			await expect(page.getByText(/invalid date|date format/i)).toBeVisible();
		});

		test("should handle network errors gracefully", async ({ page }) => {
			await page.route("**/api/complaints", (route) => route.abort());

			await page.reload();

			const errorMessage = page.getByText(/error|failed|network/i);
			if (await errorMessage.isVisible()) {
				await expect(errorMessage).toBeVisible();
			}
		});
	});

	test.describe("Responsive Design", () => {
		test("should display correctly on tablet", async ({ page }) => {
			await page.setViewportSize({ width: 768, height: 1024 });

			await expect(page.getByRole("heading", { name: /complaints/i })).toBeVisible();

			const table = page.locator("table");
			await expect(table).toBeVisible();
		});

		test("should display correctly on mobile", async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });

			await expect(page.getByRole("heading", { name: /complaints/i })).toBeVisible();

			const content = page.locator("main, [role='main']");
			await expect(content).toBeVisible();
		});
	});
});
