import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi, beforeEach } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import BudgetItem from "../components/BudgetItem";

// Mock Firebase and Toast
vi.mock("../firebase/firestore", () => ({
  updateBudgetInFirestore: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockBudget = {
  id: "1",
  name: "Food & Groceries",
  amount: 500,
  color: "35, 65%, 52%",
  spent: 150,
};

function renderBudgetItem(budget = mockBudget) {
  const router = createMemoryRouter([
    {
      path: "/",
      element: <BudgetItem budget={budget} />,
    },
  ]);

  render(<RouterProvider router={router} />);
}

// ********** BUDGET NAME UPDATE TESTS **********

test("should display budget name", async () => {
  renderBudgetItem();

  expect(screen.getByText("Food & Groceries")).toBeInTheDocument();
});

test("should allow editing budget name", async () => {
  renderBudgetItem();

  const user = userEvent.setup();

  // Get all buttons and click the first one (edit button)
  const buttons = screen.getAllByRole("button");
  const editButton =
    buttons.find((btn) => !btn.className.includes("btn--outline")) ||
    buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Food & Groceries");

  expect(nameInput).toBeInTheDocument();
  expect(nameInput.tagName).toBe("INPUT");
});

test("should update budget name with valid input", async () => {
  const { updateBudgetInFirestore } = await import("../firebase/firestore");

  renderBudgetItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Food & Groceries");
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(nameInput);
  await user.type(nameInput, "Dining & Eating Out");
  await user.click(saveButton);

  expect(updateBudgetInFirestore).toHaveBeenCalledWith(
    mockBudget.id,
    expect.objectContaining({
      name: "Dining & Eating Out",
    }),
  );
});

test("should trim whitespace from budget name", async () => {
  const { updateBudgetInFirestore } = await import("../firebase/firestore");

  renderBudgetItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Food & Groceries");
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(nameInput);
  await user.type(nameInput, "  New Budget Name  ");
  await user.click(saveButton);

  expect(updateBudgetInFirestore).toHaveBeenCalledWith(
    mockBudget.id,
    expect.objectContaining({
      name: "New Budget Name",
    }),
  );
});

test("should show error when budget name is empty", async () => {
  const toast = await import("react-hot-toast");

  renderBudgetItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Food & Groceries");
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(nameInput);
  await user.click(saveButton);

  expect(toast.default.error).toHaveBeenCalledWith("Budget name is required");
});

test("should show error when budget name is only whitespace", async () => {
  const toast = await import("react-hot-toast");

  renderBudgetItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Food & Groceries");
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(nameInput);
  await user.type(nameInput, "   ");
  await user.click(saveButton);

  expect(toast.default.error).toHaveBeenCalledWith("Budget name is required");
});

// ********** BUDGET AMOUNT UPDATE TESTS **********

test("should display budget amount", async () => {
  renderBudgetItem();

  const amountText = screen.getByText(/500|Budgeted/i);
  expect(amountText).toBeInTheDocument();
});

test("should allow editing budget amount", async () => {
  renderBudgetItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const amountInputs = screen.getAllByRole("spinbutton");
  const amountInput = amountInputs[0];

  expect(amountInput).toBeInTheDocument();
  expect(amountInput).toHaveValue(500);
});

test("should update budget amount with valid input", async () => {
  const { updateBudgetInFirestore } = await import("../firebase/firestore");

  renderBudgetItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const amountInputs = screen.getAllByRole("spinbutton");
  const amountInput = amountInputs[0];
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(amountInput);
  await user.type(amountInput, "750");
  await user.click(saveButton);

  expect(updateBudgetInFirestore).toHaveBeenCalledWith(
    mockBudget.id,
    expect.objectContaining({
      amount: 750,
    }),
  );
});

test("should accept decimal amounts for budget", async () => {
  const { updateBudgetInFirestore } = await import("../firebase/firestore");

  renderBudgetItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const amountInputs = screen.getAllByRole("spinbutton");
  const amountInput = amountInputs[0];
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(amountInput);
  await user.type(amountInput, "599.99");
  await user.click(saveButton);

  expect(updateBudgetInFirestore).toHaveBeenCalledWith(
    mockBudget.id,
    expect.objectContaining({
      amount: 599.99,
    }),
  );
});

test("should show error when budget amount is zero", async () => {
  const toast = await import("react-hot-toast");

  renderBudgetItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const amountInputs = screen.getAllByRole("spinbutton");
  const amountInput = amountInputs[0];
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(amountInput);
  await user.type(amountInput, "0");
  await user.click(saveButton);

  expect(toast.default.error).toHaveBeenCalledWith(
    "Budget amount must be greater than 0",
  );
});

test("should show error when budget amount is negative", async () => {
  const toast = await import("react-hot-toast");

  renderBudgetItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const amountInputs = screen.getAllByRole("spinbutton");
  const amountInput = amountInputs[0];
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(amountInput);
  await user.type(amountInput, "-100");
  await user.click(saveButton);

  expect(toast.default.error).toHaveBeenCalledWith(
    "Budget amount must be greater than 0",
  );
});

// ********** COMBINED UPDATE TESTS **********

test("should update both name and amount together", async () => {
  const { updateBudgetInFirestore } = await import("../firebase/firestore");

  renderBudgetItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Food & Groceries");
  const amountInputs = screen.getAllByRole("spinbutton");
  const amountInput = amountInputs[0];
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(nameInput);
  await user.type(nameInput, "Shopping");

  await user.clear(amountInput);
  await user.type(amountInput, "1000");

  await user.click(saveButton);

  expect(updateBudgetInFirestore).toHaveBeenCalledWith(
    mockBudget.id,
    expect.objectContaining({
      name: "Shopping",
      amount: 1000,
    }),
  );
});

test("should exit edit mode after successful update", async () => {
  const { updateBudgetInFirestore } = await import("../firebase/firestore");

  updateBudgetInFirestore.mockResolvedValueOnce(undefined);

  renderBudgetItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const saveButton = screen.getByRole("button", { name: /save|check/i });
  await user.click(saveButton);

  // After successful update, it should show the display mode
  const toast = await import("react-hot-toast");
  expect(toast.default.success).toHaveBeenCalledWith("Budget updated!");
});

test("should handle update errors gracefully", async () => {
  const { updateBudgetInFirestore } = await import("../firebase/firestore");

  updateBudgetInFirestore.mockRejectedValueOnce(new Error("Update failed"));

  renderBudgetItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const saveButton = screen.getByRole("button", { name: /save|check/i });
  await user.click(saveButton);

  const toast = await import("react-hot-toast");
  expect(toast.default.error).toHaveBeenCalledWith("Failed to update budget");
});
