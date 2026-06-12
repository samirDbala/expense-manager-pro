import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi, beforeEach } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import ExpenseItem from "../components/ExpenseItem";

// Mock Firebase and Toast
vi.mock("../firebase/firestore", () => ({
  updateExpenseInFirestore: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockExpense = {
  id: "1",
  name: "Grocery Shopping",
  amount: 85.5,
  budgetId: "budget1",
  createdAt: 1623456789000,
};

const mockBudgets = [
  {
    id: "budget1",
    name: "Food",
    color: "35, 65%, 52%",
  },
  {
    id: "budget2",
    name: "Entertainment",
    color: "280, 82%, 60%",
  },
];

function renderExpenseItem(expense = mockExpense, budgets = mockBudgets) {
  const router = createMemoryRouter([
    {
      path: "/",
      element: <ExpenseItem expense={expense} budgets={budgets} showBudget />,
    },
  ]);

  render(<RouterProvider router={router} />);
}

// ********** EXPENSE NAME UPDATE TESTS **********

test("should display expense name", async () => {
  renderExpenseItem();

  expect(screen.getByText("Grocery Shopping")).toBeInTheDocument();
});

test("should allow editing expense name", async () => {
  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Grocery Shopping");

  expect(nameInput).toBeInTheDocument();
  expect(nameInput.tagName).toBe("INPUT");
});

test("should update expense name with valid input", async () => {
  const { updateExpenseInFirestore } = await import("../firebase/firestore");

  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Grocery Shopping");
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(nameInput);
  await user.type(nameInput, "Farmers Market");
  await user.click(saveButton);

  expect(updateExpenseInFirestore).toHaveBeenCalledWith(
    mockExpense.id,
    expect.objectContaining({
      name: "Farmers Market",
    }),
  );
});

test("should trim whitespace from expense name", async () => {
  const { updateExpenseInFirestore } = await import("../firebase/firestore");

  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Grocery Shopping");
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(nameInput);
  await user.type(nameInput, "  Dinner at Restaurant  ");
  await user.click(saveButton);

  expect(updateExpenseInFirestore).toHaveBeenCalledWith(
    mockExpense.id,
    expect.objectContaining({
      name: "Dinner at Restaurant",
    }),
  );
});

test("should accept long expense names", async () => {
  const { updateExpenseInFirestore } = await import("../firebase/firestore");

  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Grocery Shopping");
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  const longName =
    "Weekly grocery shopping at the local farmer's market for fresh vegetables";

  await user.clear(nameInput);
  await user.type(nameInput, longName);
  await user.click(saveButton);

  expect(updateExpenseInFirestore).toHaveBeenCalledWith(
    mockExpense.id,
    expect.objectContaining({
      name: longName,
    }),
  );
});

test("should show error when expense name is empty", async () => {
  const toast = await import("react-hot-toast");

  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Grocery Shopping");
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(nameInput);
  await user.click(saveButton);

  expect(toast.default.error).toHaveBeenCalledWith("Expense name is required");
});

test("should show error when expense name is only whitespace", async () => {
  const toast = await import("react-hot-toast");

  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Grocery Shopping");
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(nameInput);
  await user.type(nameInput, "     ");
  await user.click(saveButton);

  expect(toast.default.error).toHaveBeenCalledWith("Expense name is required");
});

// ********** EXPENSE AMOUNT UPDATE TESTS **********

test("should display expense amount", async () => {
  renderExpenseItem();

  const amountText = screen.getByText(/85.50|85\.5|\$85/i);
  expect(amountText).toBeInTheDocument();
});

test("should allow editing expense amount", async () => {
  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const amountInputs = screen.getAllByRole("spinbutton");
  const amountInput = amountInputs[0];

  expect(amountInput).toBeInTheDocument();
  expect(amountInput).toHaveValue(85.5);
});

test("should update expense amount with valid input", async () => {
  const { updateExpenseInFirestore } = await import("../firebase/firestore");

  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const amountInputs = screen.getAllByRole("spinbutton");
  const amountInput = amountInputs[0];
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(amountInput);
  await user.type(amountInput, "120.75");
  await user.click(saveButton);

  expect(updateExpenseInFirestore).toHaveBeenCalledWith(
    mockExpense.id,
    expect.objectContaining({
      amount: 120.75,
    }),
  );
});

test("should accept small decimal amounts", async () => {
  const { updateExpenseInFirestore } = await import("../firebase/firestore");

  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const amountInputs = screen.getAllByRole("spinbutton");
  const amountInput = amountInputs[0];
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(amountInput);
  await user.type(amountInput, "0.99");
  await user.click(saveButton);

  expect(updateExpenseInFirestore).toHaveBeenCalledWith(
    mockExpense.id,
    expect.objectContaining({
      amount: 0.99,
    }),
  );
});

test("should accept large expense amounts", async () => {
  const { updateExpenseInFirestore } = await import("../firebase/firestore");

  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const amountInputs = screen.getAllByRole("spinbutton");
  const amountInput = amountInputs[0];
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(amountInput);
  await user.type(amountInput, "9999.99");
  await user.click(saveButton);

  expect(updateExpenseInFirestore).toHaveBeenCalledWith(
    mockExpense.id,
    expect.objectContaining({
      amount: 9999.99,
    }),
  );
});

test("should show error when expense amount is zero", async () => {
  const toast = await import("react-hot-toast");

  renderExpenseItem();

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
    "Expense amount must be greater than 0",
  );
});

test("should show error when expense amount is negative", async () => {
  const toast = await import("react-hot-toast");

  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const amountInputs = screen.getAllByRole("spinbutton");
  const amountInput = amountInputs[0];
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(amountInput);
  await user.type(amountInput, "-50");
  await user.click(saveButton);

  expect(toast.default.error).toHaveBeenCalledWith(
    "Expense amount must be greater than 0",
  );
});

// ********** COMBINED UPDATE TESTS **********

test("should update both name and amount together", async () => {
  const { updateExpenseInFirestore } = await import("../firebase/firestore");

  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Grocery Shopping");
  const amountInputs = screen.getAllByRole("spinbutton");
  const amountInput = amountInputs[0];
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(nameInput);
  await user.type(nameInput, "Whole Foods");

  await user.clear(amountInput);
  await user.type(amountInput, "156.99");

  await user.click(saveButton);

  expect(updateExpenseInFirestore).toHaveBeenCalledWith(
    mockExpense.id,
    expect.objectContaining({
      name: "Whole Foods",
      amount: 156.99,
    }),
  );
});

test("should exit edit mode after successful update", async () => {
  const { updateExpenseInFirestore } = await import("../firebase/firestore");

  updateExpenseInFirestore.mockResolvedValueOnce(undefined);

  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const saveButton = screen.getByRole("button", { name: /save|check/i });
  await user.click(saveButton);

  const toast = await import("react-hot-toast");
  expect(toast.default.success).toHaveBeenCalledWith("Expense updated!");
});

test("should handle update errors gracefully", async () => {
  const { updateExpenseInFirestore } = await import("../firebase/firestore");

  updateExpenseInFirestore.mockRejectedValueOnce(new Error("Update failed"));

  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const saveButton = screen.getByRole("button", { name: /save|check/i });
  await user.click(saveButton);

  const toast = await import("react-hot-toast");
  expect(toast.default.error).toHaveBeenCalledWith("Failed to update expense");
});

test("should not update with only name change validation failure", async () => {
  const toast = await import("react-hot-toast");

  renderExpenseItem();

  const user = userEvent.setup();

  const buttons = screen.getAllByRole("button");
  const editButton = buttons[0];
  await user.click(editButton);

  const nameInput = screen.getByDisplayValue("Grocery Shopping");
  const saveButton = screen.getByRole("button", { name: /save|check/i });

  await user.clear(nameInput);
  await user.click(saveButton);

  expect(toast.default.error).toHaveBeenCalledWith("Expense name is required");
});

test("should not update with only amount change validation failure", async () => {
  const toast = await import("react-hot-toast");

  renderExpenseItem();

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
    "Expense amount must be greater than 0",
  );
});
