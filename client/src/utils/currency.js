// src/utils/currency.js

export const formatIndianCurrency = (num) => {
  if (num === undefined || num === null) return "₹0";
  
  // Convert to integer just in case
  const value = Number(num);

  if (value >= 10000000) { // 1 Crore
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) { // 1 Lakh
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  
  return `₹${value.toLocaleString('en-IN')}`;
};