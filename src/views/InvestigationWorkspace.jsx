import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useUser } from '../context/UserContext';
import FiveWhys from '../components/FiveWhys';
import BarrierAnalysis from '../components/BarrierAnalysis';
import { ShieldAlert, CheckSquare, Save, FileDown, BookOpen, AlertCircle, ArrowLeft, Check, ClipboardList, Send } from 'lucide-react';

const InvestigationWorkspace = ({ incidentId, onBack }) => {
  const { 
    incidents, 
    updateInvestigationDetails, 
    addCorrectiveAction, 
    updateIncident 
  } = useDatabase();
  const { currentUser, hasRole, roles } = useUser();
  const [activeSubTab, setActiveSubTab] = useState('factfinding');
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Corrective Action form states
  const [caTitle, setCaTitle] = useState('');
  const [caOwner, setCaOwner] = useState('');
  const [caDept, setCaDept] = useState('');
  const [caDue, setCaDue] = useState('');
  const [caPriority, setCaPriority] = useState('Medium');

  const incident = incidents.find(i => i.id === incidentId);
  if (!incident || !incident.investigation) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
        <p>No active investigation found.</p>
        <button onClick={onBack} className="btn btn-secondary">Go Back</button>
      </div>
    );
  }

  const inv = incident.investigation;
  const isClosed = incident.status === 'Closed';
  const readOnly = isClosed || !hasRole([roles.HSE_OFFICER, roles.HSE_MANAGER, roles.SITE_MANAGER, roles.ADMIN]);

  // Update specific investigation fields
  const handleChecklistToggle = (idx) => {
    if (readOnly) return;
    const updatedChecklist = inv.checklist.map((item, i) => 
      i === idx ? { ...item, completed: !item.completed } : item
    );
    updateInvestigationDetails(incident.id, { checklist: updatedChecklist }, currentUser.name);
  };

  const handleSaveFiveWhys = (fiveWhysData) => {
    updateInvestigationDetails(incident.id, { fiveWhys: fiveWhysData }, currentUser.name);
  };

  const handleSaveBarriers = (barrierData) => {
    updateInvestigationDetails(incident.id, { barrierAnalysis: barrierData }, currentUser.name);
  };

  const handleUpdateInvestigationBase = (key, val) => {
    if (readOnly) return;
    updateInvestigationDetails(incident.id, { [key]: val }, currentUser.name);
  };

  // Add corrective actions directly inside the workspace (Step 3)
  const handleAddCAPA = (e) => {
    e.preventDefault();
    if (!caTitle || !caOwner || !caDue) return;

    addCorrectiveAction(incident.id, {
      title: caTitle,
      owner: caOwner,
      ownerDepartment: caDept,
      dueDate: caDue,
      priority: caPriority,
      site: incident.site
    }, currentUser.name);

    setCaTitle('');
    setCaOwner('');
    setCaDept('');
    setCaDue('');
    setCaPriority('Medium');
    alert('CAPA Corrective Action added and assigned successfully.');
  };

  // Submit Investigation for Approval
  const handleSubmitInvestigation = () => {
    if (!inv.fiveWhys?.rootCause || inv.fiveWhys.rootCause.trim() === '') {
      alert('Please complete the Root Cause Analysis (RCA) in Step 2 before submitting.');
      return;
    }
    if (!incident.actions || incident.actions.length === 0) {
      alert('Please add at least one CAPA Corrective Action in Step 3 before submitting.');
      return;
    }

    updateIncident(incident.id, { status: 'Pending Approval' }, currentUser.name);
    alert('Investigation submitted successfully! Incident status is now Pending Approval.');
    onBack();
  };

  // Dynamic Whys chain visual flowchart calculation
  const whys = inv.fiveWhys || {};
  const whyChain = [
    { title: 'Problem', text: whys.problem },
    { title: 'Why 1', text: whys.why1 },
    { title: 'Why 2', text: whys.why2 },
    { title: 'Why 3', text: whys.why3 },
    { title: 'Why 4', text: whys.why4 },
    { title: 'Why 5', text: whys.why5 },
    { title: 'Identified Root Cause', text: whys.rootCause, isCritical: true }
  ].filter(w => w.text && w.text.trim() !== '');

  // Mock PDF generator
  const triggerPdfDownload = () => {
    setGeneratingPdf(true);
    setTimeout(() => {
      setGeneratingPdf(false);
      const element = document.createElement("a");
      const file = new Blob([
        `========================================================================\n`,
        `                 HEALTH & SAFETY INCIDENT INVESTIGATION REPORT          \n`,
        `========================================================================\n\n`,
        `Incident Number:     ${incident.incidentNumber}\n`,
        `Title:               ${incident.title}\n`,
        `Report Date:         ${new Date(incident.reportedDate).toLocaleDateString()}\n`,
        `Site Location:       ${incident.site} - ${incident.siteArea}\n`,
        `Risk Assessment:     Risk Level: ${incident.riskRating} / Consequence score: ${incident.potentialConsequence}\n\n`,
        `Investigation Code:  ${inv.investigationNumber}\n`,
        `Lead Investigator:   ${inv.leadInvestigator}\n`,
        `Investigation scope: ${inv.scope}\n\n`,
        `------------------------------------------------------------------------\n`,
        `FIVE WHYS ANALYSIS & ROOT CAUSE:\n`,
        `------------------------------------------------------------------------\n`,
        `Problem:  ${inv.fiveWhys?.problem || 'N/A'}\n`,
        `Why 1:    ${inv.fiveWhys?.why1 || 'N/A'}\n`,
        `Why 2:    ${inv.fiveWhys?.why2 || 'N/A'}\n`,
        `Why 3:    ${inv.fiveWhys?.why3 || 'N/A'}\n`,
        `Why 4:    ${inv.fiveWhys?.why4 || 'N/A'}\n`,
        `Why 5:    ${inv.fiveWhys?.why5 || 'N/A'}\n`,
        `Identified Root Cause: ${inv.fiveWhys?.rootCause || 'N/A'}\n\n`,
        `========================================================================\n`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${incident.incidentNumber}-Investigation-Summary.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1500);
  };

  return (
    <div className="investigation-workspace animate-fade">
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={onBack} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Incident
        </button>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={triggerPdfDownload} 
            disabled={generatingPdf}
            className="btn btn-secondary" 
            style={{ border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
          >
            <FileDown size={16} />
            {generatingPdf ? 'Generating PDF...' : 'Download Report Pack'}
          </button>
        </div>
      </div>

      {/* Overview stats panel */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Investigation Code</span>
          <h3 className="h2-title" style={{ fontSize: '1.25rem', marginTop: '2px' }}>{inv.investigationNumber}</h3>
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Lead Investigator</span>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>{inv.leadInvestigator}</p>
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Target Completion Date</span>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>{inv.targetCompletionDate}</p>
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Workspace Status</span>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px', color: 'var(--accent-cyan)' }}>{incident.status}</p>
        </div>
      </div>

      {/* Progressive Step Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.15)', padding: '16px 24px', borderRadius: '12px', marginBottom: '28px', border: '1px solid var(--border-color)' }}>
        {[
          { step: 1, id: 'factfinding', label: '1. Fact Finding & Checklist' },
          { step: 2, id: 'fivewhys', label: '2. Root Cause Analysis (RCA)' },
          { step: 3, id: 'capa', label: '3. CAPA & Submit Approval' }
        ].map((item, index, arr) => (
          <React.Fragment key={item.id}>
            <div 
              onClick={() => setActiveSubTab(item.id)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                cursor: 'pointer',
                opacity: activeSubTab === item.id ? 1 : 0.6,
                fontWeight: activeSubTab === item.id ? 700 : 500,
                color: activeSubTab === item.id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                background: activeSubTab === item.id ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)',
                color: activeSubTab === item.id ? '#070a12' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 'bold'
              }}>
                {item.step}
              </span>
              <span style={{ fontSize: '0.88rem' }}>{item.label}</span>
            </div>
            {index < arr.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.08)', margin: '0 20px' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Fact Finding & Checklist */}
      {activeSubTab === 'factfinding' && (
        <div className="grid-cols-3 animate-fade" style={{ gridTemplateColumns: '1fr 2fr', gap: '28px' }}>
          
          {/* Scope and Details */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 className="h2-title" style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Investigation Parameters</h4>
            
            <div className="form-group">
              <label className="form-label">Investigation Scope</label>
              <textarea 
                className="form-textarea" 
                value={inv.scope} 
                onChange={(e) => handleUpdateInvestigationBase('scope', e.target.value)}
                disabled={readOnly}
                style={{ fontSize: '0.84rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select 
                className="form-select" 
                value={inv.priority} 
                onChange={(e) => handleUpdateInvestigationBase('priority', e.target.value)}
                disabled={readOnly}
                style={{ fontSize: '0.84rem' }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 className="h2-title" style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Scene Safety & Inspection Checklist
            </h4>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '20px' }}>
              Checklist templates adapt by site category. Ensure physical logs are captured and verified.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {inv.checklist.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleChecklistToggle(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: item.completed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    border: item.completed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-color)',
                    cursor: readOnly ? 'default' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: item.completed ? 'white' : 'var(--text-secondary)' }}>
                    {item.task}
                  </span>
                  
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    background: item.completed ? 'var(--accent-green)' : 'transparent',
                    border: '2px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#070a12',
                    transition: 'all 0.2s ease'
                  }}>
                    {item.completed && <Check size={14} style={{ color: 'white' }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Step 2: Root Cause Analysis (RCA) */}
      {activeSubTab === 'fivewhys' && (
        <div className="animate-fade">
          <FiveWhys 
            initialData={inv.fiveWhys} 
            onSave={handleSaveFiveWhys} 
            readOnly={readOnly} 
          />

          {/* Dynamic visual flowchart graphic showing chain of causation */}
          {whyChain.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px', marginTop: '28px' }}>
              <h4 className="h2-title" style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: 'var(--accent-cyan)' }} />
                RCA Logic Chain of Causation Flowchart
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                {whyChain.map((node, nIdx) => (
                  <React.Fragment key={nIdx}>
                    <div style={{ 
                      width: '100%', 
                      maxWidth: '650px', 
                      padding: '14px 20px', 
                      background: node.isCritical ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0,0,0,0.15)',
                      border: node.isCritical ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      textAlign: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: node.isCritical ? 'var(--accent-green)' : 'var(--accent-cyan)', fontWeight: 700 }}>
                        {node.title}
                      </span>
                      <p style={{ fontSize: '0.88rem', marginTop: '4px', fontWeight: 500, color: 'white' }}>{node.text}</p>
                    </div>
                    {nIdx < whyChain.length - 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '2px', height: '14px', background: 'var(--accent-cyan)', opacity: 0.4 }} />
                        <span style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 'bold', lineHeight: '1' }}>↓</span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: CAPA Definition & Submit */}
      {activeSubTab === 'capa' && (
        <div className="grid-cols-3 animate-fade" style={{ gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <BarrierAnalysis 
              initialBarriers={inv.barrierAnalysis} 
              onSave={handleSaveBarriers} 
              readOnly={readOnly} 
            />

            {/* List of defined corrective actions */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 className="h2-title" style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={18} style={{ color: 'var(--accent-cyan)' }} />
                Defined CAPA Actions ({incident.actions?.length || 0})
              </h4>

              {incident.actions?.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                  No CAPA corrective actions defined yet. Add actions using the form on the right.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {incident.actions.map(act => (
                    <div 
                      key={act.id} 
                      style={{ 
                        padding: '14px', 
                        background: 'rgba(0,0,0,0.15)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{act.actionNumber}</span>
                        <h5 style={{ fontSize: '0.88rem', margin: '2px 0 6px 0', fontWeight: 600 }}>{act.title}</h5>
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          Owner: <strong>{act.owner}</strong> ({act.ownerDepartment}) | Due: <strong>{act.dueDate}</strong>
                        </p>
                      </div>
                      <span className={`badge ${act.priority === 'High' ? 'risk-high' : act.priority === 'Medium' ? 'risk-medium' : 'risk-low'}`} style={{ fontSize: '0.7rem' }}>
                        {act.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Create Action form (available to investigators only) */}
            {!readOnly && (
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px' }}>Add CAPA Corrective Action</h4>
                <form onSubmit={handleAddCAPA} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Action Description / Title *</label>
                    <input type="text" className="form-control" value={caTitle} onChange={(e) => setCaTitle(e.target.value)} placeholder="e.g. Conduct LOTO refresher training" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assigned Action Owner *</label>
                    <input type="text" className="form-control" value={caOwner} onChange={(e) => setCaOwner(e.target.value)} placeholder="Owner name" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Responsible Department</label>
                    <input type="text" className="form-control" value={caDept} onChange={(e) => setCaDept(e.target.value)} placeholder="e.g. HSE Department" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input type="date" className="form-control" value={caDue} onChange={(e) => setCaDue(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={caPriority} onChange={(e) => setCaPriority(e.target.value)}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '4px' }}>
                    Assign CAPA Action
                  </button>
                </form>
              </div>
            )}

            {/* Submission card */}
            {!readOnly && (
              <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '10px' }}>Submit Investigation</h4>
                <p className="text-muted" style={{ fontSize: '0.78rem', marginBottom: '14px', lineHeight: '1.4' }}>
                  Send findings, root causes, and assigned corrective actions to the management team for final review and approval.
                </p>
                <button 
                  onClick={handleSubmitInvestigation} 
                  className="btn btn-primary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Send size={14} />
                  Submit for Approval
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default InvestigationWorkspace;
