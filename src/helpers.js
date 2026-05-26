export const waait = () =>
  new Promise((res) => setTimeout(res, Math.random() * 800));

// local storage
export const fetchData = (key) => {
  return JSON.parse(localStorage.getItem(key));
};

// delete item
export const deleteItem = ({ key }) => {
  return localStorage.removeItem(key);
};

// formatting date
export const formatDateToLocaleString = (epoch) =>
  new Date(epoch).toLocaleDateString("en-GB");

// formatting percentages
export const formatPercentage = (amt) => {
  return amt.toLocaleString(undefined, {
    style: "percent",

    minimumFractionDigits: 0,
  });
};

// format currency
export const formatCurrency = (amt) => {
  return Number(amt).toLocaleString(undefined, {
    style: "currency",

    currency: "INR",
  });
};
