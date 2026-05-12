// ============================ APP.JS ============================
// React Frontend for Sales & Purchase Ledger System
// WITH DASHBOARD IMPROVEMENTS, ANALYTICS, & BALAJI PREMIUM STYLING
// UPDATED: Only one action form open at a time in Sales & Purchase tabs

import React, { useState, useEffect, useCallback } from "react";

// ================= API URL =================
// REPLACE WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
const API_URL = "https://script.google.com/macros/s/AKfycbwCK4k57kikO_21Zzm0SceM3HjBth7RexohfHem0x7vak8HApXykAHtHXfe9MLqH8qB/exec";

export default function App() {
  // ================= STATES =================
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalCustomerPending: 0,
    totalVendorPending: 0,
    totalCustomers: 0,
    totalVendors: 0,
    totalSalesReturns: 0,
    totalPurchaseReturns: 0,
    actualSales: 0
  });
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [customerBalances, setCustomerBalances] = useState([]);
  const [vendorBalances, setVendorBalances] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [customerLedger, setCustomerLedger] = useState([]);
  const [vendorLedger, setVendorLedger] = useState([]);
  
  // UI State for expanding forms - Only ONE active per section
  const [activeSalesForm, setActiveSalesForm] = useState("addSale"); // "addSale", "addReturn", "recordPayment"
  const [activePurchaseForm, setActivePurchaseForm] = useState("addPurchase"); // "addPurchase", "addReturn", "recordPayment"

  // Analytics State
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsFilter, setAnalyticsFilter] = useState("month");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });

  // ================= LOGIN =================
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  // ================= SALE FORM =================
  const [saleForm, setSaleForm] = useState({
    customer_name: "",
    phone: "",
    amount: "",
    status: "unpaid",
    notes: "",
  });

  // ================= SALE RETURN FORM =================
  const [saleReturnForm, setSaleReturnForm] = useState({
    customer_name: "",
    phone: "",
    return_amount: "",
    status: "unpaid",
    notes: "",
  });

  // ================= CUSTOMER PAYMENT FORM =================
  const [customerPaymentForm, setCustomerPaymentForm] = useState({
    customer_name: "",
    phone: "",
    amount: "",
    notes: "",
  });

  // ================= PURCHASE FORM =================
  const [purchaseForm, setPurchaseForm] = useState({
    vendor_name: "",
    phone: "",
    amount: "",
    status: "unpaid",
    notes: "",
  });

  // ================= PURCHASE RETURN FORM =================
  const [purchaseReturnForm, setPurchaseReturnForm] = useState({
    vendor_name: "",
    phone: "",
    return_amount: "",
    status: "unpaid",
    notes: "",
  });

  // ================= VENDOR PAYMENT FORM =================
  const [vendorPaymentForm, setVendorPaymentForm] = useState({
    vendor_name: "",
    phone: "",
    amount: "",
    notes: "",
  });

  // ================= EXPENSE FORM =================
  const [expenseForm, setExpenseForm] = useState({
    category: "",
    amount: "",
    description: "",
  });

  // ================= API CALL =================
  const apiCall = useCallback(async (payload) => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("API Error: " + err.message);
      return null;
    }
  }, []);

  // ================= LOAD FUNCTIONS =================
  const loadStats = useCallback(async () => {
    const res = await apiCall({ action: "getDashboardStats" });
    if (res?.success) setStats(res.data);
  }, [apiCall]);

  const loadSales = useCallback(async () => {
    const res = await apiCall({ action: "getAllSales" });
    if (res?.success) setSales(res.data || []);
  }, [apiCall]);

  const loadPurchases = useCallback(async () => {
    const res = await apiCall({ action: "getAllPurchases" });
    if (res?.success) setPurchases(res.data || []);
  }, [apiCall]);

  const loadExpenses = useCallback(async () => {
    const res = await apiCall({ action: "getAllExpenses" });
    if (res?.success) setExpenses(res.data || []);
  }, [apiCall]);

  const loadCustomerBalances = useCallback(async () => {
    const res = await apiCall({ action: "getAllCustomerBalances" });
    if (res?.success) setCustomerBalances(res.data || []);
  }, [apiCall]);

  const loadVendorBalances = useCallback(async () => {
    const res = await apiCall({ action: "getAllVendorBalances" });
    if (res?.success) setVendorBalances(res.data || []);
  }, [apiCall]);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadStats(),
      loadSales(),
      loadPurchases(),
      loadExpenses(),
      loadCustomerBalances(),
      loadVendorBalances(),
    ]);
  }, [loadStats, loadSales, loadPurchases, loadExpenses, loadCustomerBalances, loadVendorBalances]);

  const loadDashboard = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  // ================= CHECK FOR EXISTING LOGIN SESSION =================
  useEffect(() => {
    const savedLogin = localStorage.getItem("balaji_ledger_login");
    if (savedLogin === "true") {
      setLoggedIn(true);
      loadDashboard();
      loadAllData();
    }
  }, [loadDashboard, loadAllData]);

  // ================= LOGIN =================
  const handleLogin = async () => {
    const res = await apiCall({
      action: "login",
      username: loginData.username,
      password: loginData.password,
    });
    if (res?.success) {
      localStorage.setItem("balaji_ledger_login", "true");
      setLoggedIn(true);
      loadDashboard();
      loadAllData();
    } else {
      alert(res?.message || "Login Failed");
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("balaji_ledger_login");
    setLoggedIn(false);
    setStats({
      totalSales: 0,
      totalPurchases: 0,
      totalExpenses: 0,
      netProfit: 0,
      totalCustomerPending: 0,
      totalVendorPending: 0,
      totalCustomers: 0,
      totalVendors: 0,
      totalSalesReturns: 0,
      totalPurchaseReturns: 0,
      actualSales: 0
    });
    setSales([]);
    setPurchases([]);
    setExpenses([]);
    setCustomerBalances([]);
    setVendorBalances([]);
    setCustomerLedger([]);
    setVendorLedger([]);
    setActiveTab("dashboard");
  };

  // ================= SALES ANALYTICS =================
  const loadSalesAnalytics = useCallback(async (filter, startDate = null, endDate = null) => {
    let payload = { action: "getSalesAnalytics", filter };
    if (filter === "custom" && startDate && endDate) {
      payload.startDate = startDate;
      payload.endDate = endDate;
    }
    const res = await apiCall(payload);
    if (res?.success) {
      setAnalyticsData(res.data);
    }
  }, [apiCall]);

  const handleAnalyticsFilter = useCallback((filter) => {
    setAnalyticsFilter(filter);
    if (filter === "today") {
      loadSalesAnalytics("today");
    } else if (filter === "week") {
      loadSalesAnalytics("week");
    } else if (filter === "month") {
      loadSalesAnalytics("month");
    } else if (filter === "year") {
      loadSalesAnalytics("year");
    } else if (filter === "custom" && customDateRange.start && customDateRange.end) {
      loadSalesAnalytics("custom", customDateRange.start, customDateRange.end);
    }
  }, [loadSalesAnalytics, customDateRange.start, customDateRange.end]);

  const openAnalytics = () => {
    setShowAnalytics(true);
    handleAnalyticsFilter("month");
  };

  // ================= SALES =================
  const addSale = async () => {
    if (!saleForm.customer_name || !saleForm.phone || !saleForm.amount) {
      alert("Please fill all required fields");
      return;
    }
    const res = await apiCall({ action: "addSale", ...saleForm });
    if (res?.success) {
      alert("Sale Added Successfully");
      setSaleForm({ customer_name: "", phone: "", amount: "", status: "unpaid", notes: "" });
      loadAllData();
    }
  };

  const addSalesReturn = async () => {
    if (!saleReturnForm.customer_name || !saleReturnForm.phone || !saleReturnForm.return_amount) {
      alert("Please fill all required fields");
      return;
    }
    const res = await apiCall({ action: "addSalesReturn", ...saleReturnForm });
    if (res?.success) {
      alert("Sales Return Added Successfully");
      setSaleReturnForm({ customer_name: "", phone: "", return_amount: "", status: "unpaid", notes: "" });
      loadAllData();
    }
  };

  const recordCustomerPayment = async () => {
    if (!customerPaymentForm.customer_name || !customerPaymentForm.phone || !customerPaymentForm.amount) {
      alert("Please fill all required fields");
      return;
    }
    const res = await apiCall({ action: "recordCustomerPayment", ...customerPaymentForm });
    if (res?.success) {
      alert("Payment Recorded Successfully");
      setCustomerPaymentForm({ customer_name: "", phone: "", amount: "", notes: "" });
      loadAllData();
    }
  };

  const viewCustomerLedger = async (customer) => {
    setSelectedCustomer(customer);
    const res = await apiCall({ action: "getCustomerLedger", customer_name: customer.name, phone: customer.phone });
    if (res?.success) {
      setCustomerLedger(res.data);
      setActiveTab("customerLedger");
    }
  };

  // ================= PURCHASES =================
  const addPurchase = async () => {
    if (!purchaseForm.vendor_name || !purchaseForm.phone || !purchaseForm.amount) {
      alert("Please fill all required fields");
      return;
    }
    const res = await apiCall({ action: "addPurchase", ...purchaseForm });
    if (res?.success) {
      alert("Purchase Added Successfully");
      setPurchaseForm({ vendor_name: "", phone: "", amount: "", status: "unpaid", notes: "" });
      loadAllData();
    }
  };

  const addPurchaseReturn = async () => {
    if (!purchaseReturnForm.vendor_name || !purchaseReturnForm.phone || !purchaseReturnForm.return_amount) {
      alert("Please fill all required fields");
      return;
    }
    const res = await apiCall({ action: "addPurchaseReturn", ...purchaseReturnForm });
    if (res?.success) {
      alert("Purchase Return Added Successfully");
      setPurchaseReturnForm({ vendor_name: "", phone: "", return_amount: "", status: "unpaid", notes: "" });
      loadAllData();
    }
  };

  const recordVendorPayment = async () => {
    if (!vendorPaymentForm.vendor_name || !vendorPaymentForm.phone || !vendorPaymentForm.amount) {
      alert("Please fill all required fields");
      return;
    }
    const res = await apiCall({ action: "recordVendorPayment", ...vendorPaymentForm });
    if (res?.success) {
      alert("Payment Recorded Successfully");
      setVendorPaymentForm({ vendor_name: "", phone: "", amount: "", notes: "" });
      loadAllData();
    }
  };

  const viewVendorLedger = async (vendor) => {
    setSelectedVendor(vendor);
    const res = await apiCall({ action: "getVendorLedger", vendor_name: vendor.name, phone: vendor.phone });
    if (res?.success) {
      setVendorLedger(res.data);
      setActiveTab("vendorLedger");
    }
  };

  // ================= EXPENSES =================
  const addExpense = async () => {
    if (!expenseForm.category || !expenseForm.amount) {
      alert("Please fill category and amount");
      return;
    }
    const res = await apiCall({ action: "addExpense", ...expenseForm });
    if (res?.success) {
      alert("Expense Added Successfully");
      setExpenseForm({ category: "", amount: "", description: "" });
      loadAllData();
    }
  };

  const deleteExpense = async (id) => {
    if (window.confirm("Are you sure?")) {
      const res = await apiCall({ action: "deleteExpense", id });
      if (res?.success) {
        alert("Expense Deleted");
        loadAllData();
      }
    }
  };

  // ================= LOGIN SCREEN =================
  if (!loggedIn) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🌿</div>
            <h1 style={{ color: "#2C3E2F" }}>BalaJi Ledger</h1>
            <p style={{ color: "#666" }}>Sales & Purchase Management System</p>
          </div>
          <input
            style={styles.input}
            placeholder="Username"
            value={loginData.username}
            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          />
          <button style={styles.button} onClick={handleLogin}>
            {loading ? "Loading..." : "Login"}
          </button>
        </div>
      </div>
    );
  }

  // ================= MAIN APP =================
  return (
    <div className="home" style={styles.container}>
      {/* Premium Header */}
      <div style={styles.premiumHeader}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
          <div style={styles.headerContent}>
            <div>
              <h1 style={styles.logo}>
                <span style={{ color: "#9BB875" }}>BalaJi</span> Ledger
              </h1>
              <p style={styles.tagline}>Sales & Purchase Management System</p>
            </div>
            <div style={styles.headerActions}>
              <button onClick={openAnalytics} style={styles.analyticsBtn}>
                📊 Analytics
              </button>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabsWrapper}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
          <div style={styles.tabs}>
            {["dashboard", "sales", "purchases", "expenses", "customers", "vendors"].map(tab => (
              <button
                key={tab}
                style={{ ...styles.tab, ...(activeTab === tab ? styles.activeTab : {}) }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "dashboard" && "🏠 Dashboard"}
                {tab === "sales" && "💰 Sales"}
                {tab === "purchases" && "📦 Purchases"}
                {tab === "expenses" && "💸 Expenses"}
                {tab === "customers" && "👥 Customers"}
                {tab === "vendors" && "🏢 Vendors"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div style={styles.loaderOverlay}>
          <div style={styles.loader}></div>
        </div>
      )}

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 40px" }}>
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <>
            <div style={styles.statsGrid}>
              <StatCard title="Total Sales" value={stats.totalSales} icon="💰" color="#27AE60" />
              <StatCard title="Sales Returns" value={stats.totalSalesReturns} icon="↩️" color="#E74C3C" />
              <StatCard title="Actual Sales" value={stats.actualSales} icon="✨" color="#9BB875" />
              <StatCard title="Total Purchases" value={stats.totalPurchases} icon="📦" color="#E67E22" />
              <StatCard title="Purchase Returns" value={stats.totalPurchaseReturns} icon="🔄" color="#E74C3C" />
              <StatCard title="Total Expenses" value={stats.totalExpenses} icon="💸" color="#3498DB" />
              <StatCard title="Net Profit" value={stats.netProfit} icon="📈" color={stats.netProfit >= 0 ? "#27AE60" : "#E74C3C"} />
              <StatCard title="Customer Pending" value={stats.totalCustomerPending} icon="⏳" color="#F39C12" />
              <StatCard title="Vendor Pending" value={stats.totalVendorPending} icon="⏳" color="#F39C12" />
            </div>

            <div style={styles.quickActionsSection}>
              <h2 style={styles.sectionTitle}>Quick Actions</h2>
              <div style={styles.quickActionsGrid}>
                <QuickActionCard icon="💰" title="Add Sale" color="#9BB875" onClick={() => setActiveTab("sales")} />
                <QuickActionCard icon="📦" title="Add Purchase" color="#E67E22" onClick={() => setActiveTab("purchases")} />
                <QuickActionCard icon="💸" title="Add Expense" color="#3498DB" onClick={() => setActiveTab("expenses")} />
                <QuickActionCard icon="👥" title="View Customers" color="#8E44AD" onClick={() => setActiveTab("customers")} />
                <QuickActionCard icon="🏢" title="View Vendors" color="#16A085" onClick={() => setActiveTab("vendors")} />
                <QuickActionCard icon="📊" title="Analytics" color="#3A7BD5" onClick={openAnalytics} />
              </div>
            </div>
          </>
        )}

        {/* SALES TAB - Only one form open at a time */}
        {activeTab === "sales" && (
          <div style={styles.tabContent}>
            <div style={styles.actionButtonsGroup}>
              <ActionButton 
                active={activeSalesForm === "addSale"} 
                onClick={() => setActiveSalesForm("addSale")}
                icon="➕" 
                label="Add Sale" 
                color="#9BB875"
              />
              <ActionButton 
                active={activeSalesForm === "addReturn"} 
                onClick={() => setActiveSalesForm("addReturn")}
                icon="↩️" 
                label="Add Return" 
                color="#E74C3C"
              />
              <ActionButton 
                active={activeSalesForm === "recordPayment"} 
                onClick={() => setActiveSalesForm("recordPayment")}
                icon="💵" 
                label="Record Payment" 
                color="#27AE60"
              />
            </div>

            {activeSalesForm === "addSale" && (
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>➕ Add New Sale</h3>
                <div style={styles.formRow}>
                  <input style={styles.input} placeholder="Customer Name *" value={saleForm.customer_name} onChange={(e) => setSaleForm({ ...saleForm, customer_name: e.target.value })} />
                  <input style={styles.input} placeholder="Phone *" value={saleForm.phone} onChange={(e) => setSaleForm({ ...saleForm, phone: e.target.value })} />
                  <input style={styles.input} placeholder="Amount *" type="number" value={saleForm.amount} onChange={(e) => setSaleForm({ ...saleForm, amount: e.target.value })} />
                  <select style={styles.input} value={saleForm.status} onChange={(e) => setSaleForm({ ...saleForm, status: e.target.value })}>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                  <input style={styles.input} placeholder="Notes" value={saleForm.notes} onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })} />
                  <button style={{ ...styles.button, background: "linear-gradient(135deg, #9BB875, #7A9B58)" }} onClick={addSale}>Add Sale</button>
                </div>
              </div>
            )}

            {activeSalesForm === "addReturn" && (
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>↩️ Add Sales Return</h3>
                <div style={styles.formRow}>
                  <input style={styles.input} placeholder="Customer Name *" value={saleReturnForm.customer_name} onChange={(e) => setSaleReturnForm({ ...saleReturnForm, customer_name: e.target.value })} />
                  <input style={styles.input} placeholder="Phone *" value={saleReturnForm.phone} onChange={(e) => setSaleReturnForm({ ...saleReturnForm, phone: e.target.value })} />
                  <input style={styles.input} placeholder="Return Amount *" type="number" value={saleReturnForm.return_amount} onChange={(e) => setSaleReturnForm({ ...saleReturnForm, return_amount: e.target.value })} />
                  <select style={styles.input} value={saleReturnForm.status} onChange={(e) => setSaleReturnForm({ ...saleReturnForm, status: e.target.value })}>
                    <option value="unpaid">Unpaid (Customer still owes)</option>
                    <option value="paid">Paid (Money returned to customer)</option>
                  </select>
                  <input style={styles.input} placeholder="Notes" value={saleReturnForm.notes} onChange={(e) => setSaleReturnForm({ ...saleReturnForm, notes: e.target.value })} />
                  <button style={{ ...styles.button, background: "linear-gradient(135deg, #E74C3C, #C0392B)" }} onClick={addSalesReturn}>Add Return</button>
                </div>
              </div>
            )}

            {activeSalesForm === "recordPayment" && (
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>💵 Record Customer Payment</h3>
                <div style={styles.formRow}>
                  <input style={styles.input} placeholder="Customer Name *" value={customerPaymentForm.customer_name} onChange={(e) => setCustomerPaymentForm({ ...customerPaymentForm, customer_name: e.target.value })} />
                  <input style={styles.input} placeholder="Phone *" value={customerPaymentForm.phone} onChange={(e) => setCustomerPaymentForm({ ...customerPaymentForm, phone: e.target.value })} />
                  <input style={styles.input} placeholder="Payment Amount *" type="number" value={customerPaymentForm.amount} onChange={(e) => setCustomerPaymentForm({ ...customerPaymentForm, amount: e.target.value })} />
                  <input style={styles.input} placeholder="Notes" value={customerPaymentForm.notes} onChange={(e) => setCustomerPaymentForm({ ...customerPaymentForm, notes: e.target.value })} />
                  <button style={{ ...styles.button, background: "linear-gradient(135deg, #27AE60, #1E8449)" }} onClick={recordCustomerPayment}>Record Payment</button>
                </div>
              </div>
            )}

            <div style={styles.dataTableCard}>
              <h3 style={styles.formTitle}>📋 Sales List</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Customer</th><th>Phone</th><th>Amount</th><th>Status</th><th>Date</th><th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id}>
                        <td style={{ fontWeight: 500 }}>{sale.customer_name}</td>
                        <td>{sale.phone}</td>
                        <td style={{ fontWeight: 600, color: "#27AE60" }}>₹{Number(sale.amount).toLocaleString()}</td>
                        <td><span style={{ ...styles.statusBadge, backgroundColor: sale.status === "paid" ? "#27AE60" : "#F39C12" }}>{sale.status}</span></td>
                        <td>{new Date(sale.date).toLocaleDateString()}</td>
                        <td>{sale.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PURCHASES TAB - Only one form open at a time */}
        {activeTab === "purchases" && (
          <div style={styles.tabContent}>
            <div style={styles.actionButtonsGroup}>
              <ActionButton 
                active={activePurchaseForm === "addPurchase"} 
                onClick={() => setActivePurchaseForm("addPurchase")}
                icon="➕" 
                label="Add Purchase" 
                color="#E67E22"
              />
              <ActionButton 
                active={activePurchaseForm === "addReturn"} 
                onClick={() => setActivePurchaseForm("addReturn")}
                icon="↩️" 
                label="Add Return" 
                color="#E74C3C"
              />
              <ActionButton 
                active={activePurchaseForm === "recordPayment"} 
                onClick={() => setActivePurchaseForm("recordPayment")}
                icon="💵" 
                label="Record Payment" 
                color="#27AE60"
              />
            </div>

            {activePurchaseForm === "addPurchase" && (
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>➕ Add New Purchase</h3>
                <div style={styles.formRow}>
                  <input style={styles.input} placeholder="Vendor Name *" value={purchaseForm.vendor_name} onChange={(e) => setPurchaseForm({ ...purchaseForm, vendor_name: e.target.value })} />
                  <input style={styles.input} placeholder="Phone *" value={purchaseForm.phone} onChange={(e) => setPurchaseForm({ ...purchaseForm, phone: e.target.value })} />
                  <input style={styles.input} placeholder="Amount *" type="number" value={purchaseForm.amount} onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })} />
                  <select style={styles.input} value={purchaseForm.status} onChange={(e) => setPurchaseForm({ ...purchaseForm, status: e.target.value })}>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                  <input style={styles.input} placeholder="Notes" value={purchaseForm.notes} onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })} />
                  <button style={{ ...styles.button, background: "linear-gradient(135deg, #E67E22, #D35400)" }} onClick={addPurchase}>Add Purchase</button>
                </div>
              </div>
            )}

            {activePurchaseForm === "addReturn" && (
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>↩️ Add Purchase Return</h3>
                <div style={styles.formRow}>
                  <input style={styles.input} placeholder="Vendor Name *" value={purchaseReturnForm.vendor_name} onChange={(e) => setPurchaseReturnForm({ ...purchaseReturnForm, vendor_name: e.target.value })} />
                  <input style={styles.input} placeholder="Phone *" value={purchaseReturnForm.phone} onChange={(e) => setPurchaseReturnForm({ ...purchaseReturnForm, phone: e.target.value })} />
                  <input style={styles.input} placeholder="Return Amount *" type="number" value={purchaseReturnForm.return_amount} onChange={(e) => setPurchaseReturnForm({ ...purchaseReturnForm, return_amount: e.target.value })} />
                  <select style={styles.input} value={purchaseReturnForm.status} onChange={(e) => setPurchaseReturnForm({ ...purchaseReturnForm, status: e.target.value })}>
                    <option value="unpaid">Unpaid (We still owe vendor)</option>
                    <option value="paid">Paid (Vendor returned money)</option>
                  </select>
                  <input style={styles.input} placeholder="Notes" value={purchaseReturnForm.notes} onChange={(e) => setPurchaseReturnForm({ ...purchaseReturnForm, notes: e.target.value })} />
                  <button style={{ ...styles.button, background: "linear-gradient(135deg, #E74C3C, #C0392B)" }} onClick={addPurchaseReturn}>Add Return</button>
                </div>
              </div>
            )}

            {activePurchaseForm === "recordPayment" && (
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>💵 Record Vendor Payment</h3>
                <div style={styles.formRow}>
                  <input style={styles.input} placeholder="Vendor Name *" value={vendorPaymentForm.vendor_name} onChange={(e) => setVendorPaymentForm({ ...vendorPaymentForm, vendor_name: e.target.value })} />
                  <input style={styles.input} placeholder="Phone *" value={vendorPaymentForm.phone} onChange={(e) => setVendorPaymentForm({ ...vendorPaymentForm, phone: e.target.value })} />
                  <input style={styles.input} placeholder="Payment Amount *" type="number" value={vendorPaymentForm.amount} onChange={(e) => setVendorPaymentForm({ ...vendorPaymentForm, amount: e.target.value })} />
                  <input style={styles.input} placeholder="Notes" value={vendorPaymentForm.notes} onChange={(e) => setVendorPaymentForm({ ...vendorPaymentForm, notes: e.target.value })} />
                  <button style={{ ...styles.button, background: "linear-gradient(135deg, #27AE60, #1E8449)" }} onClick={recordVendorPayment}>Record Payment</button>
                </div>
              </div>
            )}

            <div style={styles.dataTableCard}>
              <h3 style={styles.formTitle}>📋 Purchases List</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Vendor</th><th>Phone</th><th>Amount</th><th>Status</th><th>Date</th><th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => (
                      <tr key={purchase.id}>
                        <td style={{ fontWeight: 500 }}>{purchase.vendor_name}</td>
                        <td>{purchase.phone}</td>
                        <td style={{ fontWeight: 600, color: "#E67E22" }}>₹{Number(purchase.amount).toLocaleString()}</td>
                        <td><span style={{ ...styles.statusBadge, backgroundColor: purchase.status === "paid" ? "#27AE60" : "#F39C12" }}>{purchase.status}</span></td>
                        <td>{new Date(purchase.date).toLocaleDateString()}</td>
                        <td>{purchase.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === "expenses" && (
          <div>
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>💸 Add New Expense</h3>
              <div style={styles.formRow}>
                <input style={styles.input} placeholder="Category *" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} />
                <input style={styles.input} placeholder="Amount *" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                <input style={styles.input} placeholder="Description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                <button style={styles.button} onClick={addExpense}>Add Expense</button>
              </div>
            </div>

            <div style={styles.dataTableCard}>
              <h3 style={styles.formTitle}>📋 Expenses List</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr><th>Category</th><th>Amount</th><th>Description</th><th>Date</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td style={{ fontWeight: 500 }}>{expense.category}</td>
                        <td style={{ fontWeight: 600, color: "#3498DB" }}>₹{Number(expense.amount).toLocaleString()}</td>
                        <td>{expense.description}</td>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                        <td><button style={styles.deleteButton} onClick={() => deleteExpense(expense.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === "customers" && (
          <div style={styles.dataTableCard}>
            <h3 style={styles.formTitle}>👥 All Customers & Ledger</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr><th>Customer Name</th><th>Phone</th><th>Current Balance</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {customerBalances.map((c, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: "bold" }}>{c.name}</td>
                      <td>{c.phone}</td>
                      <td style={{ color: c.balance > 0 ? "#E74C3C" : c.balance < 0 ? "#27AE60" : "#333", fontWeight: "bold" }}>
                        ₹{Math.abs(c.balance).toLocaleString()}
                      </td>
                      <td>
                        {c.balance > 0 ? 
                          <span style={styles.pendingBadge}>To Pay: ₹{c.balance.toLocaleString()}</span> : 
                         c.balance < 0 ? 
                          <span style={styles.receiveBadge}>To Receive: ₹{Math.abs(c.balance).toLocaleString()}</span> :
                          <span style={styles.settledBadge}>Settled</span>
                        }
                      </td>
                      <td>
                        <button style={styles.smallButton} onClick={() => viewCustomerLedger(c)}>
                          View Full Ledger
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VENDORS TAB */}
        {activeTab === "vendors" && (
          <div style={styles.dataTableCard}>
            <h3 style={styles.formTitle}>🏢 All Vendors & Ledger</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr><th>Vendor Name</th><th>Phone</th><th>Current Balance</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {vendorBalances.map((v, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: "bold" }}>{v.name}</td>
                      <td>{v.phone}</td>
                      <td style={{ color: v.balance > 0 ? "#E74C3C" : v.balance < 0 ? "#27AE60" : "#333", fontWeight: "bold" }}>
                        ₹{Math.abs(v.balance).toLocaleString()}
                      </td>
                      <td>
                        {v.balance > 0 ? 
                          <span style={styles.pendingBadge}>To Pay: ₹{v.balance.toLocaleString()}</span> : 
                         v.balance < 0 ? 
                          <span style={styles.receiveBadge}>To Receive: ₹{Math.abs(v.balance).toLocaleString()}</span> :
                          <span style={styles.settledBadge}>Settled</span>
                        }
                      </td>
                      <td>
                        <button style={styles.smallButton} onClick={() => viewVendorLedger(v)}>
                          View Full Ledger
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CUSTOMER LEDGER TAB */}
        {activeTab === "customerLedger" && selectedCustomer && (
          <div style={styles.dataTableCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={styles.formTitle}>📒 Complete Ledger: {selectedCustomer.name} ({selectedCustomer.phone})</h3>
              <button style={styles.backButton} onClick={() => setActiveTab("customers")}>← Back to Customers</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr><th>Date</th><th>Type</th><th>Sale Amount</th><th>Payment/Return</th><th>Balance</th><th>Status</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {customerLedger.map((entry, idx) => (
                    <tr key={idx} style={{ backgroundColor: entry.paymentStatus === "paid" ? "#E8F5E9" : entry.type === "sale" && entry.paymentStatus === "unpaid" ? "#FFF8E1" : "white" }}>
                      <td>{new Date(entry.date).toLocaleString()}</td>
                      <td style={{ fontWeight: "bold" }}>{entry.type === "sale" ? "💰 SALE" : entry.type === "payment" ? "💵 PAYMENT" : "↩️ RETURN"}</td>
                      <td style={{ color: "#E74C3C" }}>{entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : "-"}</td>
                      <td style={{ color: "#27AE60" }}>{entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : "-"}</td>
                      <td style={{ fontWeight: "bold", color: entry.balance > 0 ? "#E74C3C" : entry.balance < 0 ? "#27AE60" : "#333" }}>₹{entry.balance.toLocaleString()}</td>
                      <td>{entry.paymentStatus === "paid" ? <span style={{ color: "#27AE60" }}>✓ Paid</span> : <span style={{ color: "#E74C3C" }}>⏳ Unpaid</span>}</td>
                      <td>{entry.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={styles.balanceSummary}>
              <strong>Current Balance: </strong>
              <span style={{ fontSize: 24, fontWeight: "bold", color: customerLedger[customerLedger.length - 1]?.balance > 0 ? "#E74C3C" : "#27AE60" }}>
                ₹{Math.abs(customerLedger[customerLedger.length - 1]?.balance || 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* VENDOR LEDGER TAB */}
        {activeTab === "vendorLedger" && selectedVendor && (
          <div style={styles.dataTableCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={styles.formTitle}>📒 Complete Ledger: {selectedVendor.name} ({selectedVendor.phone})</h3>
              <button style={styles.backButton} onClick={() => setActiveTab("vendors")}>← Back to Vendors</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr><th>Date</th><th>Type</th><th>Payment/Return</th><th>Purchase Amount</th><th>Balance</th><th>Status</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {vendorLedger.map((entry, idx) => (
                    <tr key={idx} style={{ backgroundColor: entry.paymentStatus === "paid" ? "#E8F5E9" : entry.type === "purchase" && entry.paymentStatus === "unpaid" ? "#FFF8E1" : "white" }}>
                      <td>{new Date(entry.date).toLocaleString()}</td>
                      <td style={{ fontWeight: "bold" }}>{entry.type === "purchase" ? "📦 PURCHASE" : entry.type === "payment" ? "💵 PAYMENT" : "↩️ RETURN"}</td>
                      <td style={{ color: "#27AE60" }}>{entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : "-"}</td>
                      <td style={{ color: "#E74C3C" }}>{entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : "-"}</td>
                      <td style={{ fontWeight: "bold", color: entry.balance > 0 ? "#E74C3C" : entry.balance < 0 ? "#27AE60" : "#333" }}>₹{entry.balance.toLocaleString()}</td>
                      <td>{entry.paymentStatus === "paid" ? <span style={{ color: "#27AE60" }}>✓ Paid</span> : <span style={{ color: "#E74C3C" }}>⏳ Unpaid</span>}</td>
                      <td>{entry.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={styles.balanceSummary}>
              <strong>Current Balance: </strong>
              <span style={{ fontSize: 24, fontWeight: "bold", color: vendorLedger[vendorLedger.length - 1]?.balance > 0 ? "#E74C3C" : "#27AE60" }}>
                ₹{Math.abs(vendorLedger[vendorLedger.length - 1]?.balance || 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ANALYTICS MODAL */}
      {showAnalytics && (
        <div style={styles.modalOverlay} onClick={() => setShowAnalytics(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0 }}>📊 Sales Analytics</h2>
              <button style={styles.modalClose} onClick={() => setShowAnalytics(false)}>×</button>
            </div>
            
            <div style={styles.filterGroup}>
              {["today", "week", "month", "year"].map(filter => (
                <button key={filter} onClick={() => handleAnalyticsFilter(filter)} style={{ ...styles.filterButton, backgroundColor: analyticsFilter === filter ? "#9BB875" : "#f0f0f0", color: analyticsFilter === filter ? "white" : "#333" }}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
              <button onClick={() => setAnalyticsFilter("custom")} style={{ ...styles.filterButton, backgroundColor: analyticsFilter === "custom" ? "#9BB875" : "#f0f0f0", color: analyticsFilter === "custom" ? "white" : "#333" }}>Custom</button>
            </div>

            {analyticsFilter === "custom" && (
              <div style={styles.customDateRange}>
                <input type="date" style={styles.input} value={customDateRange.start} onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })} />
                <span>to</span>
                <input type="date" style={styles.input} value={customDateRange.end} onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })} />
                <button style={styles.button} onClick={() => handleAnalyticsFilter("custom")}>Apply</button>
              </div>
            )}

            {analyticsData && (
              <div>
                <div style={styles.analyticsStats}>
                  <div style={styles.analyticsCard}><div style={styles.analyticsCardIcon}>💰</div><div>Total Sales</div><div style={{ fontSize: 24, fontWeight: "bold", color: "#27AE60" }}>₹{analyticsData.totalSales?.toLocaleString() || 0}</div></div>
                  <div style={styles.analyticsCard}><div style={styles.analyticsCardIcon}>↩️</div><div>Total Returns</div><div style={{ fontSize: 24, fontWeight: "bold", color: "#E74C3C" }}>₹{analyticsData.totalReturns?.toLocaleString() || 0}</div></div>
                  <div style={styles.analyticsCard}><div style={styles.analyticsCardIcon}>✨</div><div>Actual Sales</div><div style={{ fontSize: 24, fontWeight: "bold", color: "#9BB875" }}>₹{analyticsData.actualSales?.toLocaleString() || 0}</div></div>
                  <div style={styles.analyticsCard}><div style={styles.analyticsCardIcon}>📋</div><div>Transactions</div><div style={{ fontSize: 24, fontWeight: "bold" }}>{analyticsData.transactionCount || 0}</div></div>
                </div>

                {analyticsData.salesData && analyticsData.salesData.length > 0 && (
                  <div style={{ overflowX: "auto", marginTop: 20 }}>
                    <table style={styles.table}>
                      <thead><tr><th>Date</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {analyticsData.salesData.map((sale, i) => (
                          <tr key={i}><td>{new Date(sale.date).toLocaleDateString()}</td><td>{sale.customer_name}</td><td style={{ color: "#27AE60", fontWeight: 600 }}>₹{Number(sale.amount).toLocaleString()}</td><td><span style={{ ...styles.statusBadge, backgroundColor: sale.status === "paid" ? "#27AE60" : "#F39C12" }}>{sale.status}</span></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ================= COMPONENTS =================
function StatCard({ title, value, icon, color }) {
  return (
    <div style={styles.card}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <h3 style={{ margin: 0, fontSize: 12, color: "#666", letterSpacing: 1 }}>{title}</h3>
      <h2 style={{ margin: "8px 0 0", color: color || "#2C3E2F", fontSize: 20 }}>₹{value?.toLocaleString() || 0}</h2>
    </div>
  );
}

function QuickActionCard({ icon, title, onClick, color }) {
  return (
    <div style={{ ...styles.quickActionCard, borderBottom: `3px solid ${color}` }} onClick={onClick}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontWeight: 600 }}>{title}</div>
    </div>
  );
}

function ActionButton({ active, onClick, icon, label, color }) {
  return (
    <button 
      style={{ 
        ...styles.actionBtn, 
        ...(active ? { ...styles.actionBtnActive, borderBottomColor: color, color: color, background: `${color}10` } : {})
      }} 
      onClick={onClick}
    >
      {icon} {label}
    </button>
  );
}

// ================= STYLES =================
const styles = {
  container: { background: "#F5F0E8", minHeight: "100vh", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  premiumHeader: { background: "white", padding: "20px 0", boxShadow: "0 2px 20px rgba(0,0,0,0.05)", borderBottom: "3px solid #9BB875" },
  headerContent: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 },
  logo: { fontSize: "1.8rem", margin: 0, fontWeight: 700, letterSpacing: "-0.5px" },
  tagline: { margin: 0, fontSize: "0.8rem", color: "#666" },
  headerActions: { display: "flex", gap: 12 },
  analyticsBtn: { background: "linear-gradient(135deg, #9BB875, #7A9B58)", border: "none", padding: "10px 20px", borderRadius: 30, color: "white", fontWeight: 600, cursor: "pointer", transition: "transform 0.2s" },
  logoutBtn: { background: "transparent", border: "1px solid #ddd", padding: "10px 20px", borderRadius: 30, color: "#666", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  tabsWrapper: { background: "white", borderBottom: "1px solid #E8E0D5", marginBottom: 30, position: "sticky", top: 0, zIndex: 100 },
  tabs: { display: "flex", flexWrap: "wrap", gap: 5, padding: "12px 0" },
  tab: { padding: "10px 24px", background: "transparent", border: "none", borderRadius: 30, cursor: "pointer", fontWeight: 500, transition: "all 0.2s", color: "#666" },
  activeTab: { background: "#9BB875", color: "white" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 30 },
  card: { background: "white", padding: "20px 16px", borderRadius: 20, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.04)", transition: "transform 0.2s", cursor: "pointer", border: "1px solid rgba(155,184,117,0.15)" },
  quickActionsSection: { background: "white", marginTop: 25, padding: 25, borderRadius: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.04)" },
  sectionTitle: { fontSize: "1.3rem", fontWeight: 600, color: "#2C3E2F", marginBottom: 20, borderLeft: "4px solid #9BB875", paddingLeft: 15 },
  quickActionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 15 },
  quickActionCard: { background: "#FAF8F5", padding: "20px 16px", borderRadius: 16, textAlign: "center", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", border: "1px solid #EAE3D8" },
  tabContent: { display: "flex", flexDirection: "column", gap: 20 },
  actionButtonsGroup: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 5 },
  actionBtn: { padding: "12px 28px", background: "white", border: "none", borderRadius: 40, cursor: "pointer", fontWeight: 600, fontSize: 14, boxShadow: "0 2px 6px rgba(0,0,0,0.08)", transition: "all 0.2s" },
  actionBtnActive: { borderBottom: "3px solid", fontWeight: 700 },
  formCard: { background: "white", padding: 24, borderRadius: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.04)", marginBottom: 20 },
  formTitle: { fontSize: "1.1rem", fontWeight: 600, color: "#2C3E2F", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 },
  dataTableCard: { background: "white", padding: 24, borderRadius: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.04)" },
  formRow: { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" },
  input: { padding: "12px 16px", borderRadius: 12, border: "2px solid #E8E0D5", fontSize: 14, fontFamily: "'Inter', sans-serif", transition: "all 0.2s", outline: "none", flex: "1 1 200px", background: "white" },
  button: { padding: "12px 28px", background: "linear-gradient(135deg, #9BB875, #7A9B58)", color: "white", border: "none", borderRadius: 30, cursor: "pointer", fontWeight: 600, transition: "transform 0.2s" },
  deleteButton: { background: "#E74C3C", color: "white", border: "none", padding: "6px 16px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 500 },
  smallButton: { background: "#9BB875", color: "white", border: "none", padding: "6px 16px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 500 },
  backButton: { background: "#6c757d", color: "white", border: "none", padding: "8px 20px", borderRadius: 30, cursor: "pointer", fontWeight: 500 },
  table: { width: "100%", borderCollapse: "collapse", borderRadius: 16, overflow: "hidden" },
  statusBadge: { padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "white" },
  pendingBadge: { backgroundColor: "#FFEBEE", color: "#E74C3C", padding: "4px 12px", borderRadius: 20, fontSize: 12 },
  receiveBadge: { backgroundColor: "#E8F5E9", color: "#27AE60", padding: "4px 12px", borderRadius: 20, fontSize: 12 },
  settledBadge: { backgroundColor: "#EEEEEE", color: "#666", padding: "4px 12px", borderRadius: 20, fontSize: 12 },
  balanceSummary: { marginTop: 20, padding: 20, background: "linear-gradient(135deg, #E8F5E9, #DCEDC8)", borderRadius: 16, textAlign: "center" },
  loaderOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  loader: { width: 40, height: 40, border: "4px solid #f3f3f3", borderTop: "4px solid #9BB875", borderRadius: "50%", animation: "spin 1s linear infinite" },
  loginContainer: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #F5F0E8, #E8E0D5)" },
  loginCard: { width: 380, background: "white", padding: 40, borderRadius: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", textAlign: "center" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalContent: { background: "white", borderRadius: 24, padding: 30, maxWidth: 900, width: "90%", maxHeight: "80vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 15, borderBottom: "2px solid #F5F0E8" },
  modalClose: { background: "none", border: "none", fontSize: 32, cursor: "pointer", color: "#666" },
  filterGroup: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 },
  filterButton: { padding: "8px 20px", border: "none", borderRadius: 30, cursor: "pointer", fontWeight: 500, transition: "all 0.2s" },
  customDateRange: { display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" },
  analyticsStats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 15, marginBottom: 25 },
  analyticsCard: { background: "#F9F7F2", padding: 15, borderRadius: 16, textAlign: "center" },
  analyticsCardIcon: { fontSize: 28, marginBottom: 8 }
};

// Add global styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #F5F0E8; }
  .home button:hover { transform: translateY(-2px); opacity: 0.95; }
  .home .card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
  .home .quick-action-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
  input:focus, select:focus { border-color: #9BB875 !important; outline: none; box-shadow: 0 0 0 3px rgba(155,184,117,0.1); }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #F5F0E8; border-radius: 4px; }
  ::-webkit-scrollbar-thumb { background: #CBBEAB; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #9BB875; }
`;
document.head.appendChild(styleSheet);