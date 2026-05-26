import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

import { formatCurrency } from "../helpers";

const Analytics = ({ budgets, expenses }) => {
  // total budget
  const totalBudget = budgets.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  );

  // total spent
  const totalSpent = expenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  );

  // remaining balance
  const remaining = totalBudget - totalSpent;

  // top category
  const topCategory = budgets.reduce(
    (prev, current) => (prev.spent > current.spent ? prev : current),
    budgets[0] || {},
  );

  // active budgets
  const activeBudgets = budgets.filter((budget) => budget.spent > 0);

  // current date
  const now = new Date();

  const currentMonth = now.getMonth();

  const currentYear = now.getFullYear();

  // previous month
  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);

  // this month expenses
  const thisMonthExpenses = expenses.filter((expense) => {
    const date = new Date(expense.createdAt);

    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });

  // this month total
  const thisMonthTotal = thisMonthExpenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  );

  // last month expenses
  const lastMonthExpenses = expenses.filter((expense) => {
    const date = new Date(expense.createdAt);

    return (
      date.getMonth() === lastMonthDate.getMonth() &&
      date.getFullYear() === lastMonthDate.getFullYear()
    );
  });

  // last month total
  const lastMonthTotal = lastMonthExpenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  );

  // pie chart data
  const pieData = activeBudgets.map((budget) => ({
    name:
      budget.name.length > 14 ? budget.name.slice(0, 14) + "…" : budget.name,

    value: budget.spent,

    color: `hsl(${budget.color})`,
  }));

  // bar chart data
  const monthlyData = activeBudgets.map((budget) => ({
    name:
      budget.name.length > 14 ? budget.name.slice(0, 14) + "…" : budget.name,

    spent: budget.spent,

    fill: `hsl(${budget.color})`,
  }));

  // month names
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // trend data
  const trendData = monthNames.map((month, index) => {
    const total = expenses
      .filter((expense) => {
        const date = new Date(expense.createdAt);

        return date.getMonth() === index && date.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    return {
      month,
      total,
    };
  });

  return (
    <div className="analytics">
      {/* analytics cards */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>Total Budget</h4>

          <h2>{formatCurrency(totalBudget)}</h2>
        </div>

        <div className="analytics-card">
          <h4>Total Spent</h4>

          <h2>{formatCurrency(totalSpent)}</h2>
        </div>

        <div className="analytics-card">
          <h4>Remaining</h4>

          <h2
            style={{
              color: remaining < 0 ? "#ef4444" : "#22c55e",
            }}
          >
            {formatCurrency(remaining)}
          </h2>
        </div>

        <div className="analytics-card">
          <h4>Top Category</h4>

          <h2>{topCategory?.name || "None"}</h2>

          <small>{formatCurrency(topCategory?.spent || 0)}</small>
        </div>

        <div className="analytics-card">
          <h4>This Month</h4>

          <h2>{formatCurrency(thisMonthTotal)}</h2>
        </div>

        <div className="analytics-card">
          <h4>Last Month</h4>

          <h2>{formatCurrency(lastMonthTotal)}</h2>
        </div>
      </div>

      {/* charts */}
      <div className="analytics-chart-grid">
        {/* pie chart */}
        <div className="chart-card">
          <h3>Spending Overview</h3>

          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={360}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  animationDuration={1200}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "1rem",

                    border: "none",

                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: "1rem",

                    fontWeight: 600,

                    fontSize: "0.9rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: "360px",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                opacity: 0.6,

                fontWeight: 600,
              }}
            >
              No expense data yet
            </div>
          )}
        </div>

        {/* bar chart */}
        <div className="chart-card">
          <h3>Budget Spending</h3>

          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={monthlyData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
                barCategoryGap="35%"
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.08} />

                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "#6b7280",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fill: "#6b7280",
                    fontSize: 13,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "1rem",

                    border: "none",

                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                  }}
                />

                <Bar
                  dataKey="spent"
                  radius={[14, 14, 0, 0]}
                  animationDuration={1200}
                  maxBarSize={80}
                >
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: "360px",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                opacity: 0.6,

                fontWeight: 600,
              }}
            >
              No spending data yet
            </div>
          )}
        </div>
      </div>

      {/* monthly trend */}
      <div
        className="chart-card"
        style={{
          marginTop: "2rem",
        }}
      >
        <h3>Monthly Spending Trend</h3>

        <ResponsiveContainer width="100%" height={360}>
          <LineChart
            data={trendData}
            margin={{
              top: 10,
              right: 25,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.08} />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{
                fill: "#6b7280",
                fontSize: window.innerWidth <= 768 ? 12 : 14,
                fontWeight: window.innerWidth <= 768 ? 500 : 600,
              }}
              padding={{
                left: window.innerWidth <= 768 ? 5 : 20,
                right: window.innerWidth <= 768 ? 5 : 20,
              }}
              tickFormatter={(value) =>
                window.innerWidth <= 768 ? value.charAt(0) : value
              }
            />

            <YAxis axisLine={false} tickLine={false} width={50} />

            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                borderRadius: "1rem",

                border: "none",

                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              }}
            />

            <Line
              type="monotone"
              dataKey="total"
              stroke="#0ea5e9"
              strokeWidth={4}
              dot={{
                r: 5,
              }}
              activeDot={{
                r: 8,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
