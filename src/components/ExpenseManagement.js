// components/ExpenseManagement.js
import React, { useState } from 'react';
import { addExpense } from '../services/api';

const ExpenseManagement = () => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addExpense(formData);
    
    if (result.success) {
      alert('Expense added successfully!');
      setFormData({
        category: '',
        description: '',
        amount: ''
      });
    } else {
      alert('Error: ' + result.error);
    }
  };

  return (
    <div className="management-container">
      <h2>Personal Expenses</h2>
      <form onSubmit={handleSubmit} className="management-form">
        <div className="form-group">
          <label>Category:</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Amount:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Add Expense</button>
      </form>
    </div>
  );
};

export default ExpenseManagement;