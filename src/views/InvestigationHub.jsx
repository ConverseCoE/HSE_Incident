import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useUser } from '../context/UserContext';
import { 
  ShieldAlert, AlertCircle, CheckSquare, Calendar, ChevronRight, 
  ClipboardList, Plus, Trash, Save, ArrowDown, X, Activity, 
  FileText, Check, Settings, Users, Shield, Award 
} from 'lucide-react';

const InvestigationHub = ({ onSelectIncident }) => {
  const { incidents, updateInvestigationDetails, addCorrectiveAction, updateIncident } = useDatabase();
  const { currentUser, hasRole, roles, usersList } = useUser();

  // Active View Mode inside the Hub
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('timeline'); // timeline | rca | capa
  const [rcaDiagramMode, setRcaDiagramMode] = useState('fiveWhys'); // fiveWhys | fishbone

  // Local state for workspace inputs
  const [newTimelineEvent, setNewTimelineEvent] = useState({ time: '', description: '', severity: 'info' });
  const [fiveWhysData, setFiveWhysData] = useState({
    problem: '',
    why1: '',
    why2: '',
    why3: '',
    why4: '',
    why5: '',
    rootCause: ''
  });
  
  // Local state for CAPA form
  const [capaForm, setCapaForm] = useState({ title: '', owner: '', priority: 'Medium', dueDate: '' });

  // 1. Calculations for Command Center (KPI Dashboard)
  const activeOrClosed = incidents.filter(inc => inc.investigation);
  const activeInvestigations = incidents.filter(inc => inc.status === 'Under Investigation');
  const completedRca = activeOrClosed.filter(inc => inc.investigation?.fiveWhys?.rootCause?.trim()).length;
  const rcaCompletionRate = activeOrClosed.length > 0 ? Math.round((completedRca / activeOrClosed.length) * 100) : 0;
  
  const overdueCount = activeInvestigations.filter(inc => 
    inc.investigation?.targetCompletionDate && 
    new Date(inc.investigation.targetCompletionDate) < new Date()
  ).length;

  // 2. Kanban Board stage mapping
  // We classify all incidents that are in Pending Review, Under Investigation, or Pending Approval
  const activeIncidents = incidents.filter(inc => 
    inc.status === 'Pending Review' || 
    inc.status === 'Under Investigation' || 
    inc.status === 'Pending Approval'
  );

  const getIncidentStage = (inc) => {
    if (inc.status === 'Pending Review') {
      return 'fact-finding';
    }
    if (inc.status === 'Pending Approval') {
      return 'hse-signoff';
    }
    if (inc.status === 'Under Investigation') {
      const checklistComplete = inc.investigation?.checklist?.every(item => item.completed);
      if (!checklistComplete) {
        return 'fact-finding';
      }
      const hasRootCause = inc.investigation?.fiveWhys?.rootCause?.trim();
      if (!hasRootCause) {
        return 'rca-phase';
      }
      return 'capa-design';
    }
    return 'fact-finding';
  };

  const columns = [
    { id: 'fact-finding', title: 'Fact Finding', description: 'Evidence gathering & checklists' },
    { id: 'rca-phase', title: 'RCA Phase', description: 'Causal mapping & Five Whys' },
    { id: 'capa-design', title: 'CAPA Design', description: 'Defining corrective actions' },
    { id: 'hse-signoff', title: 'HSE Sign-off', description: 'Awaiting manager sign-off' }
  ];

  // Helper to open workspace overlay
  const handleOpenWorkspace = (inc) => {
    setSelectedIncidentId(inc.id);
    setActiveWorkspaceTab('timeline');
    
    // Initialize Five Whys input states
    const inv = inc.investigation;
    setFiveWhysData({
      problem: inv?.fiveWhys?.problem || inc.title || '',
      why1: inv?.fiveWhys?.why1 || '',
      why2: inv?.fiveWhys?.why2 || '',
      why3: inv?.fiveWhys?.why3 || '',
      why4: inv?.fiveWhys?.why4 || '',
      why5: inv?.fiveWhys?.why5 || '',
      rootCause: inv?.fiveWhys?.rootCause || ''
    });

    // Reset forms
    setNewTimelineEvent({ time: '', description: '', severity: 'info' });
    setCapaForm({ title: '', owner: usersList[0]?.name || '', priority: 'Medium', dueDate: '' });
  };

  const activeIncident = incidents.find(i => i.id === selectedIncidentId);

  // Initialize Timeline events if not defined
  const getTimelineEvents = (inc) => {
    if (!inc.investigation) return [];
    if (inc.investigation.timeline) return inc.investigation.timeline;
    // default mock timeline based on incident category
    return [
      { id: 't1', time: '08:00 AM', description: 'Shift safety briefing completed. Work at height hazards reviewed.', severity: 'info' },
      { id: 't2', time: '08:30 AM', description: 'Permit-to-work (PTW) approved and LOTO checklist verified.', severity: 'info' },
      { id: 't3', time: '08:42 AM', description: 'Technician reported gusty conditions at the top platform.', severity: 'warning' },
      { id: 't4', time: '08:45 AM', description: 'Incident occurred: tool dropped from height.', severity: 'critical' }
    ];
  };

  // Initialize Fishbone causes if not defined
  const getFishboneData = (inc) => {
    const defaultFishbone = {
      manpower: ['Technician selected wrong lanyard rating', 'Lack of wind-gust training limits awareness'],
      method: ['Harness tether checks omitted from daily pre-start task', 'Safety checklist lacked dual-tether verification rules'],
      material: ['Consumable lighter-duty lanyard used by mistake', 'Procurement delays on heavy lanyard stocks'],
      environment: ['Wind speed gusts exceeded 12 m/s', 'Narrow hatch clearance on nacelle elevator floor']
    };
    if (!inc.investigation) return defaultFishbone;
    return inc.investigation.fishbone || defaultFishbone;
  };

  // Workspace mutation handlers
  const handleAddTimelineEvent = (e) => {
    e.preventDefault();
    if (!activeIncident || !newTimelineEvent.description.trim()) return;

    const currentTimeline = getTimelineEvents(activeIncident);
    const updatedTimeline = [
      ...currentTimeline,
      {
        id: `t-${Date.now()}`,
        time: newTimelineEvent.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: newTimelineEvent.description,
        severity: newTimelineEvent.severity
      }
    ];

    updateInvestigationDetails(activeIncident.id, { timeline: updatedTimeline }, currentUser.name);
    setNewTimelineEvent({ time: '', description: '', severity: 'info' });
  };

  const handleDeleteTimelineEvent = (eventId) => {
    if (!activeIncident) return;
    const currentTimeline = getTimelineEvents(activeIncident);
    const updatedTimeline = currentTimeline.filter(ev => ev.id !== eventId);
    updateInvestigationDetails(activeIncident.id, { timeline: updatedTimeline }, currentUser.name);
  };

  const handleSaveRCA = () => {
    if (!activeIncident) return;
    updateInvestigationDetails(activeIncident.id, { fiveWhys: fiveWhysData }, currentUser.name);
    alert('RCA models saved successfully.');
  };

  const handleAddFishboneCause = (category) => {
    const cause = prompt(`Add root cause factor under ${category.toUpperCase()}:`);
    if (!cause || !cause.trim()) return;

    const currentFishbone = getFishboneData(activeIncident);
    const updatedCategoryList = [...(currentFishbone[category] || []), cause.trim()];
    
    const updatedFishbone = {
      ...currentFishbone,
      [category]: updatedCategoryList
    };

    updateInvestigationDetails(activeIncident.id, { fishbone: updatedFishbone }, currentUser.name);
  };

  const handleAddCapaAction = (e) => {
    e.preventDefault();
    if (!activeIncident || !capaForm.title.trim()) return;

    const actionData = {
      title: capaForm.title,
      owner: capaForm.owner || currentUser.name,
      priority: capaForm.priority,
      dueDate: capaForm.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      site: activeIncident.site,
      ownerDepartment: 'Safety & Engineering',
      progress: 0,
      completionEvidence: '',
      extensionRequests: []
    };

    addCorrectiveAction(activeIncident.id, actionData, currentUser.name);
    setCapaForm({ title: '', owner: usersList[0]?.name || '', priority: 'Medium', dueDate: '' });
  };

  const handleSubmitSignoff = () => {
    if (!activeIncident) return;
    // Check if there is a root cause defined
    if (!activeIncident.investigation?.fiveWhys?.rootCause?.trim()) {
      alert('Cannot submit. Root cause analysis must be finalized before requesting HSE Manager sign-off.');
      return;
    }
    // Update status to Pending Approval
    if (updateIncident) {
      updateIncident(activeIncident.id, { status: 'Pending Approval' });
      alert('Investigation submitted for HSE Manager review and sign-off.');
      setSelectedIncidentId(null);
    }
  };

  return (
    <div className="investigation-hub animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* SECTION A: COMMAND CENTER (KPI DASHBOARD) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        
        {/* KPI 1 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '20px 24px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          textAlign: 'left'
        }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Active Investigations
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {activeInvestigations.length}
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>cases open</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '20px 24px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          textAlign: 'left'
        }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            RCA Completion Rate
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {rcaCompletionRate}%
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>analyzed</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '20px 24px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          textAlign: 'left'
        }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            CAPA Velocity
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
              4.2 Days
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>avg define time</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '20px 24px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          textAlign: 'left'
        }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Overdue Milestones
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: overdueCount > 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
              {overdueCount}
            </span>
            <span style={{ fontSize: '0.76rem', color: overdueCount > 0 ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: 600 }}>
              {overdueCount > 0 ? 'Urgent Action' : 'On Track'}
            </span>
          </div>
        </div>

      </div>

      {/* SECTION B: THE WORKFLOW BOARD (KANBAN BOARD) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Visual Investigation Workflow Board</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Click on any card to access the specialized timeline, RCA sandbox, and CAPA definition workspaces.
          </p>
        </div>

        {/* Board Columns Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'stretch', minHeight: '400px' }}>
          {columns.map(col => {
            // Get incidents in this column stage
            const colIncidents = activeIncidents.filter(inc => getIncidentStage(inc) === col.id);

            return (
              <div 
                key={col.id} 
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Column Title Header */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {col.title}
                    </h3>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: 'rgba(15,23,42,0.06)',
                      color: 'var(--text-primary)',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {colIncidents.length}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                    {col.description}
                  </span>
                </div>

                {/* Column Body - Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
                  {colIncidents.length === 0 ? (
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px 0',
                      border: '1px dashed rgba(0,0,0,0.06)',
                      borderRadius: '8px',
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem'
                    }}>
                      No incidents in stage
                    </div>
                  ) : (
                    colIncidents.map(inc => {
                      const isOverdue = inc.status === 'Under Investigation' && inc.investigation?.targetCompletionDate && new Date(inc.investigation.targetCompletionDate) < new Date();
                      
                      // Calculate checklist progress
                      const totalChecklist = inc.investigation?.checklist?.length || 0;
                      const completedChecklist = inc.investigation?.checklist?.filter(c => c.completed).length || 0;
                      const checklistPct = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

                      return (
                        <div 
                          key={inc.id}
                          onClick={() => handleOpenWorkspace(inc)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,23,42,0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                              {inc.incidentNumber}
                            </span>
                            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                              {inc.site}
                            </span>
                          </div>

                          <h4 style={{
                            margin: 0,
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            lineHeight: '1.3',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {inc.title}
                          </h4>

                          {/* Progress indicator */}
                          {inc.status === 'Under Investigation' && (
                            <div style={{ marginTop: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                                <span>Checklist Progress</span>
                                <span>{checklistPct}%</span>
                              </div>
                              <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${checklistPct}%`, height: '100%', background: 'var(--accent-cyan)' }} />
                              </div>
                            </div>
                          )}

                          {/* Investigator / Due Date info */}
                          <div style={{
                            borderTop: '1px dashed var(--border-color)',
                            paddingTop: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.68rem',
                            color: 'var(--text-muted)'
                          }}>
                            <span>Inv: {inc.investigation?.leadInvestigator?.split(' ')[0] || 'Unassigned'}</span>
                            {inc.investigation?.targetCompletionDate && (
                              <span style={{ color: isOverdue ? 'var(--accent-red)' : 'inherit', fontWeight: isOverdue ? 700 : 400 }}>
                                {isOverdue ? 'OVERDUE' : new Date(inc.investigation.targetCompletionDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION C: COLLABORATIVE WORKSPACE FOCUS OVERLAY */}
      {selectedIncidentId && activeIncident && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'var(--bg-app)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'fade-in 0.2s ease-out forwards'
        }}>
          {/* Workspace Header */}
          <div style={{
            padding: '16px 32px',
            borderBottom: '1px solid var(--border-color)',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                <span>Investigation Workspace</span>
                <span>/</span>
                <span style={{ color: 'var(--accent-cyan)' }}>{activeIncident.incidentNumber}</span>
              </div>
              <h1 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {activeIncident.title}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button 
                onClick={handleSubmitSignoff} 
                className="btn btn-primary"
                style={{ background: 'var(--accent-cyan)', border: 'none', fontSize: '0.8rem', padding: '8px 16px' }}
              >
                Submit Investigation for Sign-off
              </button>
              <button 
                onClick={() => setSelectedIncidentId(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Workspace Body Split */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            
            {/* Left Drawer / Panel: General Details */}
            <div style={{
              width: '320px',
              borderRight: '1px solid var(--border-color)',
              background: '#ffffff',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              textAlign: 'left',
              overflowY: 'auto'
            }}>
              <div>
                <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>Investigation Overview</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lead Investigator</span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>{activeIncident.investigation?.leadInvestigator || 'Unassigned'}</span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target Completion Date</span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {activeIncident.investigation?.targetCompletionDate ? new Date(activeIncident.investigation.targetCompletionDate).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Incident Risk Rating</span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: activeIncident.riskRating === 'Critical' || activeIncident.riskRating === 'Major' ? 'var(--accent-red)' : 'var(--accent-gold)' }}>
                      {activeIncident.riskRating || 'Moderate'}
                    </span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Workflow Stage</span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, textTransform: 'capitalize', color: 'var(--accent-cyan)' }}>
                      {getIncidentStage(activeIncident).replace('-', ' ')}
                    </span>
                  </div>

                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 10px 0', letterSpacing: '0.5px' }}>Investigation Checklist</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeIncident.investigation?.checklist?.map((item, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={item.completed}
                        onChange={(e) => {
                          const list = [...activeIncident.investigation.checklist];
                          list[idx].completed = e.target.checked;
                          updateInvestigationDetails(activeIncident.id, { checklist: list }, currentUser.name);
                        }}
                      />
                      <span style={{ color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                        {item.task}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Interactive Screen Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              
              {/* Tab Strip */}
              <div style={{ display: 'flex', background: '#ffffff', borderBottom: '1px solid var(--border-color)', padding: '0 32px' }}>
                {[
                  { id: 'timeline', label: '1. Timeline Builder' },
                  { id: 'rca', label: '2. RCA Sandbox (Fishbone & 5-Whys)' },
                  { id: 'capa', label: '3. CAPA Mapping Console' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveWorkspaceTab(tab.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '16px 20px',
                      fontSize: '0.86rem',
                      fontWeight: activeWorkspaceTab === tab.id ? 700 : 500,
                      color: activeWorkspaceTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      borderBottom: activeWorkspaceTab === tab.id ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Work Console Container */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                
                {/* TAB 1: INTERACTIVE TIMELINE BUILDER */}
                {activeWorkspaceTab === 'timeline' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', textAlign: 'left' }}>
                    
                    {/* Visual Vertical Timeline */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '28px' }}>
                      <h3 style={{ fontSize: '0.94rem', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)' }}>Chronological Event Log</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '24px' }}>
                        {/* Timeline Spine Line */}
                        <div style={{
                          position: 'absolute',
                          left: '7px',
                          top: '10px',
                          bottom: '10px',
                          width: '2px',
                          background: 'linear-gradient(180deg, var(--accent-cyan) 0%, var(--accent-gold) 60%, var(--accent-red) 100%)'
                        }} />

                        {getTimelineEvents(activeIncident).map((evt, idx) => {
                          const markerColor = evt.severity === 'critical' ? 'var(--accent-red)' : evt.severity === 'warning' ? 'var(--accent-gold)' : 'var(--accent-cyan)';
                          return (
                            <div key={evt.id || idx} style={{ display: 'flex', gap: '16px', position: 'relative', marginBottom: '24px' }}>
                              {/* Glowing Node */}
                              <div style={{
                                position: 'absolute',
                                left: '-22px',
                                top: '4px',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: '#ffffff',
                                border: `3px solid ${markerColor}`,
                                boxShadow: `0 0 8px ${markerColor}`,
                                zIndex: 2
                              }} />

                              {/* Content Card */}
                              <div style={{
                                background: '#f8fafc',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                flex: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                              }}>
                                <div>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: markerColor, textTransform: 'uppercase' }}>
                                    {evt.time}
                                  </span>
                                  <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                                    {evt.description}
                                  </p>
                                </div>
                                <button 
                                  onClick={() => handleDeleteTimelineEvent(evt.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '2px' }}
                                  title="Delete event"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Timeline Form Control */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <form onSubmit={handleAddTimelineEvent} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Add Event Log</h3>
                        
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Timestamp (e.g. 08:30 AM)</label>
                          <input 
                            type="text" 
                            placeholder="08:45 AM, 12:15 PM..." 
                            value={newTimelineEvent.time} 
                            onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, time: e.target.value })}
                            className="form-control"
                            required
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Marker Severity</label>
                          <select 
                            value={newTimelineEvent.severity} 
                            onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, severity: e.target.value })}
                            className="form-control"
                          >
                            <option value="info">Info (Cyan)</option>
                            <option value="warning">Warning (Gold)</option>
                            <option value="critical">Critical (Red)</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Event Description</label>
                          <textarea 
                            rows={3}
                            placeholder="State sequence details or observed conditions..." 
                            value={newTimelineEvent.description} 
                            onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, description: e.target.value })}
                            className="form-textarea"
                            required
                          />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-cyan)', border: 'none', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Plus size={16} /> Append Milestone
                        </button>
                      </form>
                    </div>

                  </div>
                )}

                {/* TAB 2: VISUALLY INTERACTIVE RCA SANDBOX */}
                {activeWorkspaceTab === 'rca' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
                    
                    {/* Sandbox Mode Selector */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '10px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <button
                          onClick={() => setRcaDiagramMode('fiveWhys')}
                          style={{
                            background: rcaDiagramMode === 'fiveWhys' ? '#ffffff' : 'transparent',
                            border: 'none',
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: rcaDiagramMode === 'fiveWhys' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            boxShadow: rcaDiagramMode === 'fiveWhys' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                          }}
                        >
                          Five Whys Tree
                        </button>
                        <button
                          onClick={() => setRcaDiagramMode('fishbone')}
                          style={{
                            background: rcaDiagramMode === 'fishbone' ? '#ffffff' : 'transparent',
                            border: 'none',
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: rcaDiagramMode === 'fishbone' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            boxShadow: rcaDiagramMode === 'fishbone' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                          }}
                        >
                          Fishbone (Ishikawa)
                        </button>
                      </div>

                      <button onClick={handleSaveRCA} className="btn btn-primary" style={{ background: 'var(--accent-cyan)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <Save size={16} /> Save RCA Models
                      </button>
                    </div>

                    {/* RCA View 1: Five Whys Tree */}
                    {rcaDiagramMode === 'fiveWhys' && (
                      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <h3 style={{ fontSize: '0.94rem', fontWeight: 700, alignSelf: 'flex-start', margin: '0 0 10px 0' }}>Linear Causal Ladder</h3>
                        
                        {/* Problem Block */}
                        <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: '100%', background: 'rgba(239, 68, 68, 0.05)', border: '2px solid var(--accent-red)', padding: '12px 18px', borderRadius: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase', display: 'block' }}>Primary Problem / Event</span>
                            <textarea 
                              value={fiveWhysData.problem} 
                              onChange={(e) => setFiveWhysData({ ...fiveWhysData, problem: e.target.value })}
                              style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', resize: 'none' }}
                              rows={2}
                            />
                          </div>
                          <ArrowDown size={20} style={{ color: 'var(--border-color)', margin: '6px 0' }} />
                        </div>

                        {/* Whys Loop */}
                        {[1, 2, 3, 4, 5].map(num => {
                          const field = `why${num}`;
                          return (
                            <div key={num} style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ width: '100%', background: '#f8fafc', border: '1px solid var(--border-color)', padding: '10px 18px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>Why {num}</span>
                                <input 
                                  type="text" 
                                  value={fiveWhysData[field]} 
                                  onChange={(e) => setFiveWhysData({ ...fiveWhysData, [field]: e.target.value })}
                                  placeholder={`Define why this causal step occurred...`}
                                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.82rem', outline: 'none' }}
                                />
                              </div>
                              <ArrowDown size={20} style={{ color: 'var(--border-color)', margin: '6px 0' }} />
                            </div>
                          );
                        })}

                        {/* Root Cause Block */}
                        <div style={{ width: '100%', maxWidth: '600px' }}>
                          <div style={{ width: '100%', background: 'rgba(16, 185, 129, 0.05)', border: '2px dashed var(--accent-green)', padding: '14px 18px', borderRadius: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', display: 'block' }}>Final Systemic Root Cause</span>
                            <textarea 
                              value={fiveWhysData.rootCause} 
                              onChange={(e) => setFiveWhysData({ ...fiveWhysData, rootCause: e.target.value })}
                              placeholder="Write finalized root cause statement (e.g. procurement classification errors, insufficient harness standard operating procedures)..."
                              style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', outline: 'none', resize: 'none' }}
                              rows={2}
                            />
                          </div>
                        </div>

                      </div>
                    )}

                    {/* RCA View 2: Fishbone Diagram */}
                    {rcaDiagramMode === 'fishbone' && (
                      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '36px', overflowX: 'auto' }}>
                        <h3 style={{ fontSize: '0.94rem', fontWeight: 700, margin: '0 0 20px 0' }}>Ishikawa Factors Board</h3>

                        {/* Styled Fishbone Layout */}
                        <div style={{ minWidth: '800px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '30px', padding: '20px 0' }}>
                          
                          {/* Fishbone Top Categories */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', paddingBottom: '30px' }}>
                            
                            {/* Manpower */}
                            <div style={{ borderRight: '2px solid var(--accent-cyan)', paddingRight: '20px', position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--accent-cyan)', paddingBottom: '6px', marginBottom: '8px' }}>
                                <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>1. Manpower (Human Factors)</strong>
                                <button onClick={() => handleAddFishboneCause('manpower')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center' }} title="Add factor">
                                  <Plus size={14} />
                                </button>
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {getFishboneData(activeIncident).manpower.map((cause, cIdx) => (
                                  <li key={cIdx} style={{ listStyleType: 'square' }}>{cause}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Method */}
                            <div style={{ borderRight: '2px solid var(--accent-cyan)', paddingRight: '20px', position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--accent-cyan)', paddingBottom: '6px', marginBottom: '8px' }}>
                                <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>2. Method (Procedures)</strong>
                                <button onClick={() => handleAddFishboneCause('method')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center' }} title="Add factor">
                                  <Plus size={14} />
                                </button>
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {getFishboneData(activeIncident).method.map((cause, cIdx) => (
                                  <li key={cIdx} style={{ listStyleType: 'square' }}>{cause}</li>
                                ))}
                              </ul>
                            </div>

                          </div>

                          {/* Fishbone Spine (Central horizontal line) */}
                          <div style={{
                            position: 'relative',
                            height: '4px',
                            background: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            margin: '10px 0'
                          }}>
                            {/* Head of the fish: The Problem */}
                            <div style={{
                              position: 'absolute',
                              right: '0',
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '2px solid var(--accent-red)',
                              borderRadius: '8px',
                              padding: '8px 14px',
                              width: '180px',
                              transform: 'translateX(50%)',
                              zIndex: 10,
                              textAlign: 'center'
                            }}>
                              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--accent-red)', display: 'block', textTransform: 'uppercase' }}>Problem Effect</span>
                              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {activeIncident.title}
                              </span>
                            </div>
                          </div>

                          {/* Fishbone Bottom Categories */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', paddingTop: '30px' }}>
                            
                            {/* Material */}
                            <div style={{ borderRight: '2px solid var(--accent-cyan)', paddingRight: '20px', position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--accent-cyan)', paddingBottom: '6px', marginBottom: '8px' }}>
                                <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>3. Material (Equipment/PPE)</strong>
                                <button onClick={() => handleAddFishboneCause('material')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center' }} title="Add factor">
                                  <Plus size={14} />
                                </button>
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {getFishboneData(activeIncident).material.map((cause, cIdx) => (
                                  <li key={cIdx} style={{ listStyleType: 'square' }}>{cause}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Environment */}
                            <div style={{ borderRight: '2px solid var(--accent-cyan)', paddingRight: '20px', position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--accent-cyan)', paddingBottom: '6px', marginBottom: '8px' }}>
                                <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>4. Environment / Machine</strong>
                                <button onClick={() => handleAddFishboneCause('environment')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center' }} title="Add factor">
                                  <Plus size={14} />
                                </button>
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {getFishboneData(activeIncident).environment.map((cause, cIdx) => (
                                  <li key={cIdx} style={{ listStyleType: 'square' }}>{cause}</li>
                                ))}
                              </ul>
                            </div>

                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB 3: CAPA MAPPING CONSOLE */}
                {activeWorkspaceTab === 'capa' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '32px', textAlign: 'left' }}>
                    
                    {/* Left Side: Findings & Barriers */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* Root Cause Card */}
                      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Award size={16} style={{ color: 'var(--accent-green)' }} />
                          Systemic Root Cause Found
                        </h3>
                        <p style={{
                          fontSize: '0.84rem',
                          margin: 0,
                          padding: '12px 16px',
                          borderRadius: '8px',
                          background: 'rgba(16, 185, 129, 0.04)',
                          border: '1px dashed rgba(16, 185, 129, 0.2)',
                          fontWeight: 600,
                          lineHeight: '1.4'
                        }}>
                          {activeIncident.investigation?.fiveWhys?.rootCause || 'Root cause statement not defined yet. Go to RCA tab to write it.'}
                        </p>
                      </div>

                      {/* Barrier Analysis */}
                      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Shield size={16} style={{ color: 'var(--accent-cyan)' }} />
                          Safety Barrier Failures Review
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {[
                            { id: 'b1', name: 'Technical (Tool Lanyard)', status: 'Failed', note: 'Fractured tether connector' },
                            { id: 'b2', name: 'Operational (Harness Checks)', status: 'Failed', note: 'Omitted from toolbox check sheet' },
                            { id: 'b3', name: 'Administrative (LOTO Permit)', status: 'Effective', note: 'Rigging clearance signed off' }
                          ].map(bar => (
                            <div key={bar.id} style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                              <div>
                                <strong>{bar.name}</strong>
                                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{bar.note}</span>
                              </div>
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                background: bar.status === 'Failed' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                color: bar.status === 'Failed' ? 'var(--accent-red)' : 'var(--accent-green)'
                              }}>
                                {bar.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Right Side: CAPA Definition and Assign Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* CAPA Creation Form */}
                      <form onSubmit={handleAddCapaAction} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Create & Map Corrective Action</h3>
                        
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Corrective Action Title *</label>
                          <input 
                            type="text" 
                            placeholder="Deploy double-lock lanyards, revise rigging SOP..." 
                            value={capaForm.title} 
                            onChange={(e) => setCapaForm({ ...capaForm, title: e.target.value })}
                            className="form-control"
                            required
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Assigned Owner</label>
                            <select 
                              value={capaForm.owner} 
                              onChange={(e) => setCapaForm({ ...capaForm, owner: e.target.value })}
                              className="form-control"
                            >
                              {usersList.map(u => (
                                <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Due Date</label>
                            <input 
                              type="date" 
                              value={capaForm.dueDate} 
                              onChange={(e) => setCapaForm({ ...capaForm, dueDate: e.target.value })}
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Priority Level</label>
                          <select 
                            value={capaForm.priority} 
                            onChange={(e) => setCapaForm({ ...capaForm, priority: e.target.value })}
                            className="form-control"
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-green)', color: 'white', border: 'none', width: '100%', fontSize: '0.82rem', marginTop: '6px' }}>
                          Assign Corrective Action
                        </button>
                      </form>

                      {/* Mapped Actions list */}
                      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 12px 0' }}>Mapped Corrective Actions ({activeIncident.actions?.length || 0})</h3>
                        {(!activeIncident.actions || activeIncident.actions.length === 0) ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No CAPA actions assigned to this incident yet. Use form above to map actions.
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {activeIncident.actions.map(act => (
                              <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                                <div>
                                  <strong style={{ color: 'var(--accent-cyan)', display: 'block' }}>{act.actionNumber}</strong>
                                  <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)' }}>{act.title}</span>
                                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assigned to: {act.owner} | Due: {act.dueDate}</span>
                                </div>
                                <span style={{
                                  fontSize: '0.66rem',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  background: act.status === 'Completed' || act.status === 'Verified' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(6, 182, 212, 0.08)',
                                  color: act.status === 'Completed' || act.status === 'Verified' ? 'var(--accent-green)' : 'var(--accent-cyan)'
                                }}>
                                  {act.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default InvestigationHub;
