import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db, auth } from "./firebase";

//
// BUDGETS
//

// add budget
export const addBudgetToFirestore = async (budget) => {
  const user = auth.currentUser;

  if (!user) return;

  await addDoc(collection(db, "budgets"), {
    uid: user.uid,

    name: budget.name,

    amount: +budget.amount,

    createdAt: budget.createdAt,

    color: budget.color,

    colorIndex: budget.colorIndex,
  });
};

// update budget
export const updateBudgetInFirestore = async (id, updatedData) => {
  await updateDoc(doc(db, "budgets", id), updatedData);
};

// get budgets
export const getBudgetsFromFirestore = async () => {
  const user = auth.currentUser;

  if (!user) return [];

  const q = query(
    collection(db, "budgets"),

    where("uid", "==", user.uid),
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docItem) => ({
    id: docItem.id,

    ...docItem.data(),
  }));
};

// realtime budgets listener
export const subscribeToBudgets = (callback) => {
  const user = auth.currentUser;

  if (!user) return;

  const q = query(
    collection(db, "budgets"),

    where("uid", "==", user.uid),
  );

  return onSnapshot(q, (snapshot) => {
    const budgets = snapshot.docs.map((docItem) => ({
      id: docItem.id,

      ...docItem.data(),
    }));

    callback(budgets);
  });
};

// delete budget
export const deleteBudgetFromFirestore = async (id) => {
  await deleteDoc(doc(db, "budgets", id));
};

//
// EXPENSES
//

// add expense
export const addExpenseToFirestore = async (expense) => {
  const user = auth.currentUser;

  if (!user) return;

  await addDoc(collection(db, "expenses"), {
    uid: user.uid,

    name: expense.name,

    amount: +expense.amount,

    budgetId: expense.budgetId,

    createdAt: expense.createdAt,
  });
};

// update expense
export const updateExpenseInFirestore = async (id, updatedData) => {
  await updateDoc(doc(db, "expenses", id), updatedData);
};

// get expenses
export const getExpensesFromFirestore = async () => {
  const user = auth.currentUser;

  if (!user) return [];

  const q = query(
    collection(db, "expenses"),

    where("uid", "==", user.uid),
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docItem) => ({
    id: docItem.id,

    ...docItem.data(),
  }));
};

// realtime expenses listener
export const subscribeToExpenses = (callback) => {
  const user = auth.currentUser;

  if (!user) return;

  const q = query(
    collection(db, "expenses"),

    where("uid", "==", user.uid),
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map((docItem) => ({
      id: docItem.id,

      ...docItem.data(),
    }));

    callback(expenses);
  });
};

// delete expense
export const deleteExpenseFromFirestore = async (id) => {
  await deleteDoc(doc(db, "expenses", id));
};
