// react imports
import { useEffect, useState } from "react";

// library imports
import toast from "react-hot-toast";

import { DocumentArrowDownIcon } from "@heroicons/react/24/solid";

// components
import Table from "../components/Table";

// pdf export
import exportPDF from "../utils/exportPDF";

// firebase auth
import { auth } from "../firebase/firebase";

// firebase firestore
import {
  subscribeToExpenses,
  subscribeToBudgets,
  deleteExpenseFromFirestore,
} from "../firebase/firestore";

// loader
export async function expensesLoader() {
  return null;
}

// action
export async function expensesAction({ request }) {
  const data = await request.formData();

  const { _action, ...values } = Object.fromEntries(data);

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

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);

  const [budgets, setBudgets] = useState([]);

  // firebase user
  const user = auth.currentUser || null;

  // realtime listeners
  useEffect(() => {
    if (!user) return;

    // expenses listener
    const unsubscribeExpenses = subscribeToExpenses((expensesData) => {
      setExpenses(expensesData);
    });

    // budgets listener
    const unsubscribeBudgets = subscribeToBudgets((budgetsData) => {
      setBudgets(budgetsData);
    });

    // cleanup
    return () => {
      if (unsubscribeExpenses) {
        unsubscribeExpenses();
      }

      if (unsubscribeBudgets) {
        unsubscribeBudgets();
      }
    };
  }, [user]);

  return (
    <div className="grid-lg">
      {/* heading */}
      <div
        className="flex-lg"
        style={{
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>All Expenses</h1>

        {expenses.length > 0 && (
          <button className="btn btn--dark" onClick={() => exportPDF(expenses)}>
            <DocumentArrowDownIcon width={20} />

            <span>Export PDF</span>
          </button>
        )}
      </div>

      {/* expenses table */}
      {expenses && expenses.length > 0 ? (
        <div className="grid-md">
          <h2>
            Recent Expenses <small>({expenses.length} Total)</small>
          </h2>

          <Table
            expenses={[...expenses].sort((a, b) => b.createdAt - a.createdAt)}
            budgets={budgets}
          />
        </div>
      ) : (
        <p>No Expenses To Show</p>
      )}
    </div>
  );
};

export default ExpensesPage;
