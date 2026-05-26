// rrd import
import { redirect } from "react-router-dom";

// library
import toast from "react-hot-toast";

// firebase firestore
import {
  deleteBudgetFromFirestore,
  getExpensesFromFirestore,
  deleteExpenseFromFirestore,
} from "../firebase/firestore";

export async function deleteBudget({ params }) {
  try {
    // get all expenses
    const expenses = await getExpensesFromFirestore();

    // matching expenses
    const associatedExpenses = expenses.filter(
      (expense) => expense.budgetId === params.id,
    );

    // delete expenses
    for (const expense of associatedExpenses) {
      await deleteExpenseFromFirestore(expense.id);
    }

    // delete budget
    await deleteBudgetFromFirestore(params.id);

    toast.success("Budget deleted successfully!");

    // redirect safely
    return redirect("/dashboard");
  } catch (e) {
    throw new Error("There was a problem deleting your budget.");
  }
}
