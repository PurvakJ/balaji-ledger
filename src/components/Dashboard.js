// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import DashboardStats from './DashboardStats';
import SalesManagement from './SalesManagement';
import PurchaseManagement from './PurchaseManagement';
import ExpenseManagement from './ExpenseManagement';
import LedgerView from './LedgerView';
import { getCustomers, getSuppliers } from '../services/api';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = async () => {
    const customersResult = await getCustomers();
    const suppliersResult = await getSuppliers();
    if (customersResult.success) setCustomers(customersResult.data);
    if (suppliersResult.success) setSuppliers(suppliersResult.data);
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Ledger Management System</h1>
        <div className="user-info">
          <span>Welcome, {user.username}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="sidebar">
        <button onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button onClick={() => setActiveTab('sales')}>Sales</button>
        <button onClick={() => setActiveTab('purchases')}>Purchases</button>
        <button onClick={() => setActiveTab('expenses')}>Expenses</button>
        <button onClick={() => setActiveTab('ledger')}>Ledger</button>
      </div>

      <div className="main-content">
        {activeTab === 'dashboard' && <DashboardStats />}
        {activeTab === 'sales' && <SalesManagement customers={customers} onPartyUpdate={loadParties} />}
        {activeTab === 'purchases' && <PurchaseManagement suppliers={suppliers} onPartyUpdate={loadParties} />}
        {activeTab === 'expenses' && <ExpenseManagement />}
        {activeTab === 'ledger' && <LedgerView customers={customers} suppliers={suppliers} />}
      </div>
    </div>
  );
};

export default Dashboard;