import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Camera, Image, EyeOff, Lock, Eye, Plus, Calendar, Tag, Trash } from 'lucide-react';

const MOCK_PHOTOS = {
  'hse-inc-1': [
    { id: 'p-1', name: 'torque_wrench_broken.jpg', tag: 'after-action', date: '2026-07-15T09:00:00Z', isRestricted: false, url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=300', description: 'Recovered torque wrench on the deck showing damaged gear grip.' }
  ],
  'hse-inc-2': [
    { id: 'p-2', name: 'thermal_flare_module_b.jpg', tag: 'during-action', date: '2026-07-19T22:20:00Z', isRestricted: true, url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=300', description: 'Thermal camera screenshot of Module B rack temperature spike.' }
  ],
  'hse-inc-3': [
    { id: 'p-3', name: 'leak_spot_transformer.jpg', tag: 'before-action', date: '2026-07-10T11:10:00Z', isRestricted: false, url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=300', description: 'Radiator flange oil weeping spot on TRF-01.' },
    { id: 'p-4', name: 'remediation_completed.jpg', tag: 'after-action', date: '2026-07-25T14:00:00Z', isRestricted: false, url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=300', description: 'Excavated soil replaced with fresh ballast.' }
  ],
  'hse-inc-4': [
    { id: 'p-5', name: 'ctv_vessel_ladder.jpg', tag: 'during-action', date: '2026-07-05T07:35:00Z', isRestricted: false, url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=300', description: 'View of the offshore turbine boat landing buffer ladder.' }
  ],
  'hse-inc-5': [
    { id: 'p-6', name: 'golden_eagle_necropsy.jpg', tag: 'before-action', date: '2026-07-01T07:45:00Z', isRestricted: true, url: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&q=80&w=300', description: 'Eagle carcass location near turbine foundation. (Protected species location restricted)' }
  ]
};

const EvidenceGallery = ({ incidentId, readOnly }) => {
  const { canViewSensitiveInfo } = useUser();
  const [photoList, setPhotoList] = useState(() => {
    return MOCK_PHOTOS[incidentId] || [];
  });
  const [fileTag, setFileTag] = useState('before-action');
  const [isRestricted, setIsRestricted] = useState(false);
  const [description, setDescription] = useState('');
  const [uploadError, setUploadError] = useState('');

  const hasSensitiveAccess = canViewSensitiveInfo();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verify size (e.g. limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const newPhoto = {
        id: `p-new-${Date.now()}`,
        name: file.name,
        tag: fileTag,
        date: new Date().toISOString(),
        isRestricted: isRestricted,
        url: event.target.result,
        description: description || 'User uploaded evidence.'
      };

      setPhotoList(prev => [...prev, newPhoto]);
      setDescription('');
      setIsRestricted(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (id) => {
    setPhotoList(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 className="h2-title" style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Image size={18} style={{ color: 'var(--accent-cyan)' }} />
        Photograph & Video Evidence
      </h3>

      {!readOnly && (
        <div style={{ background: 'rgba(0, 0, 0, 0.15)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>
            Upload Supporting Evidence
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Evidence Tag</label>
              <select className="form-select" value={fileTag} onChange={(e) => setFileTag(e.target.value)}>
                <option value="before-action">Before Containment Action</option>
                <option value="during-action">During Action / Intervention</option>
                <option value="after-action">After Remediation / Verification</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px' }}>
              <input 
                type="checkbox" 
                id="check-restricted"
                checked={isRestricted}
                onChange={(e) => setIsRestricted(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="check-restricted" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={14} style={{ color: 'var(--accent-gold)' }} /> Mark as Sensitive (Restricted Access)
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Brief Description</label>
            <input 
              type="text" 
              className="form-control" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Gasket flange leakage source closeup"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label 
              className="btn btn-secondary" 
              style={{ padding: '8px 16px', fontSize: '0.85rem', border: '1px dashed var(--accent-cyan)', color: 'var(--accent-cyan)' }}
            >
              <Plus size={14} /> Choose File
              <input type="file" accept="image/*,video/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max file size: 10MB. Formats: JPG, PNG, MP4.</span>
          </div>

          {uploadError && (
            <p style={{ color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: '8px' }}>{uploadError}</p>
          )}
        </div>
      )}

      {photoList.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
          No evidence files uploaded for this incident.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '18px' }}>
          {photoList.map(p => {
            const isMasked = p.isRestricted && !hasSensitiveAccess;

            return (
              <div key={p.id} className="glass-panel" style={{
                borderRadius: '8px', 
                overflow: 'hidden', 
                background: 'rgba(0, 0, 0, 0.2)',
                border: p.isRestricted ? '1px solid rgba(251, 191, 36, 0.25)' : '1px solid var(--border-color)'
              }}>
                <div style={{ height: '140px', background: '#070a12', position: 'relative', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                  {isMasked ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)' }}>
                      <EyeOff size={32} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Restricted Evidence</span>
                    </div>
                  ) : (
                    <img 
                      src={p.url} 
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        // Fallback icon if image doesn't load or is a generic url
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {p.isRestricted && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'rgba(251, 191, 36, 0.9)',
                      color: '#070a12',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Lock size={10} /> SENSITIVE
                    </div>
                  )}

                  <span style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    color: 'white',
                    fontWeight: 600
                  }}>
                    {p.tag}
                  </span>
                </div>

                <div style={{ padding: '12px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={p.name}>
                    {p.name}
                  </span>
                  
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', minHeight: '36px', lineBreak: 'anywhere' }}>
                    {isMasked ? 'You do not have the safety authorization clearance required to view this statement or file.' : p.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={10} /> {new Date(p.date).toLocaleDateString()}
                    </span>

                    {!readOnly && (
                      <button 
                        onClick={() => handleRemove(p.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}
                      >
                        <Trash size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EvidenceGallery;
