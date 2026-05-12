// ============================ APP.JS ============================
// React Frontend for Sales & Purchase Ledger System
// WITH DASHBOARD IMPROVEMENTS, ANALYTICS, & BalaJi PREMIUM STYLING
// UPDATED: Login state persistence using localStorage (no re-login on refresh)

import React, { useState, useEffect } from "react";

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
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [customerBalances, setCustomerBalances] = useState([]);
  const [vendorBalances, setVendorBalances] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [customerLedger, setCustomerLedger] = useState([]);
  const [vendorLedger, setVendorLedger] = useState([]);
  
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

  // ================= CHECK FOR EXISTING LOGIN SESSION ON MOUNT =================
  useEffect(() => {
    const savedLogin = localStorage.getItem("balaji_ledger_login");
    if (savedLogin === "true") {
      setLoggedIn(true);
      loadDashboard();
      loadAllData();
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // ================= API CALL =================
  const apiCall = async (payload) => {
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
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    const res = await apiCall({
      action: "login",
      username: loginData.username,
      password: loginData.password,
    });
    if (res?.success) {
      // Save login state to localStorage
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
    // Reset all data states
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
    setCustomers([]);
    setVendors([]);
    setCustomerBalances([]);
    setVendorBalances([]);
    setCustomerLedger([]);
    setVendorLedger([]);
    setSelectedCustomer(null);
    setSelectedVendor(null);
    setActiveTab("dashboard");
  };

  // ================= LOAD ALL DATA =================
  const loadAllData = async () => {
    await Promise.all([
      loadStats(),
      loadSales(),
      loadPurchases(),
      loadExpenses(),
      loadCustomers(),
      loadVendors(),
      loadCustomerBalances(),
      loadVendorBalances(),
    ]);
  };

  const loadDashboard = async () => {
    await loadStats();
  };

  // ================= LOAD STATS WITH RETURNS =================
  const loadStats = async () => {
    const res = await apiCall({ action: "getDashboardStats" });
    if (res?.success) setStats(res.data);
  };

  // ================= SALES ANALYTICS =================
  const loadSalesAnalytics = async (filter, startDate = null, endDate = null) => {
    let payload = { action: "getSalesAnalytics", filter };
    if (filter === "custom" && startDate && endDate) {
      payload.startDate = startDate;
      payload.endDate = endDate;
    }
    const res = await apiCall(payload);
    if (res?.success) {
      setAnalyticsData(res.data);
    }
  };

  const handleAnalyticsFilter = (filter) => {
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
  };

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

  const loadSales = async () => {
    const res = await apiCall({ action: "getAllSales" });
    if (res?.success) setSales(res.data || []);
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

  const loadPurchases = async () => {
    const res = await apiCall({ action: "getAllPurchases" });
    if (res?.success) setPurchases(res.data || []);
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

  const loadExpenses = async () => {
    const res = await apiCall({ action: "getAllExpenses" });
    if (res?.success) setExpenses(res.data || []);
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

  // ================= CUSTOMERS & VENDORS =================
  const loadCustomers = async () => {
    const res = await apiCall({ action: "getAllCustomers" });
    if (res?.success) setCustomers(res.data || []);
  };

  const loadVendors = async () => {
    const res = await apiCall({ action: "getAllVendors" });
    if (res?.success) setVendors(res.data || []);
  };

  const loadCustomerBalances = async () => {
    const res = await apiCall({ action: "getAllCustomerBalances" });
    if (res?.success) setCustomerBalances(res.data || []);
  };

  const loadVendorBalances = async () => {
    const res = await apiCall({ action: "getAllVendorBalances" });
    if (res?.success) setVendorBalances(res.data || []);
  };

  // ================= LOGIN SCREEN =================
  if (!loggedIn) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>📊</div>
            <h1 style={{ color: "var(--BalaJi-text-dark)" }}>Ledger Login</h1>
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
          <br></br>
          <button style={styles.button} onClick={handleLogin}>
            {loading ? "Loading..." : "Login"}
          </button>
        </div>
      </div>
    );
  }

  // ================= MAIN APP WITH BalaJi STYLING =================
  return (
    <div className="home" style={styles.container}>
      {/* Premium Header */}
      <div style={styles.premiumHeader}>
        <div className="container" style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div>
              <h1 style={{ fontSize: "1.8rem", margin: 0, fontFamily: "'Playfair Display', serif" }}>
                🌿 <span style={{ color: "var(--BalaJi-sage)" }}>BalaJi</span> Ledger
              </h1>
              <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.8 }}>Sales & Purchase Management System</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button 
                onClick={openAnalytics}
                style={{
                  background: "linear-gradient(135deg, var(--BalaJi-sage), var(--BalaJi-sage-dark))",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: 50,
                  color: "var(--BalaJi-text-dark)",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                📊 Analytics
              </button>
              <button 
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  border: "1px solid var(--BalaJi-cream-dark)",
                  padding: "10px 20px",
                  borderRadius: 50,
                  color: "var(--BalaJi-text-dark)",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabsWrapper}>
        <div className="container" style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
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

      {loading && <div style={styles.loader}>Loading...</div>}

      <div className="container" style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 40px" }}>
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <>
            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              <Card title="Total Sales" value={`₹${stats.totalSales?.toLocaleString() || 0}`} icon="💰" color="#27AE60" />
              <Card title="Sales Returns" value={`₹${stats.totalSalesReturns?.toLocaleString() || 0}`} icon="↩️" color="#E74C3C" />
              <Card title="Actual Sales" value={`₹${stats.actualSales?.toLocaleString() || 0}`} icon="✨" color="#9BB875" />
              <Card title="Total Purchases" value={`₹${stats.totalPurchases?.toLocaleString() || 0}`} icon="📦" color="#E67E22" />
              <Card title="Purchase Returns" value={`₹${stats.totalPurchaseReturns?.toLocaleString() || 0}`} icon="🔄" color="#E74C3C" />
              <Card title="Total Expenses" value={`₹${stats.totalExpenses?.toLocaleString() || 0}`} icon="💸" color="#3498DB" />
              <Card title="Net Profit" value={`₹${stats.netProfit?.toLocaleString() || 0}`} icon="📈" color={stats.netProfit >= 0 ? "#27AE60" : "#E74C3C"} />
              <Card title="Customer Pending" value={`₹${stats.totalCustomerPending?.toLocaleString() || 0}`} icon="⏳" color="#F39C12" />
              <Card title="Vendor Pending" value={`₹${stats.totalVendorPending?.toLocaleString() || 0}`} icon="⏳" color="#F39C12" />
            </div>

            {/* Quick Actions */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Quick Actions</h2>
              <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
                <button style={styles.quickButton} onClick={() => setActiveTab("sales")}>➕ Add Sale</button>
                <button style={styles.quickButton} onClick={() => setActiveTab("purchases")}>📦 Add Purchase</button>
                <button style={styles.quickButton} onClick={() => setActiveTab("expenses")}>💸 Add Expense</button>
                <button style={styles.quickButtonSecondary} onClick={() => setActiveTab("customers")}>👥 View Customers</button>
                <button style={styles.quickButtonSecondary} onClick={() => setActiveTab("vendors")}>🏢 View Vendors</button>
                <button style={styles.quickButtonAnalytics} onClick={openAnalytics}>📊 Sales Analytics</button>
              </div>
            </div>
          </>
        )}

        {/* SALES TAB */}
        {activeTab === "sales" && (
          <>
            <Section title="Add Sale">
              <div style={styles.formRow}>
                <input style={styles.input} placeholder="Customer Name *" value={saleForm.customer_name} onChange={(e) => setSaleForm({ ...saleForm, customer_name: e.target.value })} />
                <input style={styles.input} placeholder="Phone *" value={saleForm.phone} onChange={(e) => setSaleForm({ ...saleForm, phone: e.target.value })} />
                <input style={styles.input} placeholder="Amount *" type="number" value={saleForm.amount} onChange={(e) => setSaleForm({ ...saleForm, amount: e.target.value })} />
                <select style={styles.input} value={saleForm.status} onChange={(e) => setSaleForm({ ...saleForm, status: e.target.value })}>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
                <input style={styles.input} placeholder="Notes" value={saleForm.notes} onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })} />
                <button style={styles.button} onClick={addSale}>Add Sale</button>
              </div>
            </Section>

            <Section title="Add Sales Return">
              <div style={styles.formRow}>
                <input style={styles.input} placeholder="Customer Name *" value={saleReturnForm.customer_name} onChange={(e) => setSaleReturnForm({ ...saleReturnForm, customer_name: e.target.value })} />
                <input style={styles.input} placeholder="Phone *" value={saleReturnForm.phone} onChange={(e) => setSaleReturnForm({ ...saleReturnForm, phone: e.target.value })} />
                <input style={styles.input} placeholder="Return Amount *" type="number" value={saleReturnForm.return_amount} onChange={(e) => setSaleReturnForm({ ...saleReturnForm, return_amount: e.target.value })} />
                <select style={styles.input} value={saleReturnForm.status} onChange={(e) => setSaleReturnForm({ ...saleReturnForm, status: e.target.value })}>
                  <option value="unpaid">Unpaid (Customer still owes)</option>
                  <option value="paid">Paid (Money returned to customer)</option>
                </select>
                <input style={styles.input} placeholder="Notes" value={saleReturnForm.notes} onChange={(e) => setSaleReturnForm({ ...saleReturnForm, notes: e.target.value })} />
                <button style={{ ...styles.button, backgroundColor: "#dc3545" }} onClick={addSalesReturn}>Add Return</button>
              </div>
            </Section>

            <Section title="Record Customer Payment">
              <div style={styles.formRow}>
                <input style={styles.input} placeholder="Customer Name *" value={customerPaymentForm.customer_name} onChange={(e) => setCustomerPaymentForm({ ...customerPaymentForm, customer_name: e.target.value })} />
                <input style={styles.input} placeholder="Phone *" value={customerPaymentForm.phone} onChange={(e) => setCustomerPaymentForm({ ...customerPaymentForm, phone: e.target.value })} />
                <input style={styles.input} placeholder="Payment Amount *" type="number" value={customerPaymentForm.amount} onChange={(e) => setCustomerPaymentForm({ ...customerPaymentForm, amount: e.target.value })} />
                <input style={styles.input} placeholder="Notes" value={customerPaymentForm.notes} onChange={(e) => setCustomerPaymentForm({ ...customerPaymentForm, notes: e.target.value })} />
                <button style={{ ...styles.button, backgroundColor: "#28a745" }} onClick={recordCustomerPayment}>Record Payment</button>
              </div>
            </Section>

            <Section title="Sales List">
              <Table headers={["Customer", "Phone", "Amount", "Status", "Date", "Notes"]}>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td style={{ fontWeight: 500 }}>{sale.customer_name}</td>
                    <td>{sale.phone}</td>
                    <td style={{ fontWeight: 600, color: "#27AE60" }}>₹{Number(sale.amount).toLocaleString()}</td>
                    <td><span style={{ ...styles.statusBadge, backgroundColor: sale.status === "paid" ? "#27AE60" : "#F39C12", color: "white" }}>{sale.status}</span></td>
                    <td>{new Date(sale.date).toLocaleDateString()}</td>
                    <td>{sale.notes}</td>
                  </tr>
                ))}
              </Table>
            </Section>
          </>
        )}

        {/* PURCHASES TAB */}
        {activeTab === "purchases" && (
          <>
            <Section title="Add Purchase">
              <div style={styles.formRow}>
                <input style={styles.input} placeholder="Vendor Name *" value={purchaseForm.vendor_name} onChange={(e) => setPurchaseForm({ ...purchaseForm, vendor_name: e.target.value })} />
                <input style={styles.input} placeholder="Phone *" value={purchaseForm.phone} onChange={(e) => setPurchaseForm({ ...purchaseForm, phone: e.target.value })} />
                <input style={styles.input} placeholder="Amount *" type="number" value={purchaseForm.amount} onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })} />
                <select style={styles.input} value={purchaseForm.status} onChange={(e) => setPurchaseForm({ ...purchaseForm, status: e.target.value })}>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
                <input style={styles.input} placeholder="Notes" value={purchaseForm.notes} onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })} />
                <button style={styles.button} onClick={addPurchase}>Add Purchase</button>
              </div>
            </Section>

            <Section title="Add Purchase Return">
              <div style={styles.formRow}>
                <input style={styles.input} placeholder="Vendor Name *" value={purchaseReturnForm.vendor_name} onChange={(e) => setPurchaseReturnForm({ ...purchaseReturnForm, vendor_name: e.target.value })} />
                <input style={styles.input} placeholder="Phone *" value={purchaseReturnForm.phone} onChange={(e) => setPurchaseReturnForm({ ...purchaseReturnForm, phone: e.target.value })} />
                <input style={styles.input} placeholder="Return Amount *" type="number" value={purchaseReturnForm.return_amount} onChange={(e) => setPurchaseReturnForm({ ...purchaseReturnForm, return_amount: e.target.value })} />
                <select style={styles.input} value={purchaseReturnForm.status} onChange={(e) => setPurchaseReturnForm({ ...purchaseReturnForm, status: e.target.value })}>
                  <option value="unpaid">Unpaid (We still owe vendor)</option>
                  <option value="paid">Paid (Vendor returned money)</option>
                </select>
                <input style={styles.input} placeholder="Notes" value={purchaseReturnForm.notes} onChange={(e) => setPurchaseReturnForm({ ...purchaseReturnForm, notes: e.target.value })} />
                <button style={{ ...styles.button, backgroundColor: "#dc3545" }} onClick={addPurchaseReturn}>Add Return</button>
              </div>
            </Section>

            <Section title="Record Vendor Payment">
              <div style={styles.formRow}>
                <input style={styles.input} placeholder="Vendor Name *" value={vendorPaymentForm.vendor_name} onChange={(e) => setVendorPaymentForm({ ...vendorPaymentForm, vendor_name: e.target.value })} />
                <input style={styles.input} placeholder="Phone *" value={vendorPaymentForm.phone} onChange={(e) => setVendorPaymentForm({ ...vendorPaymentForm, phone: e.target.value })} />
                <input style={styles.input} placeholder="Payment Amount *" type="number" value={vendorPaymentForm.amount} onChange={(e) => setVendorPaymentForm({ ...vendorPaymentForm, amount: e.target.value })} />
                <input style={styles.input} placeholder="Notes" value={vendorPaymentForm.notes} onChange={(e) => setVendorPaymentForm({ ...vendorPaymentForm, notes: e.target.value })} />
                <button style={{ ...styles.button, backgroundColor: "#28a745" }} onClick={recordVendorPayment}>Record Payment</button>
              </div>
            </Section>

            <Section title="Purchases List">
              <Table headers={["Vendor", "Phone", "Amount", "Status", "Date", "Notes"]}>
                {purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td style={{ fontWeight: 500 }}>{purchase.vendor_name}</td>
                    <td>{purchase.phone}</td>
                    <td style={{ fontWeight: 600, color: "#E67E22" }}>₹{Number(purchase.amount).toLocaleString()}</td>
                    <td><span style={{ ...styles.statusBadge, backgroundColor: purchase.status === "paid" ? "#27AE60" : "#F39C12", color: "white" }}>{purchase.status}</span></td>
                    <td>{new Date(purchase.date).toLocaleDateString()}</td>
                    <td>{purchase.notes}</td>
                  </tr>
                ))}
              </Table>
            </Section>
          </>
        )}

        {/* EXPENSES TAB */}
        {activeTab === "expenses" && (
          <>
            <Section title="Add Expense">
              <div style={styles.formRow}>
                <input style={styles.input} placeholder="Category *" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} />
                <input style={styles.input} placeholder="Amount *" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                <input style={styles.input} placeholder="Description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                <button style={styles.button} onClick={addExpense}>Add Expense</button>
              </div>
            </Section>

            <Section title="Expenses List">
              <Table headers={["Category", "Amount", "Description", "Date", "Action"]}>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td style={{ fontWeight: 500 }}>{expense.category}</td>
                    <td style={{ fontWeight: 600, color: "#3498DB" }}>₹{Number(expense.amount).toLocaleString()}</td>
                    <td>{expense.description}</td>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td><button style={styles.deleteButton} onClick={() => deleteExpense(expense.id)}>Delete</button></td>
                  </tr>
                ))}
              </Table>
            </Section>
          </>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === "customers" && (
          <Section title="All Customers & Ledger">
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Current Balance</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
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
                          <span style={{ backgroundColor: "#FFEBEE", color: "#E74C3C", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>To Pay: ₹{c.balance.toLocaleString()}</span> : 
                         c.balance < 0 ? 
                          <span style={{ backgroundColor: "#E8F5E9", color: "#27AE60", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>To Receive: ₹{Math.abs(c.balance).toLocaleString()}</span> :
                          <span style={{ backgroundColor: "#EEEEEE", color: "#666", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>Settled</span>
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
          </Section>
        )}

        {/* VENDORS TAB */}
        {activeTab === "vendors" && (
          <Section title="All Vendors & Ledger">
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Phone</th>
                    <th>Current Balance</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
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
                          <span style={{ backgroundColor: "#FFEBEE", color: "#E74C3C", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>To Pay: ₹{v.balance.toLocaleString()}</span> : 
                         v.balance < 0 ? 
                          <span style={{ backgroundColor: "#E8F5E9", color: "#27AE60", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>To Receive: ₹{Math.abs(v.balance).toLocaleString()}</span> :
                          <span style={{ backgroundColor: "#EEEEEE", color: "#666", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>Settled</span>
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
          </Section>
        )}

        {/* CUSTOMER LEDGER TAB */}
        {activeTab === "customerLedger" && selectedCustomer && (
          <Section title={`Complete Ledger: ${selectedCustomer.name} (${selectedCustomer.phone})`}>
            <button style={styles.backButton} onClick={() => setActiveTab("customers")}>← Back to Customers</button>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Sale Amount (Debit)</th>
                    <th>Payment/Return (Credit)</th>
                    <th>Balance</th>
                    <th>Payment Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {customerLedger.map((entry, idx) => (
                    <tr key={idx} style={{ backgroundColor: entry.paymentStatus === "paid" ? "#E8F5E9" : entry.type === "sale" && entry.paymentStatus === "unpaid" ? "#FFF8E1" : "white" }}>
                      <td>{new Date(entry.date).toLocaleString()}</td>
                      <td style={{ fontWeight: "bold" }}>
                        {entry.type === "sale" ? "💰 SALE" : entry.type === "payment" ? "💵 PAYMENT" : "↩️ RETURN"}
                      </td>
                      <td style={{ color: "#E74C3C", fontWeight: entry.debit > 0 ? "bold" : "normal" }}>
                        {entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : "-"}
                      </td>
                      <td style={{ color: "#27AE60", fontWeight: entry.credit > 0 ? "bold" : "normal" }}>
                        {entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : "-"}
                       </td>
                      <td style={{ fontWeight: "bold", color: entry.balance > 0 ? "#E74C3C" : entry.balance < 0 ? "#27AE60" : "#333" }}>
                        ₹{entry.balance.toLocaleString()}
                       </td>
                      <td>
                        {entry.paymentStatus === "paid" ? 
                          <span style={{ color: "#27AE60" }}>✓ Paid</span> : 
                          <span style={{ color: "#E74C3C" }}>⏳ Unpaid</span>
                        }
                       </td>
                      <td>{entry.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 20, padding: 20, background: "linear-gradient(135deg, #E8F5E9, #C8E6C9)", borderRadius: 16 }}>
              <strong>Current Balance: </strong>
              <span style={{ fontSize: 24, fontWeight: "bold", color: customerLedger[customerLedger.length - 1]?.balance > 0 ? "#E74C3C" : customerLedger[customerLedger.length - 1]?.balance < 0 ? "#27AE60" : "#333" }}>
                ₹{Math.abs(customerLedger[customerLedger.length - 1]?.balance || 0).toLocaleString()}
              </span>
            </div>
          </Section>
        )}

        {/* VENDOR LEDGER TAB */}
        {activeTab === "vendorLedger" && selectedVendor && (
          <Section title={`Complete Ledger: ${selectedVendor.name} (${selectedVendor.phone})`}>
            <button style={styles.backButton} onClick={() => setActiveTab("vendors")}>← Back to Vendors</button>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Payment/Return (Debit)</th>
                    <th>Purchase Amount (Credit)</th>
                    <th>Balance</th>
                    <th>Payment Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorLedger.map((entry, idx) => (
                    <tr key={idx} style={{ backgroundColor: entry.paymentStatus === "paid" ? "#E8F5E9" : entry.type === "purchase" && entry.paymentStatus === "unpaid" ? "#FFF8E1" : "white" }}>
                      <td>{new Date(entry.date).toLocaleString()} </td>
                      <td style={{ fontWeight: "bold" }}>
                        {entry.type === "purchase" ? "📦 PURCHASE" : entry.type === "payment" ? "💵 PAYMENT" : "↩️ RETURN"}
                       </td>
                      <td style={{ color: "#27AE60", fontWeight: entry.debit > 0 ? "bold" : "normal" }}>
                        {entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : "-"}
                       </td>
                      <td style={{ color: "#E74C3C", fontWeight: entry.credit > 0 ? "bold" : "normal" }}>
                        {entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : "-"}
                       </td>
                      <td style={{ fontWeight: "bold", color: entry.balance > 0 ? "#E74C3C" : entry.balance < 0 ? "#27AE60" : "#333" }}>
                        ₹{entry.balance.toLocaleString()}
                       </td>
                      <td>
                        {entry.paymentStatus === "paid" ? 
                          <span style={{ color: "#27AE60" }}>✓ Paid</span> : 
                          <span style={{ color: "#E74C3C" }}>⏳ Unpaid</span>
                        }
                       </td>
                      <td>{entry.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 20, padding: 20, background: "linear-gradient(135deg, #E8F5E9, #C8E6C9)", borderRadius: 16 }}>
              <strong>Current Balance: </strong>
              <span style={{ fontSize: 24, fontWeight: "bold", color: vendorLedger[vendorLedger.length - 1]?.balance > 0 ? "#E74C3C" : vendorLedger[vendorLedger.length - 1]?.balance < 0 ? "#27AE60" : "#333" }}>
                ₹{Math.abs(vendorLedger[vendorLedger.length - 1]?.balance || 0).toLocaleString()}
              </span>
            </div>
          </Section>
        )}
      </div>

      {/* ANALYTICS MODAL */}
      {showAnalytics && (
        <div style={styles.modalOverlay} onClick={() => setShowAnalytics(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>📊 Sales Analytics</h2>
              <button style={styles.modalClose} onClick={() => setShowAnalytics(false)}>×</button>
            </div>
            
            <div style={styles.filterGroup}>
              <button onClick={() => handleAnalyticsFilter("today")} style={{ ...styles.filterButton, backgroundColor: analyticsFilter === "today" ? "var(--BalaJi-sage)" : "#f0f0f0" }}>Today</button>
              <button onClick={() => handleAnalyticsFilter("week")} style={{ ...styles.filterButton, backgroundColor: analyticsFilter === "week" ? "var(--BalaJi-sage)" : "#f0f0f0" }}>This Week</button>
              <button onClick={() => handleAnalyticsFilter("month")} style={{ ...styles.filterButton, backgroundColor: analyticsFilter === "month" ? "var(--BalaJi-sage)" : "#f0f0f0" }}>This Month</button>
              <button onClick={() => handleAnalyticsFilter("year")} style={{ ...styles.filterButton, backgroundColor: analyticsFilter === "year" ? "var(--BalaJi-sage)" : "#f0f0f0" }}>This Year</button>
              <button onClick={() => setAnalyticsFilter("custom")} style={{ ...styles.filterButton, backgroundColor: analyticsFilter === "custom" ? "var(--BalaJi-sage)" : "#f0f0f0" }}>Custom</button>
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
                      <thead>
                        <tr><th>Date</th><th>Customer</th><th>Amount</th><th>Status</th></tr>
                      </thead>
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
function Card({ title, value, icon, color }) {
  return (
    <div style={styles.card}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <h3 style={{ margin: 0, fontSize: 14, color: "#666", letterSpacing: 1 }}>{title}</h3>
      <h2 style={{ margin: "8px 0 0", color: color || "var(--BalaJi-text-dark)", fontSize: 22 }}>{value || 0}</h2>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

function Table({ headers, children }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  container: { background: "#F2EDE4", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" },
  premiumHeader: { background: "white", padding: "16px 0", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", borderBottom: "3px solid #9BB875" },
  tabsWrapper: { background: "white", borderBottom: "1px solid #E0D8CA", marginBottom: 30 },
  tabs: { display: "flex", flexWrap: "wrap", gap: 5, padding: "10px 0" },
  tab: { padding: "10px 24px", background: "transparent", border: "none", borderRadius: 50, cursor: "pointer", fontWeight: 500, transition: "all 0.3s" },
  activeTab: { background: "#9BB875", color: "white" },
  section: { background: "white", marginTop: 25, padding: 25, borderRadius: 24, boxShadow: "0 5px 20px rgba(0,0,0,0.05)" },
  sectionTitle: { fontSize: "1.5rem", fontWeight: 600, color: "#2C3E2F", marginBottom: 20, fontFamily: "'Playfair Display', serif", borderLeft: "4px solid #9BB875", paddingLeft: 15 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 30 },
  card: { background: "white", padding: 20, borderRadius: 20, textAlign: "center", boxShadow: "0 5px 15px rgba(0,0,0,0.05)", transition: "transform 0.3s", cursor: "pointer", border: "1px solid rgba(155,184,117,0.2)" },
  input: { padding: "12px 16px", marginBottom: 0, borderRadius: 16, border: "2px solid #E0D8CA", fontSize: 14, fontFamily: "'Poppins', sans-serif", transition: "all 0.3s", outline: "none" },
  formRow: { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" },
  button: { padding: "12px 24px", background: "linear-gradient(135deg, #9BB875, #7A9B58)", color: "white", border: "none", borderRadius: 50, cursor: "pointer", fontWeight: 600, transition: "all 0.3s" },
  deleteButton: { background: "#E74C3C", color: "white", border: "none", padding: "6px 12px", borderRadius: 12, cursor: "pointer", fontSize: 12 },
  smallButton: { background: "#9BB875", color: "white", border: "none", padding: "6px 12px", borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: 500 },
  backButton: { background: "#6c757d", color: "white", border: "none", padding: "8px 20px", borderRadius: 50, cursor: "pointer", marginBottom: 20, fontWeight: 500 },
  quickButton: { padding: "12px 24px", background: "linear-gradient(135deg, #9BB875, #7A9B58)", color: "white", border: "none", borderRadius: 50, cursor: "pointer", fontWeight: 600 },
  quickButtonSecondary: { padding: "12px 24px", background: "white", color: "#2C3E2F", border: "2px solid #9BB875", borderRadius: 50, cursor: "pointer", fontWeight: 600 },
  quickButtonAnalytics: { padding: "12px 24px", background: "linear-gradient(135deg, #3A7BD5, #2C5F8A)", color: "white", border: "none", borderRadius: 50, cursor: "pointer", fontWeight: 600 },
  table: { width: "100%", borderCollapse: "collapse", borderRadius: 16, overflow: "hidden" },
  tableTh: { border: "1px solid #E0D8CA", padding: 12, textAlign: "left", background: "#F2EDE4", fontWeight: 600 },
  tableTd: { border: "1px solid #E0D8CA", padding: 12 },
  loader: { textAlign: "center", padding: 40, fontSize: 18, color: "#9BB875" },
  loginContainer: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #F2EDE4, #E0D8CA)" },
  loginCard: { width: 380, background: "white", padding: 40, borderRadius: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", textAlign: "center" },
  statusBadge: { padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalContent: { background: "white", borderRadius: 24, padding: 30, maxWidth: 900, width: "90%", maxHeight: "80vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 15, borderBottom: "2px solid #F2EDE4" },
  modalClose: { background: "none", border: "none", fontSize: 32, cursor: "pointer", color: "#666" },
  filterGroup: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 },
  filterButton: { padding: "8px 20px", border: "none", borderRadius: 50, cursor: "pointer", fontWeight: 500, transition: "all 0.3s" },
  customDateRange: { display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" },
  analyticsStats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 15, marginBottom: 25 },
  analyticsCard: { background: "#F9F7F2", padding: 15, borderRadius: 16, textAlign: "center" },
  analyticsCardIcon: { fontSize: 28, marginBottom: 8 }
};

// Add hover effect styles via global style injection
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .home button:hover { transform: translateY(-2px); }
  .home .card:hover { transform: translateY(-5px); }
  input:focus, select:focus, textarea:focus { border-color: #9BB875 !important; outline: none; }
`;
document.head.appendChild(styleSheet);