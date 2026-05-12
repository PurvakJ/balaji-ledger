// ============================ APP.JS ============================
// React Frontend for Sales & Purchase Ledger System
// UPDATED WITH IMPROVED LEDGER VIEW

import React, { useState } from "react";

// ================= API URL =================
// REPLACE WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
const API_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";

export default function App() {
  // ================= STATES =================
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({});
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
      setLoggedIn(true);
      loadDashboard();
      loadAllData();
    } else {
      alert(res?.message || "Login Failed");
    }
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

  // ================= LOAD STATS =================
  const loadStats = async () => {
    const res = await apiCall({ action: "getDashboardStats" });
    if (res?.success) setStats(res.data);
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
          <h1>Ledger Login</h1>
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
          <p style={{ textAlign: "center", marginTop: 10 }}>Default: admin / admin123</p>
        </div>
      </div>
    );
  }

  // ================= MAIN APP =================
  return (
    <div style={styles.container}>
      <h1>Sales & Purchase Ledger System</h1>

      {/* Navigation Tabs */}
      <div style={styles.tabs}>
        {["dashboard", "sales", "purchases", "expenses", "customers", "vendors", "customerLedger", "vendorLedger"].map(tab => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.activeTab : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "customerLedger" && selectedCustomer ? `Ledger: ${selectedCustomer.name}` : 
             tab === "vendorLedger" && selectedVendor ? `Ledger: ${selectedVendor.name}` :
             tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
          </button>
        ))}
      </div>

      {loading && <div style={styles.loader}>Loading...</div>}

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <>
          <div style={styles.statsGrid}>
            <Card title="Total Sales" value={`₹${stats.totalSales || 0}`} />
            <Card title="Total Purchases" value={`₹${stats.totalPurchases || 0}`} />
            <Card title="Total Expenses" value={`₹${stats.totalExpenses || 0}`} />
            <Card title="Net Profit" value={`₹${stats.netProfit || 0}`} color={stats.netProfit >= 0 ? "green" : "red"} />
            <Card title="Customer Pending" value={`₹${stats.totalCustomerPending || 0}`} color="orange" />
            <Card title="Vendor Pending" value={`₹${stats.totalVendorPending || 0}`} color="orange" />
            <Card title="Total Customers" value={stats.totalCustomers || 0} />
            <Card title="Total Vendors" value={stats.totalVendors || 0} />
          </div>

          {/* Quick Actions */}
          <div style={styles.section}>
            <h2>Quick Actions</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={styles.quickButton} onClick={() => setActiveTab("sales")}>➕ Add Sale</button>
              <button style={styles.quickButton} onClick={() => setActiveTab("purchases")}>📦 Add Purchase</button>
              <button style={styles.quickButton} onClick={() => setActiveTab("expenses")}>💸 Add Expense</button>
              <button style={styles.quickButtonSecondary} onClick={() => setActiveTab("customers")}>👥 View Customers</button>
              <button style={styles.quickButtonSecondary} onClick={() => setActiveTab("vendors")}>🏢 View Vendors</button>
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
                  <td>{sale.customer_name}</td>
                  <td>{sale.phone}</td>
                  <td>₹{sale.amount}</td>
                  <td style={{ color: sale.status === "paid" ? "green" : "red" }}>{sale.status}</td>
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
                  <td>{purchase.vendor_name}</td>
                  <td>{purchase.phone}</td>
                  <td>₹{purchase.amount}</td>
                  <td style={{ color: purchase.status === "paid" ? "green" : "red" }}>{purchase.status}</td>
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
                  <td>{expense.category}</td>
                  <td>₹{expense.amount}</td>
                  <td>{expense.description}</td>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td><button style={styles.deleteButton} onClick={() => deleteExpense(expense.id)}>Delete</button></td>
                </tr>
              ))}
            </Table>
          </Section>
        </>
      )}

      {/* CUSTOMERS TAB - Shows ALL customers with their ledger */}
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
                    <td style={{ color: c.balance > 0 ? "red" : c.balance < 0 ? "green" : "#333", fontWeight: "bold" }}>
                      ₹{Math.abs(c.balance)}
                    </td>
                    <td>
                      {c.balance > 0 ? 
                        <span style={{ color: "red", background: "#ffebee", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>To Pay: ₹{c.balance}</span> : 
                       c.balance < 0 ? 
                        <span style={{ color: "green", background: "#e8f5e9", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>To Receive: ₹{Math.abs(c.balance)}</span> :
                        <span style={{ color: "#666", background: "#eee", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>Settled</span>
                      }
                    </td>
                    <td>
                      <button style={styles.smallButton} onClick={() => viewCustomerLedger(c)}>
                        View Full Ledger
                      </button>
                    </td>
                  </tr>
                ))}
                {customerBalances.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: "center" }}>No customers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* VENDORS TAB - Shows ALL vendors with their ledger */}
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
                    <td style={{ color: v.balance > 0 ? "red" : v.balance < 0 ? "green" : "#333", fontWeight: "bold" }}>
                      ₹{Math.abs(v.balance)}
                    </td>
                    <td>
                      {v.balance > 0 ? 
                        <span style={{ color: "red", background: "#ffebee", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>To Pay: ₹{v.balance}</span> : 
                       v.balance < 0 ? 
                        <span style={{ color: "green", background: "#e8f5e9", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>To Receive: ₹{Math.abs(v.balance)}</span> :
                        <span style={{ color: "#666", background: "#eee", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>Settled</span>
                      }
                    </td>
                    <td>
                      <button style={styles.smallButton} onClick={() => viewVendorLedger(v)}>
                        View Full Ledger
                      </button>
                    </td>
                  </tr>
                ))}
                {vendorBalances.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: "center" }}>No vendors found</td></tr>
                )}
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
                  <tr key={idx} style={{ backgroundColor: entry.paymentStatus === "paid" ? "#e8f5e9" : entry.type === "sale" && entry.paymentStatus === "unpaid" ? "#fff3e0" : "white" }}>
                    <td>{new Date(entry.date).toLocaleString()}</td>
                    <td style={{ fontWeight: "bold" }}>
                      {entry.type === "sale" ? "💰 SALE" : entry.type === "payment" ? "💵 PAYMENT" : "↩️ RETURN"}
                    </td>
                    <td style={{ color: "red", fontWeight: entry.debit > 0 ? "bold" : "normal" }}>
                      {entry.debit > 0 ? `₹${entry.debit}` : "-"}
                    </td>
                    <td style={{ color: "green", fontWeight: entry.credit > 0 ? "bold" : "normal" }}>
                      {entry.credit > 0 ? `₹${entry.credit}` : "-"}
                    </td>
                    <td style={{ fontWeight: "bold", color: entry.balance > 0 ? "red" : entry.balance < 0 ? "green" : "#333" }}>
                      ₹{entry.balance}
                    </td>
                    <td>
                      {entry.paymentStatus === "paid" ? 
                        <span style={{ color: "green" }}>✓ Paid</span> : 
                        <span style={{ color: "red" }}>⏳ Unpaid</span>
                      }
                    </td>
                    <td>{entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 15, padding: 15, background: "#e3f2fd", borderRadius: 8 }}>
            <strong>Current Balance: </strong>
            <span style={{ fontSize: 20, fontWeight: "bold", color: customerLedger[customerLedger.length - 1]?.balance > 0 ? "red" : customerLedger[customerLedger.length - 1]?.balance < 0 ? "green" : "#333" }}>
              ₹{Math.abs(customerLedger[customerLedger.length - 1]?.balance || 0)}
            </span>
            <span style={{ marginLeft: 10 }}>
              {customerLedger[customerLedger.length - 1]?.balance > 0 ? 
                "(Customer needs to pay this amount)" : 
               customerLedger[customerLedger.length - 1]?.balance < 0 ? 
                "(Customer has credit - we need to pay them back)" :
                "(Account is fully settled)"}
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
                  <tr key={idx} style={{ backgroundColor: entry.paymentStatus === "paid" ? "#e8f5e9" : entry.type === "purchase" && entry.paymentStatus === "unpaid" ? "#fff3e0" : "white" }}>
                    <td>{new Date(entry.date).toLocaleString()}</td>
                    <td style={{ fontWeight: "bold" }}>
                      {entry.type === "purchase" ? "📦 PURCHASE" : entry.type === "payment" ? "💵 PAYMENT" : "↩️ RETURN"}
                    </td>
                    <td style={{ color: "green", fontWeight: entry.debit > 0 ? "bold" : "normal" }}>
                      {entry.debit > 0 ? `₹${entry.debit}` : "-"}
                    </td>
                    <td style={{ color: "red", fontWeight: entry.credit > 0 ? "bold" : "normal" }}>
                      {entry.credit > 0 ? `₹${entry.credit}` : "-"}
                    </td>
                    <td style={{ fontWeight: "bold", color: entry.balance > 0 ? "red" : entry.balance < 0 ? "green" : "#333" }}>
                      ₹{entry.balance}
                    </td>
                    <td>
                      {entry.paymentStatus === "paid" ? 
                        <span style={{ color: "green" }}>✓ Paid</span> : 
                        <span style={{ color: "red" }}>⏳ Unpaid</span>
                      }
                    </td>
                    <td>{entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 15, padding: 15, background: "#e3f2fd", borderRadius: 8 }}>
            <strong>Current Balance: </strong>
            <span style={{ fontSize: 20, fontWeight: "bold", color: vendorLedger[vendorLedger.length - 1]?.balance > 0 ? "red" : vendorLedger[vendorLedger.length - 1]?.balance < 0 ? "green" : "#333" }}>
              ₹{Math.abs(vendorLedger[vendorLedger.length - 1]?.balance || 0)}
            </span>
            <span style={{ marginLeft: 10 }}>
              {vendorLedger[vendorLedger.length - 1]?.balance > 0 ? 
                "(We need to pay this amount to vendor)" : 
               vendorLedger[vendorLedger.length - 1]?.balance < 0 ? 
                "(Vendor needs to pay us back)" :
                "(Account is fully settled)"}
            </span>
          </div>
        </Section>
      )}
    </div>
  );
}

// ================= COMPONENTS =================
function Card({ title, value, color }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <h2 style={{ color: color || "#333" }}>{value || 0}</h2>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h2>{title}</h2>
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
  container: { padding: 20, background: "#f5f5f5", minHeight: "100vh", fontFamily: "Arial, sans-serif" },
  loginContainer: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f5f5f5" },
  loginCard: { width: 350, background: "#fff", padding: 30, borderRadius: 10, boxShadow: "0 0 10px rgba(0,0,0,0.1)" },
  tabs: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 20, background: "#fff", padding: 10, borderRadius: 10 },
  tab: { padding: "8px 16px", background: "#e0e0e0", border: "none", borderRadius: 5, cursor: "pointer" },
  activeTab: { background: "#1976d2", color: "#fff" },
  section: { background: "#fff", marginTop: 20, padding: 20, borderRadius: 10, boxShadow: "0 0 5px rgba(0,0,0,0.1)" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 20, marginBottom: 20 },
  card: { background: "#fff", padding: 20, borderRadius: 10, textAlign: "center", boxShadow: "0 0 5px rgba(0,0,0,0.1)" },
  input: { padding: 10, marginBottom: 10, borderRadius: 5, border: "1px solid #ccc", flex: 1, minWidth: 150 },
  formRow: { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" },
  button: { padding: 10, background: "#1976d2", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold", minWidth: 120 },
  deleteButton: { background: "red", color: "#fff", border: "none", padding: "5px 10px", borderRadius: 5, cursor: "pointer" },
  smallButton: { background: "#1976d2", color: "#fff", border: "none", padding: "5px 10px", borderRadius: 5, cursor: "pointer" },
  backButton: { background: "#6c757d", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 5, cursor: "pointer", marginBottom: 15 },
  quickButton: { padding: "10px 20px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" },
  quickButtonSecondary: { padding: "10px 20px", background: "#6c757d", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" },
  loader: { textAlign: "center", padding: 20, fontSize: 18, color: "#1976d2" },
};

// Override table cell styles
styles.tableTh = { border: "1px solid #ddd", padding: 8, textAlign: "left", background: "#f2f2f2" };
styles.tableTd = { border: "1px solid #ddd", padding: 8 };