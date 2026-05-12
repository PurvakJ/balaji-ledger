// components/LedgerView.js
import React, { useState } from 'react';
import { getLedger } from '../services/api';

const LedgerView = ({ customers, suppliers }) => {
  const [selectedParty, setSelectedParty] = useState('');
  const [partyType, setPartyType] = useState('customer');
  const [ledgerData, setLedgerData] = useState([]);
  const [phone, setPhone] = useState('');

  const handleSearch = async () => {
    const result = await getLedger(selectedParty, phone, partyType);
    if (result.success) {
      setLedgerData(result.data);
    } else {
      alert('Error fetching ledger');
    }
  };

  const getPartyList = () => {
    return partyType === 'customer' ? customers : suppliers;
  };

  return (
    <div className="ledger-container">
      <h2>Ledger View</h2>
      <div className="ledger-controls">
        <div className="form-group">
          <label>Party Type:</label>
          <select value={partyType} onChange={(e) => setPartyType(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="supplier">Supplier</option>
          </select>
        </div>

        <div className="form-group">
          <label>Select Party:</label>
          <select value={selectedParty} onChange={(e) => {
            const party = getPartyList().find(p => p.name === e.target.value);
            setSelectedParty(e.target.value);
            setPhone(party ? party.phone : '');
          }}>
            <option value="">Select Party</option>
            {getPartyList().map((party, idx) => (
              <option key={idx} value={party.name}>{party.name} - {party.phone}</option>
            ))}
          </select>
        </div>

        <button onClick={handleSearch} className="search-btn">View Ledger</button>
      </div>

      {ledgerData.length > 0 && (
        <div className="ledger-table">
          <h3>Ledger for {selectedParty}</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Debit (₹)</th>
                <th>Credit (₹)</th>
                <th>Balance (₹)</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.map((entry, idx) => (
                <tr key={idx}>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>{entry.type}</td>
                  <td>{entry.debit.toLocaleString()}</td>
                  <td>{entry.credit.toLocaleString()}</td>
                  <td className={entry.balance >= 0 ? 'positive' : 'negative'}>
                    {entry.balance.toLocaleString()}
                  </td>
                  <td>{entry.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LedgerView;