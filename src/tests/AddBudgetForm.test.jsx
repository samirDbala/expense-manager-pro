import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import AddBudgetForm from "../components/AddBudgetForm";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

function renderForm() {
  const router = createMemoryRouter([
    {
      path: "/",
      element: <AddBudgetForm />,
    },
  ]);

  render(<RouterProvider router={router} />);
}

//    ************Amount Input************

//Zero
test("amount should be invalid when zero", async () => {
  renderForm();

  const amountInput = screen.getByLabelText(/amount/i);

  await userEvent.type(amountInput, "0");

  expect(amountInput).toBeInvalid();
});

//Value below minimum
test("amount should be invalid when below minimum", async () => {
  renderForm();

  const amountInput = screen.getByLabelText(/amount/i);

  await userEvent.type(amountInput, "0.009");

  expect(amountInput).toBeInvalid();
});

//Exactly minimum value
test("amount should be valid at minimum value", async () => {
  renderForm();

  const amountInput = screen.getByLabelText(/amount/i);

  await userEvent.type(amountInput, "0.01");

  expect(amountInput).toBeValid();
});

//Large number
test("amount should accept very large values", async () => {
  renderForm();

  const amountInput = screen.getByLabelText(/amount/i);

  await userEvent.type(amountInput, "999999999");

  expect(amountInput).toBeValid();
});

//Decimal value
test("amount should accept decimal values", async () => {
  renderForm();

  const amountInput = screen.getByLabelText(/amount/i);

  await userEvent.type(amountInput, "99.99");

  expect(amountInput).toBeValid();
});

//    ************Budget Name Input************

//Single character
test("expense name accepts a single character", async () => {
  renderForm();

  const input = screen.getByLabelText(/budget name/i);

  await userEvent.type(input, "A");

  expect(input).toHaveValue("A");
});

//Long name
test("expense name accepts very long text", async () => {
  renderForm();

  const input = screen.getByLabelText(/budget name/i);

  const longName = "A".repeat(200);

  await userEvent.type(input, longName);

  expect(input).toHaveValue(longName);
});

//Special characters
test("expense name accepts special characters", async () => {
  renderForm();

  const input = screen.getByLabelText(/budget name/i);

  await userEvent.type(input, "Coffee & Snacks!");

  expect(input).toHaveValue("Coffee & Snacks!");
});

//Leading and trailing spaces
test("expense name preserves spaces", async () => {
  renderForm();

  const input = screen.getByLabelText(/budget name/i);

  await userEvent.type(input, "  Coffee  ");

  expect(input).toHaveValue("  Coffee  ");
});

//Unicode or international text
test("expense name accepts unicode characters", async () => {
  renderForm();

  const input = screen.getByLabelText(/budget name/i);

  await userEvent.type(input, "Café");

  expect(input).toHaveValue("Café");
});

//    ************CreateBudget Form Test************

//Form renders correctly
test("renders create budget form", () => {
  renderForm();

  expect(
    screen.getByRole("heading", { name: /create budget/i }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("button", { name: /create budget/i }),
  ).toBeInTheDocument();
});

//Required fields exist
test("budget form fields are required", () => {
  renderForm();

  expect(screen.getByLabelText(/budget name/i)).toBeRequired();
  expect(screen.getByLabelText(/amount/i)).toBeRequired();
});

//Submit button is enabled initially
test("submit button is enabled initially", () => {
  renderForm();

  const button = screen.getByRole("button", {
    name: /create budget/i,
  });

  expect(button).toBeEnabled();
});

//Placeholders are displayed
test("shows placeholders", () => {
  renderForm();

  expect(screen.getByPlaceholderText(/groceries/i)).toBeInTheDocument();

  expect(screen.getByPlaceholderText(/₹150/i)).toBeInTheDocument();
});
