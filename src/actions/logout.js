// rrd imports
import { redirect } from "react-router-dom";

// library
import toast from "react-hot-toast";

// firebase auth
import { signOut, deleteUser } from "firebase/auth";

// firestore
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

export async function logoutAction({ request }) {
  const formData = await request.formData();

  const deleteAccount = formData.get("deleteAccount");

  const user = auth.currentUser;

  // delete account
  if (deleteAccount === "true" && user) {
    try {
      // delete budgets
      const budgetsQuery = query(
        collection(db, "budgets"),
        where("uid", "==", user.uid),
      );

      const budgetsSnapshot = await getDocs(budgetsQuery);

      for (const budget of budgetsSnapshot.docs) {
        await deleteDoc(doc(db, "budgets", budget.id));
      }

      // delete expenses
      const expensesQuery = query(
        collection(db, "expenses"),
        where("uid", "==", user.uid),
      );

      const expensesSnapshot = await getDocs(expensesQuery);

      for (const expense of expensesSnapshot.docs) {
        await deleteDoc(doc(db, "expenses", expense.id));
      }

      // delete auth account
      await deleteUser(user);

      localStorage.removeItem("userName");

      toast.success("Account deleted successfully!");
    } catch (error) {
      console.log(error);

      toast.error("Failed to delete account.");
    }

    return redirect("/");
  }

  // normal logout
  await signOut(auth);

  localStorage.removeItem("userName");

  toast.success("Logged out successfully!");

  return redirect("/");
}
