import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useUser } from '../context/UserContext';
import { 
  BookOpen, 
  Search, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Download, 
  Share2, 
  Users, 
  Check, 
  X, 
  ShieldAlert, 
  Award, 
  Zap, 
  Wind, 
  Sun, 
  Clock, 
  Eye, 
  FileCheck,
  Send
} from 'lucide-react';

const LessonsLearned = ({ onSelectIncident }) => {
  const { incidents } = useDatabase();
  const { currentUser, hasRole, roles } = useUser();

  // Sub-tab Navigation: 'published' | 'pending' | 'tbt' | 'drafts'
  const [activeSubTab, setActiveSubTab] = useState('published');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [selectedAlertForPdf, setSelectedAlertForPdf] = useState(null);

  // Mock initial safety flash database state
  const [safetyFlashes, setSafetyFlashes] = useState([
    {
      id: 'sf-101',
      title: 'Tool Tether Lanyard Failure During Nacelle Work',
      hazardCategory: 'Working at Height',
      site: 'Nordic Wind Farm - Site B',
      incidentNum: 'INC-2026-004',
      publishedDate: '2026-07-20',
      author: 'Elin Nygård (Senior Investigator)',
      status: 'Approved', // 'Draft' | 'Pending Approval' | 'Approved'
      targetAudience: 'All Wind Turbine Technicians & Subcontractors',
      summary: 'A 2.5kg torque wrench slipped from a technician working at 45m height. The tool lanyard snapped at the stitching seam due to hidden UV degradation.',
      rootCause: 'Tool lanyard exceeded 2-year service shelf-life and lacked mandatory pre-use visual inspection tag.',
      dos: [
        'Perform mandatory pre-use pull-test on all tool tethers before ascending.',
        'Verify color-coded annual inspection tag is present on lanyard body.',
        'Use secondary drop nets on deck grating when working overhead.'
      ],
      donts: [
        'Do NOT use tool lanyards manufactured over 24 months ago.',
        'Do NOT attach heavy tools (>3kg) to wrist straps without harness D-ring anchor.'
      ],
      tbtSignoffsCount: 48,
      sitesVerified: ['Nordic Wind Farm', 'EcoPower Solar', 'Apex Offshore']
    },
    {
      id: 'sf-102',
      title: 'Arc-Flash Flashover During 33kV Inverter Servicing',
      hazardCategory: 'Electrical LOTO',
      site: 'EcoPower Solar Farm',
      incidentNum: 'INC-2026-009',
      publishedDate: '2026-07-22',
      author: 'Jonas Lindqvist (Site Lead)',
      status: 'Approved',
      targetAudience: 'Solar Substation HV Electricians',
      summary: 'An electrician opened a 33kV inverter cabinet without verifying capacitive voltage discharge, causing an arc flash discharge.',
      rootCause: 'Inadequate 10-minute discharge waiting period following main breaker opening; multimeter rating was insufficient for peak voltage.',
      dos: [
        'Mandatory 10-minute waiting period following DC breaker trip for capacitor bank discharge.',
        'Use CAT IV 1000V rated voltage detectors for initial zero-voltage test.',
        'Wear Category 4 Arc-Flash PPE suit during door opening.'
      ],
      donts: [
        'Do NOT assume open breaker equals zero voltage in capacitor-backed inverters.',
        'Do NOT bypass secondary LOTO key interlock switches.'
      ],
      tbtSignoffsCount: 36,
      sitesVerified: ['EcoPower Solar', 'BESS Storage Hub']
    },
    {
      id: 'sf-103',
      title: 'BESS Battery Rack Thermal Runaway Early Warning',
      hazardCategory: 'BESS Storage',
      site: 'BESS Energy Storage',
      incidentNum: 'INC-2026-012',
      publishedDate: '2026-07-26',
      author: 'Marcus Vance (Safety Director)',
      status: 'Pending Approval',
      targetAudience: 'Battery System Engineers & First Responders',
      summary: 'Cell #14 in Rack B4 exhibited localized off-gassing and elevated temperature spike (78°C) before automated Novec suppression deployment.',
      rootCause: 'Coolant hose pinch fitting reduced ethylene glycol flow rate by 40% to Rack B4.',
      dos: [
        'Check SCADA thermal delta logs daily during peak solar charging hours.',
        'Verify coolant flow pressure gauges on all rack manifolds during weekly walkdowns.'
      ],
      donts: [
        'Do NOT enter BESS container if toxic off-gassing sensor alarms are active.',
        'Do NOT override automated gas suppression delay timers.'
      ],
      tbtSignoffsCount: 0,
      sitesVerified: []
    }
  ]);

  // Form State for New Safety Flash Draft
  const [draftForm, setDraftForm] = useState({
    title: '',
    hazardCategory: 'Working at Height',
    targetAudience: 'All Site Technicians',
    summary: '',
    rootCause: '',
    dosText: '',
    dontsText: ''
  });

  const categories = ['All', 'Working at Height', 'Electrical LOTO', 'BESS Storage', 'Lifting & Crane', 'Environmental'];

  // Filtered Safety Flashes
  const filteredFlashes = safetyFlashes.filter(sf => {
    const matchesCategory = selectedCategory === 'All' || sf.hazardCategory === selectedCategory;
    const matchesSearch = sf.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sf.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sf.incidentNum.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeSubTab === 'published') {
      return sf.status === 'Approved' && matchesCategory && matchesSearch;
    }
    if (activeSubTab === 'pending') {
      return sf.status === 'Pending Approval' && matchesCategory && matchesSearch;
    }
    if (activeSubTab === 'tbt') {
      return sf.status === 'Approved' && matchesCategory && matchesSearch;
    }
    if (activeSubTab === 'drafts') {
      return sf.status === 'Draft' && matchesCategory && matchesSearch;
    }
    return matchesCategory && matchesSearch;
  });

  const pendingApprovalCount = safetyFlashes.filter(sf => sf.status === 'Pending Approval').length;

  const handleCreateDraftSubmit = (e) => {
    e.preventDefault();
    if (!draftForm.title.trim()) return;

    const newFlash = {
      id: `sf-${Date.now()}`,
      title: draftForm.title,
      hazardCategory: draftForm.hazardCategory,
      site: currentUser.site || 'Corporate Fleet',
      incidentNum: 'INC-2026-NEW',
      publishedDate: new Date().toISOString().split('T')[0],
      author: currentUser.name,
      status: hasRole([roles.HSE_MANAGER, roles.ADMIN]) ? 'Approved' : 'Pending Approval',
      targetAudience: draftForm.targetAudience,
      summary: draftForm.summary,
      rootCause: draftForm.rootCause,
      dos: draftForm.dosText.split('\n').filter(d => d.trim()),
      donts: draftForm.dontsText.split('\n').filter(d => d.trim()),
      tbtSignoffsCount: 0,
      sitesVerified: []
    };

    setSetSafetyFlashes = setSafetyFlashes([newFlash, ...safetyFlashes]);
    setShowDraftModal(false);
    setDraftForm({
      title: '',
      hazardCategory: 'Working at Height',
      targetAudience: 'All Site Technicians',
      summary: '',
      rootCause: '',
      dosText: '',
      dontsText: ''
    });
    alert(hasRole([roles.HSE_MANAGER, roles.ADMIN]) ? 'Safety Flash published company-wide!' : 'Safety Flash submitted to HSE Manager for quality & privacy approval.');
  };

  const handleApproveFlash = (flashId) => {
    setSafetyFlashes(safetyFlashes.map(sf => sf.id === flashId ? { ...sf, status: 'Approved' } : sf));
    alert('Safety Flash approved and published to central portal!');
  };

  const handleTbtSignoff = (flashId) => {
    setSafetyFlashes(safetyFlashes.map(sf => {
      if (sf.id === flashId) {
        const currentVerified = sf.sitesVerified || [];
        if (!currentVerified.includes(currentUser.site)) {
          return {
            ...sf,
            tbtSignoffsCount: sf.tbtSignoffsCount + 12,
            sitesVerified: [...currentVerified, currentUser.site]
          };
        }
      }
      return sf;
    }));
    alert(`Toolbox Talk (TBT) Briefing marked completed for ${currentUser.site}! (12 Workers Verified)`);
  };

  return (
    <div className="lessons-learned-hub animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0px' }}>
      
      {/* 1. Hero Search & Knowledge Hub Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '12px',
        padding: '28px 36px',
        color: '#ffffff',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        textAlign: 'left',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.12)'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <BookOpen size={20} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              Enterprise Safety Knowledge & Learning Portal
            </span>
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 8px 0', color: '#ffffff' }}>
            Lessons Learned & Safety Alerts
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            Transforming incident investigations into actionable 1-page Safety Flashes for morning shift Toolbox Talks across all energy assets.
          </p>
        </div>

        {/* Action Button: Draft New Safety Flash */}
        <div>
          <button
            onClick={() => setShowDraftModal(true)}
            className="btn btn-primary"
            style={{
              background: 'var(--accent-cyan)',
              border: 'none',
              padding: '12px 20px',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)'
            }}
          >
            <Plus size={18} /> Create Safety Flash Draft
          </button>
        </div>
      </div>

      {/* 2. Search & Category Filter Controls Bar */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          {/* Keyword Search Input */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search Safety Flashes by keyword, equipment, or incident #..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '40px', fontSize: '0.84rem', height: '42px' }}
            />
          </div>

          {/* Sub-tab Navigation */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'published', label: '📚 Published Portal' },
              { id: 'pending', label: `⏳ Pending Approval ${pendingApprovalCount > 0 ? `(${pendingApprovalCount})` : ''}` },
              { id: 'tbt', label: '📢 Shift Toolbox Talks (TBT)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: activeSubTab === tab.id ? 700 : 500,
                  background: activeSubTab === tab.id ? '#ffffff' : 'transparent',
                  color: activeSubTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  boxShadow: activeSubTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', textAlign: 'left' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginRight: '4px' }}>Filter Hazard:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'rgba(6, 182, 212, 0.1)' : '#f8fafc',
                border: selectedCategory === cat ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                color: selectedCategory === cat ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontWeight: selectedCategory === cat ? 700 : 500,
                fontSize: '0.76rem',
                padding: '4px 12px',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* 3. SUB-TAB 1: PUBLISHED SAFETY FLASHES PORTAL */}
      {activeSubTab === 'published' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', textAlign: 'left' }}>
          {filteredFlashes.length === 0 ? (
            <div style={{ gridColumn: 'span 2', padding: '48px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
              <BookOpen size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '0.96rem', margin: '0 0 4px 0' }}>No Published Safety Flashes Found</h3>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>Try clearing your search query or selecting a different hazard category filter.</p>
            </div>
          ) : (
            filteredFlashes.map(sf => (
              <div 
                key={sf.id} 
                style={{ 
                  background: '#ffffff', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)', 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(15,23,42,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                }}
              >
                {/* Header: Hazard Tag & Ref */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: 'rgba(6, 182, 212, 0.1)',
                    color: 'var(--accent-cyan)',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: '1px solid rgba(6, 182, 212, 0.2)'
                  }}>
                    🏷️ {sf.hazardCategory}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {sf.incidentNum} • Published {sf.publishedDate}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                  {sf.title}
                </h3>

                {/* Incident Event Summary */}
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Event Overview:</strong>
                  {sf.summary}
                </div>

                {/* Root Cause Box */}
                <div style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '12px 14px', borderRadius: '8px', border: '1px dashed rgba(239, 68, 68, 0.2)', fontSize: '0.8rem' }}>
                  <strong style={{ color: 'var(--accent-red)', display: 'block', marginBottom: '2px' }}>Systemic Root Cause:</strong>
                  {sf.rootCause}
                </div>

                {/* Actionable Do's & Don'ts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.78rem' }}>
                  {/* DO's */}
                  <div style={{ background: 'rgba(16, 185, 129, 0.04)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                    <strong style={{ color: 'var(--accent-green)', display: 'block', marginBottom: '6px' }}>Mandatory DO's:</strong>
                    <ul style={{ margin: 0, paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-primary)' }}>
                      {sf.dos.map((item, idx) => (
                        <li key={idx}>✅ {item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* DON'TS */}
                  <div style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                    <strong style={{ color: 'var(--accent-red)', display: 'block', marginBottom: '6px' }}>Critical DON'TS:</strong>
                    <ul style={{ margin: 0, paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-primary)' }}>
                      {sf.donts.map((item, idx) => (
                        <li key={idx}>❌ {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer: Export PDF & TBT Tracker */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Author: <strong>{sf.author}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => alert(`1-Page Safety Flash PDF exported for ${sf.incidentNum}!`)}
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Download size={14} /> Export 1-Page PDF
                    </button>

                    <button 
                      onClick={() => handleTbtSignoff(sf.id)}
                      className="btn btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '0.74rem', background: 'var(--accent-cyan)', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Users size={14} /> Broadcast Shift TBT
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* 4. SUB-TAB 2: PENDING HSE MANAGER APPROVAL */}
      {activeSubTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} style={{ color: 'var(--accent-gold)' }} />
              HSE Manager Quality & Privacy Audit Queue
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Review draft Safety Flashes to ensure GDPR compliance (anonymized names) and verified technical accuracy before publishing company-wide.
            </p>
          </div>

          {filteredFlashes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
              <CheckCircle size={28} style={{ color: 'var(--accent-green)', marginBottom: '8px' }} />
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem' }}>Audit Queue Clear</h4>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>All submitted Safety Flashes have been audited and approved.</p>
            </div>
          ) : (
            filteredFlashes.map(sf => (
              <div key={sf.id} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{sf.incidentNum}</span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      Pending Quality Audit
                    </span>
                  </div>

                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sf.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>{sf.summary}</p>
                  
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Drafted by: <strong>{sf.author}</strong> ({sf.site}) • Submitted: {sf.publishedDate}
                  </div>
                </div>

                {hasRole([roles.HSE_MANAGER, roles.ADMIN]) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '180px' }}>
                    <button 
                      onClick={() => handleApproveFlash(sf.id)}
                      className="btn btn-primary" 
                      style={{ background: 'var(--accent-green)', border: 'none', fontSize: '0.8rem', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Check size={16} /> Approve & Publish
                    </button>
                    <button 
                      onClick={() => alert('Revision requested. Sent back to author.')}
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.8rem', padding: '8px 16px', color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}
                    >
                      Request Revisions
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. SUB-TAB 3: SHIFT TOOLBOX TALKS (TBT) VERIFICATION TRACKER */}
      {activeSubTab === 'tbt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ color: 'var(--accent-cyan)' }} />
              Morning Shift Toolbox Talk (TBT) Verification Engine
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Site Supervisors log morning shift read-outs of published Safety Flashes to ensure 100% field crew awareness.
            </p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Safety Alert</th>
                  <th>Hazard Category</th>
                  <th>Target Operations</th>
                  <th>TBT Verified Workers</th>
                  <th>Verified Sites</th>
                  <th>Morning Briefing Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlashes.map(sf => {
                  const isVerifiedOnMySite = sf.sitesVerified?.includes(currentUser.site);
                  return (
                    <tr key={sf.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sf.title}</td>
                      <td>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{sf.hazardCategory}</span>
                      </td>
                      <td style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{sf.targetAudience}</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{sf.tbtSignoffsCount} Workers</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {(sf.sitesVerified || []).map((st, sIdx) => (
                            <span key={sIdx} style={{ fontSize: '0.64rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>{st}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {isVerifiedOnMySite ? (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} /> Completed for {currentUser.site}
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleTbtSignoff(sf.id)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.74rem', background: 'var(--accent-cyan)', color: 'white', border: 'none' }}
                          >
                            Mark TBT Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CREATE SAFETY FLASH DRAFT MODAL */}
      {showDraftModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'left' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} style={{ color: 'var(--accent-cyan)' }} />
                Draft New Safety Flash Alert
              </h3>
              <button onClick={() => setShowDraftModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDraftSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Safety Flash Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Lanyard Snap Hazard During Nacelle Work" 
                  value={draftForm.title}
                  onChange={(e) => setDraftForm({ ...draftForm, title: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hazard Category *</label>
                  <select 
                    value={draftForm.hazardCategory}
                    onChange={(e) => setDraftForm({ ...draftForm, hazardCategory: e.target.value })}
                    className="form-control"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Target Field Crew</label>
                  <input 
                    type="text" 
                    placeholder="e.g. All Solar Technicians" 
                    value={draftForm.targetAudience}
                    onChange={(e) => setDraftForm({ ...draftForm, targetAudience: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Event Overview (Anonymized - No Worker Names) *</label>
                <textarea 
                  rows={3}
                  placeholder="Describe what occurred, equipment involved, and immediate consequence..." 
                  value={draftForm.summary}
                  onChange={(e) => setDraftForm({ ...draftForm, summary: e.target.value })}
                  className="form-textarea"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Systemic Root Cause *</label>
                <input 
                  type="text" 
                  placeholder="e.g. UV degradation & missing annual inspection tag..." 
                  value={draftForm.rootCause}
                  onChange={(e) => setDraftForm({ ...draftForm, rootCause: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Mandatory DO's (1 rule per line) *</label>
                <textarea 
                  rows={3}
                  placeholder="Perform pre-use pull-tests&#10;Verify color-coded inspection tag..." 
                  value={draftForm.dosText}
                  onChange={(e) => setDraftForm({ ...draftForm, dosText: e.target.value })}
                  className="form-textarea"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Critical DON'TS (1 rule per line) *</label>
                <textarea 
                  rows={3}
                  placeholder="Do NOT use tethers over 24 months old&#10;Do NOT bypass secondary LOTO locks..." 
                  value={draftForm.dontsText}
                  onChange={(e) => setDraftForm({ ...draftForm, dontsText: e.target.value })}
                  className="form-textarea"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setShowDraftModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-cyan)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} /> Submit Draft for Approval
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default LessonsLearned;
