// components/DashboardStats.js
import React, { useState, useEffect } from 'react';
import { getDashboard } from '../services/api';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingSales: 0,
    totalPurchases: 0,
    pendingPurchases: 0,
    totalExpenses: 0,
    netProfit: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const result = await getDashboard();
    if (result.success) {
      setStats(result.data);
    }
  };

  return (
    <div className="stats-container">
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="amount">₹{stats.totalSales.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Sales</h3>
          <p className="amount pending">₹{stats.pendingSales.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Purchases</h3>
          <p className="amount">₹{stats.totalPurchases.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Purchases</h3>
          <p className="amount pending">₹{stats.pendingPurchases.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <p className="amount">₹{stats.totalExpenses.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Net Profit</h3>
          <p className={`amount ${stats.netProfit >= 0 ? 'profit' : 'loss'}`}>
            ₹{stats.netProfit.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;