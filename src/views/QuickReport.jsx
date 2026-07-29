import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useUser } from '../context/UserContext';
import { X, Camera, AlertCircle, Save, ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="custom-select-container" style={{ position: 'relative', width: '100%' }}>
      <div 
        className="form-select" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundImage: 'none',
          paddingRight: '14px'
        }}
      >
        <span>{selectedOption?.label || selectedOption?.value}</span>
        <ChevronDown size={16} style={{ 
          color: 'var(--text-secondary)',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s ease',
          flexShrink: 0
        }} />
      </div>
      
      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setIsOpen(false)} />
          
          <div className="glass-panel" style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 999,
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
            overflow: 'hidden',
            maxHeight: '220px',
            overflowY: 'auto',
            padding: 0
          }}>
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  fontSize: '0.88rem',
                  color: opt.value === value ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  background: opt.value === value ? 'rgba(18, 78, 70, 0.05)' : 'transparent',
                  fontWeight: opt.value === value ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderLeft: opt.value === value ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (opt.value !== value) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (opt.value !== value) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {opt.label || opt.value}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const QuickReport = ({ onClose, onSaveSuccess, defaultType = 'Safety Incident' }) => {
  const { sites, addIncident } = useDatabase();
  const { currentUser } = useUser();

  const [category, setCategory] = useState(defaultType === 'Incident' ? 'Safety Incident' : defaultType);
  const [site, setSite] = useState(sites[0]?.id || '');
  const [locationDescription, setLocationDescription] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [potentialConsequence, setPotentialConsequence] = useState('2'); // Moderate
  const [likelihood, setLikelihood] = useState('3'); // Possible
  const [immediateActionText, setImmediateActionText] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  const handleSubmit = (e, isDraft = false) => {
    e.preventDefault();
    if (!title || !description || !site) {
      alert('Please complete the mandatory fields (Title, Description, and Site).');
      return;
    }

    const payload = {
      title,
      description,
      category,
      subcategory: category === 'Near Miss' ? 'Field Near Miss' : 'Quick Report Event',
      incidentType: category === 'Near Miss' || category === 'Unsafe Act' || category === 'Unsafe Condition' ? 'Near Miss' : 'Incident',
      site,
      locationDescription,
      reportedBy: anonymous ? 'Anonymous Reporter' : currentUser.name,
      reporterOrganisation: anonymous ? 'N/A' : currentUser.employer,
      reporterType: anonymous ? 'Visitor' : (currentUser.role.includes('Contractor') ? 'Contractor' : 'Employee'),
      actualDate: new Date().toISOString(),
      potentialConsequence,
      likelihood,
      actualConsequence: isDraft ? '0' : '1',
      immediateActions: immediateActionText ? [{
        id: `ia-quick-${Date.now()}`,
        description: immediateActionText,
        owner: currentUser.name,
        dateTime: new Date().toISOString(),
        status: 'Completed',
        verification: 'Reported during quick submission'
      }] : []
    };

    addIncident(payload, isDraft);
    onSaveSuccess();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 100
    }} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div style={{
        width: '100%',
        maxWidth: '700px',
        height: '100%',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.08)',
        position: 'relative',
        borderLeft: '1px solid var(--border-color)',
        animation: 'slide-in-drawer 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}>

        {/* Header */}
        <div style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#2A738F',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
          zIndex: 10
        }}>
          <h2 className="h2-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', color: '#ffffff' }}>
            <AlertCircle size={20} style={{ color: '#ffffff' }} />
            Quick Incident Reporting
          </h2>
          <button 
            className="modal-close" 
            onClick={onClose} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#ffffff',
              opacity: 0.85,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={(e) => handleSubmit(e, false)} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            <div className="form-group">
              <label className="form-label">Incident Category *</label>
              <CustomSelect 
                value={category} 
                onChange={setCategory} 
                options={[
                  { value: 'Safety Incident', label: 'Safety Incident' },
                  { value: 'Near Miss', label: 'Near Miss' },
                  { value: 'Environmental Event', label: 'Environmental Event' },
                  { value: 'Other HSE', label: 'Other HSE' }
                ]}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Site / Facility Location *</label>
              <CustomSelect 
                value={site} 
                onChange={setSite} 
                options={sites.map(s => ({ value: s.id, label: `${s.name} (${s.id})` }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Incident Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Damaged electrical socket in control cabin"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Incident Description *</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '120px' }}
                placeholder="Describe what occurred, who was present, and what equipment was involved..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location Details</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Control room building, north wall"
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Severity</label>
              <CustomSelect 
                value={potentialConsequence} 
                onChange={setPotentialConsequence} 
                options={[
                  { value: '1', label: '1 - Insignificant (No injury/damage)' },
                  { value: '2', label: '2 - Minor (Minor first-aid, low cost)' },
                  { value: '3', label: '3 - Moderate (Medical treatment, moderate cost)' },
                  { value: '4', label: '4 - Major (Lost work-time, high cost)' },
                  { value: '5', label: '5 - Critical (Fatality, severe impact)' }
                ]}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Likelihood of Recurrence</label>
              <CustomSelect 
                value={likelihood} 
                onChange={setLikelihood} 
                options={[
                  { value: '1', label: '1 - Rare' },
                  { value: '2', label: '2 - Unlikely' },
                  { value: '3', label: '3 - Possible' },
                  { value: '4', label: '4 - Likely' },
                  { value: '5', label: '5 - Almost Certain' }
                ]}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Immediate Action Taken</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Work stopped, tape put around electrical socket"
                value={immediateActionText}
                onChange={(e) => setImmediateActionText(e.target.value)}
              />
            </div>

            {category === 'Near Miss' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', marginTop: '10px' }}>
                <input
                  type="checkbox"
                  id="anon"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="anon" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Submit anonymously (Confidential Near Miss)
                </label>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', marginBottom: '10px' }}>
              <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.82rem', cursor: 'pointer', border: '1px solid var(--border-color)' }}>
                <Camera size={15} />
                {photoUploaded ? 'Photo Attached' : 'Attach Photo'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => setPhotoUploaded(true)} />
              </label>
            </div>
          </div>

          {/* Sticky Bottom Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              Cancel
            </button>
            <button type="button" onClick={(e) => handleSubmit(e, true)} className="btn btn-secondary" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Save size={14} /> Save Draft
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickReport;
