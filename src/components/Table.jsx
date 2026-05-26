// component import
import ExpenseItem from "./ExpenseItem";

const Table = ({ expenses, budgets, showBudget = true }) => {
  return (
    <div className="table">
      {/* expenses table */}
      <table>
        <thead>
          <tr>
            {/* expense name */}
            <th>Name</th>

            {/* expense amount */}
            <th>Amount</th>

            {/* created date */}
            <th>Date</th>

            {/* budget */}
            {showBudget && <th>Budget</th>}

            {/* edit */}
            <th>Edit</th>

            {/* delete */}
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <ExpenseItem
                expense={expense}
                budgets={budgets}
                showBudget={showBudget}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
