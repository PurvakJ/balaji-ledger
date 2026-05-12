// components/PurchaseManagement.js
import React, { useState } from 'react';
import { addPurchase, addPurchaseReturn, payPendingBill } from '../services/api';

const PurchaseManagement = ({ suppliers, onPartyUpdate }) => {
  const [purchaseType, setPurchaseType] = useState('purchase');
  const [formData, setFormData] = useState({
    supplierName: '',
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
    
    if (purchaseType === 'purchase') {
      result = await addPurchase(formData);
    } else if (purchaseType === 'return') {
      result = await addPurchaseReturn(formData);
    } else if (purchaseType === 'payment') {
      result = await payPendingBill({
        partyName: formData.supplierName,
        phone: formData.phone,
        partyType: 'supplier',
        amount: formData.paidAmount,
        note: formData.reason
      });
    }
    
    if (result.success) {
      alert(`${purchaseType} recorded successfully!`);
      setFormData({
        supplierName: '',
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
      <h2>Purchase Management</h2>
      <div className="type-selector">
        <button onClick={() => setPurchaseType('purchase')}>Add Purchase</button>
        <button onClick={() => setPurchaseType('return')}>Purchase Return</button>
        <button onClick={() => setPurchaseType('payment')}>Make Payment</button>
      </div>

      <form onSubmit={handleSubmit} className="management-form">
        <div className="form-group">
          <label>Supplier Name:</label>
          <input
            type="text"
            name="supplierName"
            value={formData.supplierName}
            onChange={handleChange}
            list="suppliers"
            required
          />
          <datalist id="suppliers">
            {suppliers.map((supplier, idx) => (
              <option key={idx} value={supplier.name} />
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

        {purchaseType === 'purchase' && (
          <>
            <div className="form-group">
              <label>Purchase Amount:</label>
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

        {(purchaseType === 'return' || purchaseType === 'payment') && (
          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              name={purchaseType === 'return' ? 'amount' : 'paidAmount'}
              value={purchaseType === 'return' ? formData.amount : formData.paidAmount}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {(purchaseType === 'return' || purchaseType === 'payment') && (
          <div className="form-group">
            <label>Reason/Note:</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required={purchaseType === 'return'}
            />
          </div>
        )}

        <button type="submit" className="submit-btn">
          Submit {purchaseType}
        </button>
      </form>
    </div>
  );
};

export default PurchaseManagement;