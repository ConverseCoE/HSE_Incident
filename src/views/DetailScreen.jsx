import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useUser } from '../context/UserContext';
import EvidenceGallery from '../components/EvidenceGallery';
import FiveWhys from '../components/FiveWhys';
import BarrierAnalysis from '../components/BarrierAnalysis';
import { 
  FileText, ShieldAlert, CheckSquare, Plus, Check, Clock, 
  UserPlus, HelpCircle, FileCheck, ArrowLeft, RefreshCw, Send, AlertTriangle, Eye, ShieldCheck
} from 'lucide-react';

const DetailScreen = ({ incidentId, onBack, onGoToWorkspace }) => {
  const { 
    incidents, 
    updateIncident, 
    addImmediateAction, 
    verifyImmediateAction,
    initializeInvestigation,
    addCorrectiveAction,
    submitInvestigationApproval,
    closeIncident,
    reopenIncident,
    publishSafetyAlert
  } = useDatabase();
  
  const { currentUser, hasRole, canViewSensitiveInfo, canEditIncident, roles } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  // Local additions
  const [iaDesc, setIaDesc] = useState('');
  const [iaOwner, setIaOwner] = useState('');
  const [caTitle, setCaTitle] = useState('');
  const [caOwner, setCaOwner] = useState('');
  const [caDept, setCaDept] = useState('');
  const [caDue, setCaDue] = useState('');
  const [caPriority, setCaPriority] = useState('Medium');
  
  // Reopening
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenForm, setShowReopenForm] = useState(false);

  // Investigation Setup
  const [invLead, setInvLead] = useState('');
  const [invDate, setInvDate] = useState('');

  // Approval comments
  const [appComments, setAppComments] = useState('');

  // Initial Review states
  const [reviewInvestigationRequired, setReviewInvestigationRequired] = useState('Yes');
  const [reviewLeadInvestigator, setReviewLeadInvestigator] = useState('');
  const [reviewTargetDate, setReviewTargetDate] = useState('');

  // Safety Alert states
  const [alertTitle, setAlertTitle] = useState('');
  const [alertWhy, setAlertWhy] = useState('');
  const [alertWhat, setAlertWhat] = useState('');
  const [alertLearning, setAlertLearning] = useState('');
  const [showPublisher, setShowPublisher] = useState(false);

  const incident = incidents.find(i => i.id === incidentId);
  if (!incident) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
        <p>Incident report not found.</p>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '12px' }}>Go Back</button>
      </div>
    );
  }

  const isClosed = incident.status === 'Closed';
  const hasSensitiveAccess = canViewSensitiveInfo();

  // Handlers
  const handleAddIA = (e) => {
    e.preventDefault();
    if (!iaDesc || !iaOwner) return;
    addImmediateAction(incident.id, {
      description: iaDesc,
      owner: iaOwner,
      dateTime: new Date().toISOString(),
      status: 'Pending'
    }, currentUser.name);
    setIaDesc('');
    setIaOwner('');
  };

  const handleVerifyIA = (actionId) => {
    verifyImmediateAction(incident.id, actionId, `Verified by ${currentUser.name}`, currentUser.name);
  };

  const handleStartInv = (e) => {
    e.preventDefault();
    if (!invLead || !invDate) return;
    initializeInvestigation(incident.id, invLead, invDate, currentUser.name);
    onGoToWorkspace(incident.id);
  };

  const handleInitialReviewSubmit = (e) => {
    e.preventDefault();
    if (reviewInvestigationRequired === 'Yes') {
      if (!reviewLeadInvestigator || !reviewTargetDate) {
        alert('Please specify a Lead Investigator and Target Date.');
        return;
      }
      initializeInvestigation(incident.id, reviewLeadInvestigator, reviewTargetDate, currentUser.name);
      alert('Incident status updated to Under Investigation. Investigation Workspace is now open.');
    } else {
      updateIncident(incident.id, { status: 'CAPA Action Plan' }, currentUser.name);
      alert('Incident status updated to CAPA Action Plan.');
    }
  };

  const handleAddCA = (e) => {
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
  };

  const handleApproval = (status) => {
    if (!appComments) {
      alert('Please add approval comments.');
      return;
    }

    let stage = 'HSE Officer';
    if (currentUser.role === roles.SUPERVISOR) stage = 'Site Supervisor';
    if (currentUser.role === roles.SITE_MANAGER) stage = 'Site Manager';
    if (currentUser.role === roles.HSE_MANAGER) stage = 'HSE Manager';

    submitInvestigationApproval(incident.id, {
      stage,
      status,
      comments: appComments
    }, currentUser.name);

    setAppComments('');
  };

  const handleClose = () => {
    closeIncident(incident.id, {
      lessonsLearned: true,
      lessonsLearnedText: `Ensure mandatory safety checklists are audited before resuming operational activities.`
    }, currentUser.name);
  };

  const handleReopen = () => {
    if (!reopenReason) return;
    reopenIncident(incident.id, reopenReason, currentUser.name);
    setShowReopenForm(false);
    setReopenReason('');
  };

  const handleOpenPublisher = () => {
    setAlertTitle(`SAFETY ALERT: ${incident.title}`);
    setAlertWhy(incident.investigation?.fiveWhys?.rootCause || 'Root cause details pending.');
    const actionsSummarized = incident.actions?.map(a => `- ${a.title}`).join('\n') || '';
    setAlertWhat(`Implemented CAPA actions:\n${actionsSummarized}`);
    setAlertLearning('');
    setShowPublisher(true);
  };

  const handlePublishAlertSubmit = (e) => {
    e.preventDefault();
    if (!alertTitle || !alertWhy || !alertLearning) {
      alert('Please fill out the Alert Title, Root Cause, and Key Takeaway.');
      return;
    }
    publishSafetyAlert(incident.id, {
      title: alertTitle,
      why: alertWhy,
      what: alertWhat,
      learning: alertLearning,
      site: incident.site,
      category: incident.category
    }, currentUser.name);
    alert('Safety Alert successfully published to company-wide registry.');
    setShowPublisher(false);
  };

  return (
    <div className="incident-detail-layout animate-fade">
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={onBack} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Hub
        </button>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
          <span className="badge badge-cyan" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            {incident.status}
          </span>
          <span className={`badge risk-${incident.riskRating?.toLowerCase()}`} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            {incident.riskRating} Risk
          </span>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase' }}>
          {incident.incidentNumber}
        </span>
        <h2 className="h2-title" style={{ marginTop: '4px', marginBottom: '10px', fontSize: '1.4rem' }}>{incident.title}</h2>
        <p className="text-muted" style={{ fontSize: '0.88rem', lineHeight: '1.4' }}>
          {incident.description}
        </p>
      </div>

      {/* Tabs list */}
      <div className="tabs-header">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'people', label: 'People' },
          { id: 'evidence', label: 'Evidence & Media' },
          { id: 'actions', label: 'Immediate Actions' },
          { id: 'investigation', label: 'Investigation' },
          { id: 'corrective', label: 'Corrective Actions' },
          { id: 'approvals', label: 'Approvals' },
          { id: 'audit', label: 'Audit Trail' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid-cols-3 animate-fade" style={{ gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {incident.status === 'Pending Review' && hasRole([roles.HSE_MANAGER, roles.SITE_MANAGER, roles.ADMIN]) && (
              <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-cyan)' }}>
                <h3 className="h2-title" style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <CheckSquare size={20} style={{ color: 'var(--accent-cyan)' }} />
                  HSE Initial Review & Triage Decision
                </h3>
                <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: '20px' }}>
                  Evaluate this report and determine if a formal root cause investigation workspace is required under GWO standards.
                </p>

                <form onSubmit={handleInitialReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Is a formal incident investigation required?</label>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.88rem' }}>
                        <input 
                          type="radio" 
                          name="reqInvestigation" 
                          value="Yes" 
                          checked={reviewInvestigationRequired === 'Yes'} 
                          onChange={() => setReviewInvestigationRequired('Yes')} 
                          style={{ width: '16px', height: '16px' }} 
                        />
                        Yes, initiate full investigation (RCA/Five Whys)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.88rem' }}>
                        <input 
                          type="radio" 
                          name="reqInvestigation" 
                          value="No" 
                          checked={reviewInvestigationRequired === 'No'} 
                          onChange={() => setReviewInvestigationRequired('No')} 
                          style={{ width: '16px', height: '16px' }} 
                        />
                        No, skip directly to CAPA drafting
                      </label>
                    </div>
                  </div>

                  {reviewInvestigationRequired === 'Yes' && (
                    <div className="grid-cols-2 animate-fade" style={{ gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '4px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Lead Investigator Name *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={reviewLeadInvestigator} 
                          onChange={(e) => setReviewLeadInvestigator(e.target.value)} 
                          placeholder="e.g. Elena Rostova" 
                          required 
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Target Completion Date *</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          value={reviewTargetDate} 
                          onChange={(e) => setReviewTargetDate(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                      Submit Review Decision
                    </button>
                  </div>
                </form>
              </div>
            )}

            {(incident.status === 'Closed' || incident.status === 'Closed & Published') && (
              <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid ' + (incident.status === 'Closed & Published' ? 'var(--accent-green)' : 'var(--accent-gold)') }}>
                <h3 className="h2-title" style={{ fontSize: '1.1rem', color: incident.status === 'Closed & Published' ? 'var(--accent-green)' : 'var(--accent-gold)', marginBottom: '10px' }}>
                  Safety Alert & Lessons Learned Publication
                </h3>
                {incident.status === 'Closed' ? (
                  <div>
                    <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '16px' }}>
                      This incident is signed off and closed. Publish a Lessons Learned safety alert so site technicians can review this case in morning toolbox talks.
                    </p>
                    {!showPublisher ? (
                      <button onClick={handleOpenPublisher} className="btn btn-secondary" style={{ color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', fontSize: '0.8rem' }}>
                        Publish Lessons Learned Bulletin
                      </button>
                    ) : (
                      <form onSubmit={handlePublishAlertSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '8px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Alert Bulletin Title *</label>
                          <input type="text" className="form-control" value={alertTitle} onChange={(e) => setAlertTitle(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Why Did It Happen? (Root Cause) *</label>
                          <textarea className="form-textarea" value={alertWhy} onChange={(e) => setAlertWhy(e.target.value)} required style={{ minHeight: '60px', fontSize: '0.82rem' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">What Actions Were Taken? (Preventative CAPA)</label>
                          <textarea className="form-textarea" value={alertWhat} onChange={(e) => setAlertWhat(e.target.value)} style={{ minHeight: '60px', fontSize: '0.82rem' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Key Safety Takeaway / Lessons Learned *</label>
                          <textarea className="form-textarea" value={alertLearning} onChange={(e) => setAlertLearning(e.target.value)} placeholder="Specify what technician teams must check during shift briefings..." required style={{ minHeight: '60px', fontSize: '0.82rem' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button type="button" onClick={() => setShowPublisher(false)} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>Cancel</button>
                          <button type="submit" className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>Publish Alert</button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '0.86rem', color: 'white', fontWeight: 600 }}>Lessons Learned Bulletin Successfully Broadcasted!</p>
                    <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                      This case has been logged in the global lessons learned registry. Technicians can view this safety brief in their dashboard toolbox list.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* General Data Grid */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 className="h2-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>General Incident Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', fontSize: '0.88rem' }}>
                <div>
                  <p style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-secondary)' }}>Reported By:</strong> {incident.reportedBy} ({incident.reporterType})</p>
                  <p style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-secondary)' }}>Company:</strong> {incident.reporterOrganisation}</p>
                  <p style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-secondary)' }}>Reported Date:</strong> {new Date(incident.reportedDate).toLocaleString()}</p>
                  <p style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-secondary)' }}>Actual Event Date:</strong> {new Date(incident.actualDate).toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-secondary)' }}>Renewable Site:</strong> {incident.site}</p>
                  <p style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-secondary)' }}>Site Area:</strong> {incident.siteArea || 'N/A'}</p>
                  <p style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-secondary)' }}>Asset Involved:</strong> {incident.asset || 'None'}</p>
                  <p style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-secondary)' }}>Asset Type:</strong> {incident.assetType || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Renewable Scenario Specific values */}
            {incident.renewableScenario && incident.renewableScenario !== 'None' && (
              <div className="glass-panel" style={{ padding: '24px', borderLeft: '3px solid var(--accent-gold)' }}>
                <h3 className="h2-title" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', marginBottom: '16px' }}>
                  Renewable Event Parameters: {incident.renewableScenario}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: '0.88rem' }}>
                  
                  {incident.renewableScenario === 'Working-at-Height' && (
                    <>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Height of Work:</strong> {incident.heightOfWork || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Access Method:</strong> {incident.accessMethod || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Fall Arrest Gear:</strong> {incident.fallArrestEquipment || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Harness Inspect:</strong> {incident.harnessInspectionStatus}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Rescue Plan Available:</strong> {incident.rescuePlanAvailable ? 'Yes' : 'No'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Dropped Object Involved:</strong> {incident.droppedObjectInvolved ? 'Yes' : 'No'}</p>
                    </>
                  )}

                  {incident.renewableScenario === 'Offshore Access' && (
                    <>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Vessel:</strong> {incident.vesselName || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Wave Height:</strong> {incident.waveHeight || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Sea State:</strong> {incident.seaStateClass || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Access Suspended:</strong> {incident.accessSuspended ? 'Yes' : 'No'}</p>
                    </>
                  )}

                  {incident.renewableScenario === 'Battery Thermal Event' && (
                    <>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Core Enclosure Temp:</strong> {incident.batteryTemp || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Smoke/Gas Detect:</strong> {incident.smokeDetected ? 'Yes' : 'No'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Suppression Activated:</strong> {incident.suppressionActivated ? 'Yes' : 'No'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Thermal Runaway Suspected:</strong> {incident.thermalRunawaySuspected ? 'Yes' : 'No'}</p>
                    </>
                  )}

                  {incident.renewableScenario === 'Oil Leakage' && (
                    <>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Oil Substance:</strong> {incident.oilType || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Leak Qty:</strong> {incident.oilQty || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Containment status:</strong> {incident.containmentStatus || 'N/A'}</p>
                    </>
                  )}

                  {incident.renewableScenario === 'Bird or Wildlife Incident' && (
                    <>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Protected Species:</strong> {incident.species || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Carcass Handling:</strong> {incident.carcassHandling || 'N/A'}</p>
                    </>
                  )}

                  {incident.renewableScenario === 'Electrical Safety Incident' && (
                    <>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Voltage Level:</strong> {incident.voltageLevel || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Isolation Check:</strong> {incident.isolationStatus || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>LOTO Applied:</strong> {incident.lockoutApplied ? 'Yes' : 'No'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Arc Flash Event:</strong> {incident.arcFlashInvolved ? 'Yes' : 'No'}</p>
                    </>
                  )}

                  {incident.renewableScenario === 'Weather-Related Site Evacuation' && (
                    <>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Weather Event:</strong> {incident.evacReason || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Staff Count Evacuated:</strong> {incident.peopleEvacuated || 'N/A'}</p>
                    </>
                  )}

                  {incident.renewableScenario === 'Confined Space Entry' && (
                    <>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Permit ID:</strong> {incident.confinedPermitId || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Oxygen Level:</strong> {incident.confinedOxygenLevel || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Standby Safety Watch:</strong> {incident.confinedStandbyPerson || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Gas Detector Calibrated:</strong> {incident.confinedGasDetectorCalibrated ? 'Yes' : 'No'}</p>
                    </>
                  )}

                  {incident.renewableScenario === 'Heavy Lifting' && (
                    <>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Crane / Equipment ID:</strong> {incident.liftingCraneModel || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Wind Speed (Boom):</strong> {incident.liftingWindSpeed || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Rigging Inspected:</strong> {incident.liftingRiggingInspected ? 'Yes' : 'No'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Lift Plan Approved:</strong> {incident.liftingPlanApproved ? 'Yes' : 'No'}</p>
                    </>
                  )}

                  {incident.renewableScenario === 'Subsea Dive' && (
                    <>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Dive Supervisor:</strong> {incident.subseaDiveSupervisor || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Water Depth:</strong> {incident.subseaWaterDepth || 'N/A'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>Decompression Chamber:</strong> {incident.subseaDecompressionChamber ? 'Yes' : 'No'}</p>
                      <p><strong style={{ color: 'var(--text-secondary)' }}>ROV Support Active:</strong> {incident.subseaRovUsed ? 'Yes' : 'No'}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar panel: Incident Flags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '14px' }}>Incident Markers</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span>Regulatory Reportable:</span>
                  <strong style={{ color: incident.regulatoryReportable ? 'var(--accent-red)' : 'var(--text-muted)' }}>{incident.regulatoryReportable ? 'YES' : 'NO'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span>Lost Time Incident:</span>
                  <strong style={{ color: incident.lostTimeIncident ? 'var(--accent-red)' : 'var(--text-muted)' }}>{incident.lostTimeIncident ? 'YES' : 'NO'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span>Medical Case:</span>
                  <strong>{incident.medicalTreatment ? 'YES' : 'NO'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span>Environmental Leak:</span>
                  <strong>{incident.environmentalImpact ? 'YES' : 'NO'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Asset Damage:</span>
                  <strong>{incident.assetDamage ? 'YES' : 'NO'}</strong>
                </div>
              </div>
            </div>

            {/* Reopen Action (HSE Manager / Admin only) */}
            {incident.status === 'Closed' && hasRole([roles.HSE_MANAGER, roles.ADMIN]) && (
              <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--accent-red)', marginBottom: '10px' }}>Administration Actions</h4>
                
                {!showReopenForm ? (
                  <button onClick={() => setShowReopenForm(true)} className="btn btn-danger" style={{ width: '100%', fontSize: '0.8rem' }}>
                    Reopen Incident
                  </button>
                ) : (
                  <div>
                    <textarea 
                      value={reopenReason} 
                      onChange={(e) => setReopenReason(e.target.value)} 
                      placeholder="Specify reason to reopen..."
                      className="form-textarea"
                      style={{ fontSize: '0.8rem', minHeight: '60px', marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleReopen} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Confirm</button>
                      <button onClick={() => setShowReopenForm(false)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* People Tab */}
      {activeTab === 'people' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="h2-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Personnel Details & Medical Status</h3>

          {!hasSensitiveAccess ? (
            <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(251, 191, 36, 0.05)', borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.1)' }}>
              <ShieldAlert size={28} style={{ color: 'var(--accent-gold)', marginBottom: '10px' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', fontWeight: 600 }}>Access Restricted</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                You do not have the safety authorization clearance required to view witness statements or personal medical logs.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', fontSize: '0.88rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '8px' }}>
                  <span style={{ display: 'block', fontWeight: 600, marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>Involved Person Profile</span>
                  <p style={{ marginBottom: '8px' }}><strong>Name:</strong> {incident.involvedPerson || 'N/A'}</p>
                  <p style={{ marginBottom: '8px' }}><strong>Employer:</strong> {incident.employer || 'N/A'}</p>
                  <p style={{ marginBottom: '8px' }}><strong>Job Title:</strong> {incident.jobTitle || 'N/A'}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '8px' }}>
                  <span style={{ display: 'block', fontWeight: 600, marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>Medical Log & Work Impact</span>
                  <p style={{ marginBottom: '8px' }}><strong>Injury Severity:</strong> {incident.injuryStatus || 'N/A'}</p>
                  <p style={{ marginBottom: '8px' }}><strong>Injury Type:</strong> {incident.injuryType || 'N/A'}</p>
                  <p style={{ marginBottom: '8px' }}><strong>Body Part Affected:</strong> {incident.bodyPart || 'N/A'}</p>
                  <p style={{ marginBottom: '8px' }}><strong>Lost Work Days:</strong> {incident.lostWorkTime || '0'} days</p>
                  <p style={{ marginBottom: '8px' }}><strong>Treatment Provided:</strong> {incident.treatmentProvided || 'N/A'}</p>
                </div>
              </div>

              {/* Witness Details */}
              <h4 className="h2-title" style={{ fontSize: '1rem', marginTop: '24px', marginBottom: '12px' }}>Witness Statements ({incident.witnesses?.length || 0})</h4>
              {incident.witnesses?.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>No witness statements recorded.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {incident.witnesses.map(wit => (
                    <div key={wit.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                        <span><strong>{wit.name}</strong> ({wit.organisation}) - {wit.role}</span>
                        <span>Interviewed on: {wit.interviewDate} by {wit.interviewedBy}</span>
                      </div>
                      <p style={{ fontSize: '0.84rem', fontStyle: 'italic' }}>"{wit.statement}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Evidence & Media Tab */}
      {activeTab === 'evidence' && (
        <EvidenceGallery incidentId={incident.id} readOnly={isClosed} />
      )}

      {/* Immediate Actions Tab */}
      {activeTab === 'actions' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="h2-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Immediate Containment Actions</h3>

          {/* Table */}
          {incident.immediateActions?.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>No immediate actions recorded.</p>
          ) : (
            <div className="table-container" style={{ marginTop: 0, marginBottom: '24px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Action Description</th>
                    <th>Owner</th>
                    <th>Date Time</th>
                    <th>Status</th>
                    <th>Verification Details</th>
                    {!isClosed && <th>Confirm</th>}
                  </tr>
                </thead>
                <tbody>
                  {incident.immediateActions.map(act => (
                    <tr key={act.id}>
                      <td>{act.description}</td>
                      <td>{act.owner}</td>
                      <td>{new Date(act.dateTime).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${act.status === 'Completed' ? 'badge-green' : 'badge-gold'}`}>
                          {act.status}
                        </span>
                      </td>
                      <td>{act.verification || 'Awaiting verification'}</td>
                      {!isClosed && (
                        <td>
                          {act.status !== 'Completed' && (hasRole([roles.SUPERVISOR, roles.HSE_OFFICER, roles.ADMIN]) || act.owner === currentUser.name) ? (
                            <button onClick={() => handleVerifyIA(act.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--accent-green)', color: 'white' }}>
                              <Check size={12} /> Confirm Complete
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Form */}
          {!isClosed && (
            <form onSubmit={handleAddIA} style={{ background: 'rgba(0,0,0,0.15)', padding: '18px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '12px' }}>Record Immediate Containment Action</span>
              <div className="grid-cols-2" style={{ marginBottom: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Action Description *</label>
                  <input type="text" className="form-control" value={iaDesc} onChange={(e) => setIaDesc(e.target.value)} placeholder="e.g. Cleared spilled oil with pads" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Action Owner *</label>
                  <input type="text" className="form-control" value={iaOwner} onChange={(e) => setIaOwner(e.target.value)} placeholder="Name of employee" required />
                </div>
              </div>
              <button type="submit" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                Add Immediate Action
              </button>
            </form>
          )}
        </div>
      )}

      {/* Investigation Tab */}
      {activeTab === 'investigation' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="h2-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Investigation Workspace</h3>

          {!incident.investigation ? (
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <p className="text-muted" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
                No active investigation workspace is created for this incident. Investigations are mandatory for High or Critical events.
              </p>
              
              {!isClosed && hasRole([roles.SUPERVISOR, roles.HSE_OFFICER, roles.HSE_MANAGER]) ? (
                <form onSubmit={handleStartInv} style={{ maxWidth: '400px', margin: '0 auto', background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '12px' }}>Initiate Investigation Workspace</span>
                  <div className="form-group">
                    <label className="form-label">Lead Investigator Name *</label>
                    <input type="text" className="form-control" value={invLead} onChange={(e) => setInvLead(e.target.value)} placeholder="e.g. David Vance" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Completion Date *</label>
                    <input type="date" className="form-control" value={invDate} onChange={(e) => setInvDate(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Create Investigation Record
                  </button>
                </form>
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You do not have permissions to launch investigations.</span>
              )}
            </div>
          ) : (
            <div>
              <div style={{ background: 'rgba(6, 182, 212, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 600 }}>Investigation Code: {incident.investigation.investigationNumber}</span>
                  <p style={{ fontSize: '0.88rem', marginTop: '2px' }}>
                    Lead: <strong>{incident.investigation.leadInvestigator}</strong> | Status: <strong>{incident.investigation.status}</strong>
                  </p>
                </div>
                <button onClick={() => onGoToWorkspace(incident.id)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                  Go to Investigation Tooling
                </button>
              </div>

              {/* Read Only Root Causes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {incident.investigation.fiveWhys?.rootCause && (
                  <FiveWhys initialData={incident.investigation.fiveWhys} readOnly={true} />
                )}
                {incident.investigation.barrierAnalysis?.length > 0 && (
                  <BarrierAnalysis initialBarriers={incident.investigation.barrierAnalysis} readOnly={true} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Corrective Actions Tab */}
      {activeTab === 'corrective' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="h2-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Corrective & Preventive Actions</h3>

          {incident.actions?.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '24px' }}>No corrective actions assigned.</p>
          ) : (
            <div className="table-container" style={{ marginTop: 0, marginBottom: '24px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Action ID</th>
                    <th>Action Item</th>
                    <th>Owner</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incident.actions.map(act => (
                    <tr key={act.id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{act.actionNumber}</td>
                      <td>{act.title}</td>
                      <td>{act.owner} ({act.ownerDepartment})</td>
                      <td style={{ color: new Date(act.dueDate) < new Date() && act.status !== 'Completed' ? 'var(--accent-red)' : 'inherit' }}>
                        {new Date(act.dueDate).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge ${act.priority === 'High' ? 'badge-red' : 'badge-gold'}`}>
                          {act.priority}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-cyan">{act.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Corrective Action Form */}
          {!isClosed && incident.investigation && hasRole([roles.HSE_OFFICER, roles.HSE_MANAGER, roles.INVESTIGATOR]) && (
            <form onSubmit={handleAddCA} style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '12px' }}>Assign Corrective / Preventive Action</span>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Action Item Description *</label>
                  <input type="text" className="form-control" value={caTitle} onChange={(e) => setCaTitle(e.target.value)} placeholder="e.g. Audit torque wrench lanyard hooks" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Action Owner *</label>
                  <input type="text" className="form-control" value={caOwner} onChange={(e) => setCaOwner(e.target.value)} placeholder="Name of employee" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Department</label>
                  <input type="text" className="form-control" value={caDept} onChange={(e) => setCaDept(e.target.value)} placeholder="Procurement" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Due Date *</label>
                  <input type="date" className="form-control" value={caDue} onChange={(e) => setCaDue(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={caPriority} onChange={(e) => setCaPriority(e.target.value)}>
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                Add & Notify Owner
              </button>
            </form>
          )}
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="h2-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Workflow Approvals History</h3>

          {/* List approvals */}
          {incident.approvals?.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '24px' }}>No workflow reviews recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {incident.approvals.map(app => (
                <div key={app.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Stage: <strong>{app.stage}</strong></span>
                    <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>Comments: "{app.comments}"</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${app.status === 'Approved' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.72rem' }}>
                      {app.status}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Reviewer: {app.reviewer} ({new Date(app.date).toLocaleDateString()})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action form */}
          {!isClosed && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              
              {/* If waiting for closure */}
              {incident.status === 'Pending Approval' ? (
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: '12px' }}>Final Incident Closure Approval</span>
                  
                  {incident.actions?.length > 0 && incident.actions.every(act => act.status === 'Verified') ? (
                    <div>
                      <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '16px' }}>
                        Verification checklist: All corrective actions are marked COMPLETED and verified. Closing this incident will lock the record.
                      </p>
                      {hasRole([roles.HSE_MANAGER, roles.SITE_MANAGER, roles.ADMIN]) ? (
                        <button onClick={handleClose} className="btn btn-primary" style={{ background: 'var(--accent-green)', color: 'white' }}>
                          <Check size={16} /> Confirm Complete Incident Closure
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Waiting for HSE Manager or Site Manager closure review.</span>
                      )}
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--accent-red)', fontWeight: 600 }}>Awaiting CAPA Action Verifications</p>
                      <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                        This incident has corrective actions that are not yet verified by an HSE manager. All CAPA actions must be verified in the Approvals registry before closure is enabled.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Regular Supervisor/HSE reviews */
                <div>
                  {hasRole([roles.SUPERVISOR, roles.HSE_OFFICER, roles.HSE_MANAGER, roles.SITE_MANAGER]) ? (
                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Submit Workflow Review Decision</span>
                      
                      <div className="form-group">
                        <label className="form-label">Reviewer Comments *</label>
                        <textarea 
                          value={appComments} 
                          onChange={(e) => setAppComments(e.target.value)} 
                          placeholder="State feedback, adjustments, or audit notes..."
                          className="form-textarea"
                          style={{ minHeight: '80px' }}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => handleApproval('Approved')} className="btn btn-primary" style={{ background: 'var(--accent-green)', color: 'white' }}>
                          Approve Record
                        </button>
                        <button type="button" onClick={() => handleApproval('Returned')} className="btn btn-secondary" style={{ color: 'var(--accent-gold)' }}>
                          Return for Revision
                        </button>
                        <button type="button" onClick={() => handleApproval('Rejected')} className="btn btn-danger">
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You do not have approvals authority for this incident stage.</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="h2-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Incident Transaction Audit Trail</h3>
          <div className="table-container" style={{ marginTop: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Transaction / Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {incident.auditLogs?.map((log, idx) => (
                  <tr key={idx}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td><strong style={{ color: 'var(--accent-cyan)' }}>{log.user}</strong></td>
                    <td style={{ fontWeight: 600 }}>{log.action}</td>
                    <td style={{ fontSize: '0.82rem' }} className="text-muted">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default DetailScreen;
