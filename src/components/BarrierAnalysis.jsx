import React, { useState, useEffect } from 'react';
import { Save, ShieldAlert, Plus, Trash } from 'lucide-react';

const SUGGESTED_BARRIERS = [
  'Personal Protective Equipment (PPE)',
  'Lockout/Tagout Isolation Procedure',
  'Permit-to-Work Verification',
  'Physical Guard / Safety Barrier',
  'Equipment Interlock / Shutdown switch',
  'Audible / Visual Safety Alarm',
  'Operational Training / Certifications',
  'Supervisory Oversight / Site Audits',
  'Pre-Job Safety Hazard Assessment',
  'Emergency Response Response Plan'
];

const BarrierAnalysis = ({ initialBarriers = [], onSave, readOnly }) => {
  const [barriers, setBarriers] = useState(initialBarriers || []);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBarriers(initialBarriers || []);
    setSaved(false);
  }, [initialBarriers]);

  const handleAddField = () => {
    setBarriers([...barriers, {
      barrier: SUGGESTED_BARRIERS[0],
      existed: true,
      functioned: false,
      reason: '',
      owner: ''
    }]);
  };

  const handleUpdateField = (idx, key, val) => {
    const updated = barriers.map((b, i) => i === idx ? { ...b, [key]: val } : b);
    setBarriers(updated);
  };

  const handleRemoveField = (idx) => {
    setBarriers(barriers.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSave(barriers);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="h2-title" style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} style={{ color: 'var(--accent-gold)' }} />
          Barrier Function Analysis
        </h3>
        {!readOnly && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleAddField} 
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Plus size={14} /> Add Barrier
            </button>
            <button 
              onClick={handleSave} 
              className="btn btn-primary" 
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              <Save size={14} />
              {saved ? 'Saved!' : 'Save Barriers'}
            </button>
          </div>
        )}
      </div>

      <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '20px' }}>
        Analyze the physical, administrative, or engineering controls that were designed to prevent this category of event.
      </p>

      {barriers.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
          No safety barriers documented yet. Click "Add Barrier" to specify.
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Barrier Name</th>
                <th style={{ width: '12%' }}>Existed?</th>
                <th style={{ width: '12%' }}>Functioned?</th>
                <th style={{ width: '30%' }}>Reason for Failure / Condition</th>
                <th style={{ width: '16%' }}>Owner</th>
                {!readOnly && <th style={{ width: '10%' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {barriers.map((bar, idx) => (
                <tr key={idx}>
                  <td>
                    {readOnly ? (
                      <span style={{ fontWeight: 500 }}>{bar.barrier}</span>
                    ) : (
                      <select 
                        value={bar.barrier} 
                        onChange={(e) => handleUpdateField(idx, 'barrier', e.target.value)}
                        className="form-select"
                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      >
                        {SUGGESTED_BARRIERS.map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                        {!SUGGESTED_BARRIERS.includes(bar.barrier) && (
                          <option value={bar.barrier}>{bar.barrier}</option>
                        )}
                      </select>
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span className={`badge ${bar.existed ? 'badge-green' : 'badge-red'}`}>
                        {bar.existed ? 'Yes' : 'No'}
                      </span>
                    ) : (
                      <select 
                        value={bar.existed ? 'Yes' : 'No'} 
                        onChange={(e) => handleUpdateField(idx, 'existed', e.target.value === 'Yes')}
                        className="form-select"
                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span className={`badge ${bar.functioned ? 'badge-green' : 'badge-red'}`}>
                        {bar.functioned ? 'Yes' : 'No'}
                      </span>
                    ) : (
                      <select 
                        value={bar.functioned ? 'Yes' : 'No'} 
                        onChange={(e) => handleUpdateField(idx, 'functioned', e.target.value === 'Yes')}
                        className="form-select"
                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span style={{ fontSize: '0.85rem' }} className="text-muted">{bar.reason || 'N/A'}</span>
                    ) : (
                      <input 
                        type="text" 
                        value={bar.reason} 
                        onChange={(e) => handleUpdateField(idx, 'reason', e.target.value)}
                        placeholder="Why did it fail?"
                        className="form-control"
                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      <span style={{ fontSize: '0.85rem' }}>{bar.owner || 'N/A'}</span>
                    ) : (
                      <input 
                        type="text" 
                        value={bar.owner} 
                        onChange={(e) => handleUpdateField(idx, 'owner', e.target.value)}
                        placeholder="Owner"
                        className="form-control"
                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      />
                    )}
                  </td>
                  {!readOnly && (
                    <td>
                      <button 
                        onClick={() => handleRemoveField(idx)} 
                        style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '6px' }}
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BarrierAnalysis;
