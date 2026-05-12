// components/SalesManagement.js
import React, { useState } from 'react';
import { addSale, addSaleReturn, payPendingBill } from '../services/api';

const SalesManagement = ({ customers, onPartyUpdate }) => {
  const [saleType, setSaleType] = useState('sale');
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    amount: '',
    status: 'paid',
    paidAmount: '0',
    reason: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    
    if (saleType === 'sale') {
      result = await addSale(formData);
    } else if (saleType === 'return') {
      result = await addSaleReturn(formData);
    } else if (saleType === 'payment') {
      result = await payPendingBill({
        partyName: formData.customerName,
        phone: formData.phone,
        partyType: 'customer',
        amount: formData.paidAmount,
        note: formData.reason
      });
    }
    
    if (result.success) {
      alert(`${saleType} recorded successfully!`);
      setFormData({
        customerName: '',
        phone: '',
        amount: '',
        status: 'paid',
        paidAmount: '0',
        reason: ''
      });
      onPartyUpdate();
    } else {
      alert('Error: ' + result.error);
    }
  };

  return (
    <div className="management-container">
      <h2>Sales Management</h2>
      <div className="type-selector">
        <button onClick={() => setSaleType('sale')}>Add Sale</button>
        <button onClick={() => setSaleType('return')}>Sale Return</button>
        <button onClick={() => setSaleType('payment')}>Receive Payment</button>
      </div>

      <form onSubmit={handleSubmit} className="management-form">
        <div className="form-group">
          <label>Customer Name:</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            list="customers"
            required
          />
          <datalist id="customers">
            {customers.map((customer, idx) => (
              <option key={idx} value={customer.name} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        {saleType === 'sale' && (
          <>
            <div className="form-group">
              <label>Sale Amount:</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            {formData.status === 'partial' && (
              <div className="form-group">
                <label>Paid Amount:</label>
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </>
        )}

        {(saleType === 'return' || saleType === 'payment') && (
          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              name={saleType === 'return' ? 'amount' : 'paidAmount'}
              value={saleType === 'return' ? formData.amount : formData.paidAmount}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {(saleType === 'return' || saleType === 'payment') && (
          <div className="form-group">
            <label>Reason/Note:</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required={saleType === 'return'}
            />
          </div>
        )}

        <button type="submit" className="submit-btn">
          Submit {saleType}
        </button>
      </form>
    </div>
  );
};

export default SalesManagement;