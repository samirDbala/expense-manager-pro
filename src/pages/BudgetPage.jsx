// rrd imports
import { useLoaderData } from "react-router-dom";

// library
import toast from "react-hot-toast";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

import { DocumentArrowDownIcon } from "@heroicons/react/24/solid";

// components
import BudgetItem from "../components/BudgetItem";
import AddExpenseFrom from "../components/AddExpenseFrom";
import Table from "../components/Table";

// pdf export
import exportBudgetPDF from "../utils/exportBudgetPDF";

// firebase firestore
import {
  getBudgetsFromFirestore,
  getExpensesFromFirestore,
  addExpenseToFirestore,
  deleteExpenseFromFirestore,
} from "../firebase/firestore";

// loader
export async function budgetLoader({ params }) {
  const budgets = await getBudgetsFromFirestore();

  const expenses = await getExpensesFromFirestore();

  let budget = budgets.find((budget) => budget.id === params.id);

  // refresh fix
  if (!budget) {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const retryBudgets = await getBudgetsFromFirestore();

    const retryExpenses = await getExpensesFromFirestore();

    budget = retryBudgets.find((budget) => budget.id === params.id);

    if (!budget) {
      throw new Error("The budget you're trying to find doesn't exist");
    }

    const retryBudgetExpenses = retryExpenses.filter(
      (expense) => expense.budgetId === params.id,
    );

    const retrySpent = retryBudgetExpenses.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0,
    );

    return {
      budget: {
        ...budget,
        spent: retrySpent,
      },

      expenses: retryBudgetExpenses,
    };
  }

  const budgetExpenses = expenses.filter(
    (expense) => expense.budgetId === params.id,
  );

  // calculate spent
  const spent = budgetExpenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  );

  const budgetWithSpent = {
    ...budget,
    spent,
  };

  return {
    budget: budgetWithSpent,

    expenses: budgetExpenses,
  };
}

// action
export async function budgetAction({ request }) {
  const data = await request.formData();

  const { _action, ...values } = Object.fromEntries(data);

  // create expense
  if (_action === "createExpense") {
    try {
      await addExpenseToFirestore({
        name: values.newExpense,

        amount: values.newExpenseAmount,

        budgetId: values.newExpenseBudget,

        createdAt: Date.now(),
      });

      return toast.success(`Expense ${values.newExpense} Created!`);
    } catch (e) {
      throw new Error("There was a problem creating your expense.");
    }
  }

  // delete expense
  if (_action === "deleteExpense") {
    try {
      await deleteExpenseFromFirestore(values.expenseId);

      return toast.success("Expense deleted!");
    } catch (e) {
      throw new Error("There was a problem deleting your expense.");
    }
  }
}

const BudgetPage = () => {
  const { budget, expenses } = useLoaderData();

  // analytics calculations
  const totalSpent = expenses.reduce(
    (acc, expense) => acc + Number(expense.amount),
    0,
  );

  const remaining = Number(budget.amount) - totalSpent;

  const highestExpense =
    expenses.length > 0
      ? Math.max(...expenses.map((expense) => Number(expense.amount)))
      : 0;

  const pieData = [
    {
      name: "Spent",
      value: totalSpent,
    },
    {
      name: "Remaining",
      value: remaining > 0 ? remaining : 0,
    },
  ];

  const chartData = expenses.map((expense) => ({
    name: expense.name,
    amount: Number(expense.amount),
  }));

  return (
    <div
      className="grid-lg"
      style={{
        "--accent": budget.color,
      }}
    >
      {/* heading */}
      <div
        className="flex-lg"
        style={{
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 className="h2">
          <span className="accent">{budget.name}</span> Overview
        </h1>

        <button
          className="btn btn--dark"
          onClick={() => exportBudgetPDF(budget, expenses)}
        >
          <DocumentArrowDownIcon width={20} />

          <span>Download Report</span>
        </button>
      </div>

      {/* top cards */}
      <div className="flex-lg">
        <BudgetItem budget={budget} showDelete={true} />

        <AddExpenseFrom budgets={[budget]} />
      </div>

      {/* analytics */}
      <div className="analytics">
        {/* cards */}
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Total Budget</h4>

            <h2>₹{Number(budget.amount).toLocaleString()}</h2>
          </div>

          <div className="analytics-card">
            <h4>Total Spent</h4>

            <h2>₹{totalSpent.toLocaleString()}</h2>
          </div>

          <div className="analytics-card">
            <h4>Remaining</h4>

            <h2
              style={{
                color: remaining < 0 ? "#ef4444" : "#22c55e",
              }}
            >
              ₹{remaining.toLocaleString()}
            </h2>
          </div>

          <div className="analytics-card">
            <h4>Total Transactions</h4>

            <h2>{expenses.length}</h2>

            <small>Highest Expense: ₹{highestExpense.toLocaleString()}</small>
          </div>
        </div>

        {/* charts */}
        <div className="analytics-chart-grid">
          {/* donut chart */}
          <div className="chart-card">
            <h3>Budget Overview</h3>

            {expenses.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                  >
                    <Cell fill={`hsl(${budget.color})`} />

                    <Cell fill="#d1d5db" />
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                      background: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="empty-chart"
                style={{
                  height: "320px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#777",
                  fontSize: "1.1rem",
                }}
              >
                No expense data yet
              </div>
            )}
          </div>

          {/* bar chart */}
          <div className="chart-card">
            <h3>Expense Breakdown</h3>

            {expenses.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} barCategoryGap="45%">
                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip
                    cursor={{
                      fill: "rgba(0,0,0,0.04)",
                    }}
                    contentStyle={{
                      borderRadius: "14px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                      background: "#fff",
                    }}
                  />

                  <Bar
                    dataKey="amount"
                    fill={`hsl(${budget.color})`}
                    radius={[10, 10, 0, 0]}
                    maxBarSize={70}
                    activeBar={{
                      filter: "brightness(1.12)",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="empty-chart"
                style={{
                  height: "320px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#777",
                  fontSize: "1.1rem",
                }}
              >
                No spending data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* expenses table */}
      {expenses && expenses.length > 0 && (
        <div className="grid-md">
          <h2>
            <span className="accent">{budget.name}</span> Expenses
          </h2>

          <Table expenses={expenses} showBudget={false} />
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
