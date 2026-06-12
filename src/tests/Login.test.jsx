import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import Login from "../pages/Login";

// Mock Firebase
vi.mock("../firebase/firebase", () => ({
  auth: {
    currentUser: null,
  },
}));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn().mockResolvedValue({}),
  createUserWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: { uid: "test-uid" },
  }),
  GoogleAuthProvider: vi.fn(),
  GithubAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  updateProfile: vi.fn(),
  setPersistence: vi.fn(),
  browserLocalPersistence: {},
  sendPasswordResetEmail: vi.fn(),
}));

// Mock useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

function renderLogin() {
  const router = createMemoryRouter([
    {
      path: "/",
      element: <Login />,
    },
  ]);

  render(<RouterProvider router={router} />);
}

// ********** LOGIN FORM TESTS **********

test("should display login form by default", async () => {
  renderLogin();

  expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText(/enter your password/i),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
});

test("should accept valid email input", async () => {
  renderLogin();

  const user = userEvent.setup();
  const emailInput = screen.getByPlaceholderText(/enter your email/i);

  await user.type(emailInput, "user@example.com");

  expect(emailInput).toHaveValue("user@example.com");
});

test("should accept valid password input", async () => {
  renderLogin();

  const user = userEvent.setup();
  const passwordInput = screen.getByPlaceholderText(/enter your password/i);

  await user.type(passwordInput, "Password123@");

  expect(passwordInput).toHaveValue("Password123@");
});

test("should toggle password visibility", async () => {
  renderLogin();

  const user = userEvent.setup();
  const passwordInput = screen.getByPlaceholderText(/enter your password/i);

  // Initially password should be hidden
  expect(passwordInput).toHaveAttribute("type", "password");

  // Find and click the eye toggle button
  const toggleButtons = screen.getAllByRole("button", { name: "" });
  const eyeToggle = toggleButtons.find((btn) =>
    btn.classList.contains("eye-toggle"),
  );

  if (eyeToggle) {
    await user.click(eyeToggle);
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(eyeToggle);
    expect(passwordInput).toHaveAttribute("type", "password");
  }
});

test("should display forgot password button in login mode", async () => {
  renderLogin();

  const forgotButton = screen.getByRole("button", {
    name: /forgot password/i,
  });

  expect(forgotButton).toBeInTheDocument();
});

// ********** SIGNUP FORM TESTS **********

test("should switch to signup form when create one link clicked", async () => {
  renderLogin();

  const user = userEvent.setup();

  const createLink = screen.getByRole("link", { name: /create one/i });
  await user.click(createLink);

  expect(
    screen.getByPlaceholderText(/enter your username/i),
  ).toBeInTheDocument();
});

test("should display username input in signup mode", async () => {
  renderLogin();

  const user = userEvent.setup();
  const createLink = screen.getByRole("link", { name: /create one/i });
  await user.click(createLink);

  const usernameInput = screen.getByPlaceholderText(/enter your username/i);
  expect(usernameInput).toBeInTheDocument();
});

test("should accept valid username in registration", async () => {
  renderLogin();

  const user = userEvent.setup();
  const createLink = screen.getByRole("link", { name: /create one/i });
  await user.click(createLink);

  const usernameInput = screen.getByPlaceholderText(/enter your username/i);
  await user.type(usernameInput, "TestUser123");

  expect(usernameInput).toHaveValue("TestUser123");
});

test("should show password rules in signup mode", async () => {
  renderLogin();

  const user = userEvent.setup();
  const createLink = screen.getByRole("link", { name: /create one/i });
  await user.click(createLink);

  const passwordInput = screen.getByPlaceholderText(/enter your password/i);
  await user.type(passwordInput, "P");

  // Password rules should be visible
  expect(screen.getByText(/8\+ chars/i)).toBeInTheDocument();
  expect(screen.getByText(/uppercase/i)).toBeInTheDocument();
  expect(screen.getByText(/lowercase/i)).toBeInTheDocument();
  expect(screen.getByText(/number/i)).toBeInTheDocument();
  expect(screen.getByText(/special/i)).toBeInTheDocument();
});

// ********** USERNAME VALIDATION TESTS **********

test("should show error when username is less than 5 characters", async () => {
  renderLogin();

  const user = userEvent.setup();
  const createLink = screen.getByRole("link", { name: /create one/i });
  await user.click(createLink);

  const usernameInput = screen.getByPlaceholderText(/enter your username/i);
  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const passwordInput = screen.getByPlaceholderText(/enter your password/i);
  const submitButton = screen.getByRole("button", { name: /create account/i });

  await user.type(usernameInput, "ab");
  await user.type(emailInput, "test@example.com");
  await user.type(passwordInput, "Test123@abc");
  await user.click(submitButton);

  const errorMessage = await screen.findByText(
    /username must be at least 5 characters/i,
  );
  expect(errorMessage).toBeInTheDocument();
});

test("should show error when username has no letters", async () => {
  renderLogin();

  const user = userEvent.setup();
  const createLink = screen.getByRole("link", { name: /create one/i });
  await user.click(createLink);

  const usernameInput = screen.getByPlaceholderText(/enter your username/i);
  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const passwordInput = screen.getByPlaceholderText(/enter your password/i);
  const submitButton = screen.getByRole("button", { name: /create account/i });

  await user.type(usernameInput, "12345");
  await user.type(emailInput, "test@example.com");
  await user.type(passwordInput, "Test123@abc");
  await user.click(submitButton);

  const errorMessage = await screen.findByText(
    /username must contain at least one letter/i,
  );
  expect(errorMessage).toBeInTheDocument();
});

test("should show error when username contains invalid characters", async () => {
  renderLogin();

  const user = userEvent.setup();
  const createLink = screen.getByRole("link", { name: /create one/i });
  await user.click(createLink);

  const usernameInput = screen.getByPlaceholderText(/enter your username/i);
  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const passwordInput = screen.getByPlaceholderText(/enter your password/i);
  const submitButton = screen.getByRole("button", { name: /create account/i });

  await user.type(usernameInput, "test@user!");
  await user.type(emailInput, "test@example.com");
  await user.type(passwordInput, "Test123@abc");
  await user.click(submitButton);

  const errorMessage = await screen.findByText(
    /only letters, numbers, and spaces are allowed/i,
  );
  expect(errorMessage).toBeInTheDocument();
});

test("should accept username with letters, numbers, and spaces", async () => {
  renderLogin();

  const user = userEvent.setup();
  const createLink = screen.getByRole("link", { name: /create one/i });
  await user.click(createLink);

  const usernameInput = screen.getByPlaceholderText(/enter your username/i);
  await user.type(usernameInput, "Test User 123");

  expect(usernameInput).toHaveValue("Test User 123");
});

// ********** PASSWORD VALIDATION TESTS **********

test("should show error when password is weak", async () => {
  renderLogin();

  const user = userEvent.setup();
  const createLink = screen.getByRole("link", { name: /create one/i });
  await user.click(createLink);

  const usernameInput = screen.getByPlaceholderText(/enter your username/i);
  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const passwordInput = screen.getByPlaceholderText(/enter your password/i);
  const submitButton = screen.getByRole("button", { name: /create account/i });

  await user.type(usernameInput, "TestUser");
  await user.type(emailInput, "test@example.com");
  await user.type(passwordInput, "weak");
  await user.click(submitButton);

  const errorMessage = await screen.findByText(
    /password must contain uppercase, lowercase, number, special character and 8\+ characters/i,
  );
  expect(errorMessage).toBeInTheDocument();
});

test("should accept strong password", async () => {
  renderLogin();

  const user = userEvent.setup();
  const createLink = screen.getByRole("link", { name: /create one/i });
  await user.click(createLink);

  const passwordInput = screen.getByPlaceholderText(/enter your password/i);
  await user.type(passwordInput, "Test123@strong");

  expect(passwordInput).toHaveValue("Test123@strong");
});

test("should validate all password requirements", async () => {
  renderLogin();

  const user = userEvent.setup();
  const createLink = screen.getByRole("link", { name: /create one/i });
  await user.click(createLink);

  const passwordInput = screen.getByPlaceholderText(/enter your password/i);

  // Type password with all requirements
  await user.type(passwordInput, "StrongPass123@");

  expect(passwordInput).toHaveValue("StrongPass123@");

  // All password rules should pass
  const passwordRules = screen
    .getByText(/8\+ chars/i)
    .closest(".password-rules");
  expect(within(passwordRules).getByText(/8\+ chars/i)).toBeInTheDocument();
});

// ********** FORM SWITCHING TESTS **********

test("should switch back to login form from signup", async () => {
  renderLogin();

  const user = userEvent.setup();

  // Go to signup
  const createLink = screen.getByRole("link", { name: /create one/i });
  await user.click(createLink);

  expect(
    screen.getByPlaceholderText(/enter your username/i),
  ).toBeInTheDocument();

  // Go back to login
  const loginLink = screen.getByRole("link", { name: /log in/i });
  await user.click(loginLink);

  expect(
    screen.queryByPlaceholderText(/enter your username/i),
  ).not.toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
});

test("should clear password when switching forms", async () => {
  renderLogin();

  const user = userEvent.setup();

  // Type password in login
  const passwordInput = screen.getByPlaceholderText(/enter your password/i);
  await user.type(passwordInput, "Password123@");

  // Switch to signup
  const createLink = screen.getByRole("link", { name: /create one/i });
  await user.click(createLink);

  // Password should be cleared
  const newPasswordInput = screen.getByPlaceholderText(/enter your password/i);
  expect(newPasswordInput).toHaveValue("");
});

// ********** SOCIAL LOGIN TESTS **********

test("should display google login button", async () => {
  renderLogin();

  expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
});

test("should display github login button", async () => {
  renderLogin();

  expect(screen.getByRole("button", { name: /github/i })).toBeInTheDocument();
});

test("should display continue with text", async () => {
  renderLogin();

  expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
});
