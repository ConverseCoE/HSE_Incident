import React, { useState, useEffect } from 'react';
import { HelpCircle, Save, ArrowDown } from 'lucide-react';

const FiveWhys = ({ initialData, onSave, readOnly }) => {
  const [problem, setProblem] = useState(initialData?.problem || '');
  const [why1, setWhy1] = useState(initialData?.why1 || '');
  const [why2, setWhy2] = useState(initialData?.why2 || '');
  const [why3, setWhy3] = useState(initialData?.why3 || '');
  const [why4, setWhy4] = useState(initialData?.why4 || '');
  const [why5, setWhy5] = useState(initialData?.why5 || '');
  const [rootCause, setRootCause] = useState(initialData?.rootCause || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProblem(initialData?.problem || '');
    setWhy1(initialData?.why1 || '');
    setWhy2(initialData?.why2 || '');
    setWhy3(initialData?.why3 || '');
    setWhy4(initialData?.why4 || '');
    setWhy5(initialData?.why5 || '');
    setRootCause(initialData?.rootCause || '');
    setSaved(false);
  }, [initialData]);

  const handleSave = () => {
    onSave({ problem, why1, why2, why3, why4, why5, rootCause });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="h2-title" style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Interactive 5 Whys Analysis
        </h3>
        {!readOnly && (
          <button 
            onClick={handleSave} 
            className="btn btn-primary" 
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <Save size={14} />
            {saved ? 'Saved!' : 'Save Chain'}
          </button>
        )}
      </div>

      <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '18px' }}>
        Identify root-causes by asking "Why" sequentially, drilling down from physical effects to organizational gaps.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
        {/* Problem Statement */}
        <div style={{ background: 'rgba(0, 0, 0, 0.15)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px 16px' }}>
          <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--accent-red)', fontWeight: 700 }}>Problem Statement</label>
          <input 
            type="text" 
            value={problem} 
            disabled 
            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', marginTop: '4px', fontSize: '0.9rem' }}
          />
        </div>

        {/* Why Chains */}
        {[
          { label: 'Why 1 (Direct Cause)', value: why1, setter: setWhy1 },
          { label: 'Why 2 (Contributing Factor)', value: why2, setter: setWhy2 },
          { label: 'Why 3 (Underlying Cause)', value: why3, setter: setWhy3 },
          { label: 'Why 4 (Organizational Practice)', value: why4, setter: setWhy4 },
          { label: 'Why 5 (Systemic / Root Cause)', value: why5, setter: setWhy5 },
        ].map((level, idx) => (
          <React.Fragment key={idx}>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0' }}>
              <ArrowDown size={16} className="text-muted" style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px dashed var(--border-color)', 
              borderRadius: '8px', 
              padding: '10px 14px',
              borderLeft: '3px solid var(--accent-cyan)'
            }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{level.label}</label>
              <input 
                type="text" 
                value={level.value} 
                onChange={(e) => level.setter(e.target.value)}
                disabled={readOnly}
                placeholder="Type explanation here..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  marginTop: '4px',
                  fontSize: '0.88rem',
                  outline: 'none',
                  borderBottom: readOnly ? 'none' : '1px solid rgba(255,255,255,0.05)'
                }}
              />
            </div>
          </React.Fragment>
        ))}

        {/* Confirmed Root Cause */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0' }}>
          <ArrowDown size={16} className="text-muted" style={{ color: 'var(--accent-green)' }} />
        </div>
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.05)', 
          border: '1px solid rgba(16, 185, 129, 0.2)', 
          borderRadius: '8px', 
          padding: '12px 16px',
          borderLeft: '4px solid var(--accent-green)'
        }}>
          <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--accent-green)', fontWeight: 700 }}>Identified Root Cause</label>
          <input 
            type="text" 
            value={rootCause} 
            onChange={(e) => setRootCause(e.target.value)}
            disabled={readOnly}
            placeholder="Summarize the final systemic root-cause..."
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-primary)', 
              marginTop: '4px', 
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FiveWhys;
