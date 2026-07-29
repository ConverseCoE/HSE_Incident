import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useUser } from '../context/UserContext';
import { 
  ClipboardList, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileUp, 
  Save, 
  Check, 
  X, 
  ChevronRight,
  Kanban,
  Table as TableIcon,
  UserCheck,
  Filter,
  Shield,
  Award,
  ArrowRight,
  Plus
} from 'lucide-react';

const ActionManagement = ({ onSelectIncident }) => {
  const { incidents, updateActionStatus, requestExtension, resolveExtensionRequest } = useDatabase();
  const { currentUser, hasRole, roles } = useUser();

  // View States
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [filterMyActionsOnly, setFilterMyActionsOnly] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState('details'); // 'progress' | 'extend' | 'details' | 'resolve'

  // Forms
  const [progress, setProgress] = useState(0);
  const [evidence, setEvidence] = useState('');
  const [extDate, setExtDate] = useState('');
  const [extReason, setExtReason] = useState('');
  const [extControls, setExtControls] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Collect all actions across incidents
  const allActions = incidents.reduce((acc, inc) => {
    const acts = inc.actions || [];
    acts.forEach(act => {
      acc.push({
        ...act,
        incidentId: inc.id,
        incidentNum: inc.incidentNumber,
        incidentTitle: inc.title
      });
    });
    return acc;
  }, []);

  // Filter actions based on user selection or role
  const filteredActions = allActions.filter(act => {
    if (filterMyActionsOnly) {
      return act.owner === currentUser.name;
    }
    if (currentUser.role === roles.ACTION_OWNER) {
      return act.owner === currentUser.name;
    }
    if (currentUser.role === roles.SUPERVISOR) {
      return act.site === currentUser.site;
    }
    return true; // HSE, Admin, Executives see all
  });

  const myActionsCount = allActions.filter(a => a.owner === currentUser.name).length;
  const myPendingProgressCount = allActions.filter(a => a.owner === currentUser.name && (a.status === 'In progress' || a.status === 'Accepted')).length;
  const overdueActionsCount = allActions.filter(a => a.status !== 'Completed' && a.status !== 'Verified' && new Date(a.dueDate) < new Date()).length;
  const pendingVerificationCount = allActions.filter(a => a.status === 'Pending verification' || a.status === 'Pending Verification').length;

  const activeAction = allActions.find(a => a.id === selectedActionId);

  const handleSelectAction = (act, mode = 'details') => {
    setSelectedActionId(act.id);
    setSelectedIncidentId(act.incidentId);
    setProgress(act.progress || 0);
    setEvidence(act.completionEvidence || '');
    setUploadedFileName('');
    setDrawerMode(mode);
    setShowDrawer(true);
  };

  const handleUpdateProgress = () => {
    if (!activeAction) return;
    const isCompleted = parseInt(progress, 10) === 100;
    
    updateActionStatus(selectedIncidentId, selectedActionId, {
      progress: parseInt(progress, 10),
      status: isCompleted ? 'Pending verification' : 'In progress',
      completionEvidence: isCompleted ? `${evidence} [Attachment: ${uploadedFileName || 'No file uploaded'}]` : ''
    }, currentUser.name);

    alert('Action progress updated successfully.');
  };

  const handleAccept = (act) => {
    updateActionStatus(act.incidentId, act.id, { status: 'Accepted' }, currentUser.name);
  };

  const handleRequestExt = (e) => {
    e.preventDefault();
    if (!extDate || !extReason) return;
    
    requestExtension(selectedIncidentId, selectedActionId, {
      requestedDueDate: extDate,
      reason: extReason,
      interimControls: extControls
    }, currentUser.name);

    setExtDate('');
    setExtReason('');
    setExtControls('');
    alert('Extension request submitted for manager approval.');
  };

  const handleResolveExt = (reqId, isApproved) => {
    resolveExtensionRequest(
      selectedIncidentId, 
      selectedActionId, 
      reqId, 
      isApproved, 
      isApproved ? 'Extension approved based on interim controls.' : 'Extension rejected. Maintain original deadline.', 
      currentUser.name
    );
  };

  // Helper for SLA Due-Date Badges
  const getSlaBadge = (act) => {
    const isClosed = act.status === 'Completed' || act.status === 'Verified';
    if (isClosed) {
      return <span style={{ fontSize: '0.64rem', fontWeight: 700, color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>VERIFIED</span>;
    }
    const dueDate = new Date(act.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span style={{ fontSize: '0.64rem', fontWeight: 700, color: 'var(--accent-red)', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>OVERDUE ({Math.abs(diffDays)}d)</span>;
    }
    if (diffDays <= 2) {
      return <span style={{ fontSize: '0.64rem', fontWeight: 700, color: 'var(--accent-gold)', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>DUE SOON ({diffDays}d)</span>;
    }
    return <span style={{ fontSize: '0.64rem', fontWeight: 600, color: 'var(--text-muted)', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>On Track ({diffDays}d)</span>;
  };

  // Kanban Columns Mapping
  const kanbanColumns = [
    {
      id: 'backlog',
      title: '1. Backlog / Assigned',
      desc: 'Newly assigned action items',
      color: '#64748b',
      filter: (a) => a.status === 'Assigned' || a.status === 'Pending' || !a.status
    },
    {
      id: 'in-progress',
      title: '2. In Progress',
      desc: 'Remediation under execution',
      color: 'var(--accent-cyan)',
      filter: (a) => a.status === 'In progress' || a.status === 'In Progress' || a.status === 'Accepted'
    },
    {
      id: 'pending-verification',
      title: '3. Pending Verification',
      desc: 'Audit evidence verification',
      color: 'var(--accent-gold)',
      filter: (a) => a.status === 'Pending verification' || a.status === 'Pending Verification'
    },
    {
      id: 'closed',
      title: '4. Verified & Closed',
      desc: 'Verified & compliance archived',
      color: 'var(--accent-green)',
      filter: (a) => a.status === 'Completed' || a.status === 'Verified' || a.status === 'Closed'
    }
  ];

  return (
    <div className="action-management animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0px' }}>
      
      {/* 1. Personalized "My Actions" Hero Focus Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '12px',
        padding: '24px 32px',
        color: '#ffffff',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        textAlign: 'left',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.12)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <UserCheck size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              Action Registry & Remediation Center
            </span>
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>
            Welcome back, {currentUser.name}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
            You have <strong style={{ color: '#ffffff' }}>{myActionsCount}</strong> assigned actions ({myPendingProgressCount} requiring progress updates).
          </p>
        </div>

        {/* Action Counters & Filter Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.66rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Overdue SLA</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: overdueActionsCount > 0 ? '#ef4444' : '#10b981' }}>{overdueActionsCount}</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.66rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Awaiting Audit</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f59e0b' }}>{pendingVerificationCount}</span>
          </div>

          <button
            onClick={() => setFilterMyActionsOnly(!filterMyActionsOnly)}
            style={{
              background: filterMyActionsOnly ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)',
              border: filterMyActionsOnly ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
              color: filterMyActionsOnly ? '#0f172a' : '#ffffff',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Filter size={16} />
            {filterMyActionsOnly ? 'Showing My Actions' : 'Filter My Actions'}
          </button>
        </div>
      </div>

      {/* 2. Control Bar: View Toggle Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '12px 20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Showing {filteredActions.length} Action Items
          </span>
          {filterMyActionsOnly && (
            <span style={{ fontSize: '0.72rem', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              Filtered: My Actions
            </span>
          )}
        </div>

        {/* View Switcher Toggle */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setViewMode('kanban')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: viewMode === 'kanban' ? 700 : 500,
              background: viewMode === 'kanban' ? '#ffffff' : 'transparent',
              color: viewMode === 'kanban' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Kanban size={15} /> Kanban Board
          </button>
          
          <button
            onClick={() => setViewMode('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: viewMode === 'table' ? 700 : 500,
              background: viewMode === 'table' ? '#ffffff' : 'transparent',
              color: viewMode === 'table' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <TableIcon size={15} /> Master Data Table
          </button>
        </div>
      </div>

      {/* 3. VIEW MODE 1: KANBAN WORKFLOW BOARD */}
      {viewMode === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'left', alignItems: 'start' }}>
          {kanbanColumns.map(col => {
            const colActions = filteredActions.filter(col.filter);
            return (
              <div 
                key={col.id} 
                style={{ 
                  background: '#ffffff', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  maxHeight: 'calc(100vh - 280px)',
                  overflow: 'hidden'
                }}
              >
                {/* Column Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '0.86rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{col.title}</h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{col.desc}</span>
                  </div>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, background: '#ffffff', color: col.color, padding: '2px 10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    {colActions.length}
                  </span>
                </div>

                {/* Column Cards Scrollable List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {colActions.length === 0 ? (
                    <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                      No actions in {col.title}
                    </div>
                  ) : (
                    colActions.map(act => {
                      const isCA = act.type !== 'Preventive';
                      return (
                        <div
                          key={act.id}
                          onClick={() => handleSelectAction(act, 'details')}
                          style={{
                            background: '#ffffff',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            padding: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,23,42,0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                          }}
                        >
                          {/* Card Header: Action Number & CA/PA Badge */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                              {act.actionNumber}
                            </span>
                            
                            {/* CA vs PA Badge */}
                            <span style={{
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: isCA ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                              color: isCA ? 'var(--accent-red)' : 'var(--accent-green)',
                              border: isCA ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)'
                            }}>
                              {isCA ? '🔴 CA (Corrective)' : '🟢 PA (Preventive)'}
                            </span>
                          </div>

                          {/* Action Title */}
                          <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.35' }}>
                            {act.title}
                          </h4>

                          {/* Parent Incident Tag */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              {act.incidentNum || 'INC-2026'}
                            </span>
                            <span>• {act.site}</span>
                          </div>

                          {/* Progress Slider Bar */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                              <span>Progress</span>
                              <strong style={{ color: 'var(--accent-cyan)' }}>{act.progress || 0}%</strong>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${act.progress || 0}%`, height: '100%', background: 'var(--accent-cyan)', borderRadius: '2px' }} />
                            </div>
                          </div>

                          {/* Card Footer: SLA & Owner Info */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', fontSize: '0.7rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Owner: <strong>{act.owner}</strong></span>
                            {getSlaBadge(act)}
                          </div>

                          {/* Card Action Quick Controls */}
                          {act.owner === currentUser.name && (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                              {act.status === 'Assigned' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleAccept(act); }}
                                  style={{ flex: 1, padding: '4px', fontSize: '0.7rem', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Accept Action
                                </button>
                              )}
                              {(act.status === 'Accepted' || act.status === 'In progress' || act.status === 'In Progress') && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleSelectAction(act, 'progress'); }}
                                  style={{ flex: 1, padding: '5px', fontSize: '0.7rem', background: 'var(--accent-cyan)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Update Progress
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. VIEW MODE 2: MASTER DATA TABLE VIEW */}
      {viewMode === 'table' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          {filteredActions.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ClipboardList size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
              No action items found matching your filters.
            </div>
          ) : (
            <div className="table-container" style={{ marginTop: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Action Number</th>
                    <th>Classification</th>
                    <th>Action Item Title</th>
                    <th>Parent Incident</th>
                    <th>Site</th>
                    <th>Assigned Owner</th>
                    <th>Due Date SLA</th>
                    <th>Priority</th>
                    <th>Progress</th>
                    <th>Operations</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActions.map(act => {
                    const isCA = act.type !== 'Preventive';
                    return (
                      <tr 
                        key={act.id} 
                        onClick={() => handleSelectAction(act, 'details')}
                        style={{ cursor: 'pointer', background: selectedActionId === act.id ? 'var(--bg-panel-hover)' : 'transparent' }}
                      >
                        <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{act.actionNumber}</td>
                        <td>
                          <span style={{
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: isCA ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                            color: isCA ? 'var(--accent-red)' : 'var(--accent-green)',
                            border: isCA ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)'
                          }}>
                            {isCA ? '🔴 CA' : '🟢 PA'}
                          </span>
                        </td>
                        <td style={{ maxWidth: '240px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: 600 }}>{act.title}</td>
                        <td style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{act.incidentNum || 'INC-2026'}</td>
                        <td>{act.site}</td>
                        <td style={{ fontWeight: 600 }}>{act.owner}</td>
                        <td>{getSlaBadge(act)}</td>
                        <td>
                          <span style={{ 
                            fontSize: '0.68rem', 
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: act.priority === 'High' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(217, 119, 6, 0.08)',
                            color: act.priority === 'High' ? 'var(--accent-red)' : 'var(--accent-gold)',
                            fontWeight: 700
                          }}>
                            {act.priority}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '50px', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${act.progress || 0}%`, height: '100%', background: 'var(--accent-cyan)' }} />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{act.progress || 0}%</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {act.owner === currentUser.name && (act.status === 'Accepted' || act.status === 'In progress' || act.status === 'In Progress') && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleSelectAction(act, 'progress'); }}
                                className="btn btn-primary" 
                                style={{ padding: '4px 8px', fontSize: '0.72rem', background: 'var(--accent-cyan)', border: 'none' }}
                              >
                                Update Progress
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleSelectAction(act, 'details'); }}
                              className="btn btn-secondary" 
                              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            >
                              Details
                            </button>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', width: '40px' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onSelectIncident(act.incidentId); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px' }}
                            title="View Parent Incident"
                          >
                            <ChevronRight size={18} style={{ color: 'var(--accent-cyan)' }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. SLIDING DRAWER DETAILS & EVIDENCE UPLOAD */}
      {showDrawer && activeAction && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justify: 'flex-end',
            zIndex: 1000
          }} 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDrawer(false);
            }
          }}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '500px',
              height: '100%',
              background: '#ffffff',
              boxShadow: '-4px 0 24px rgba(15,23,42,0.15)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              animation: 'slide-in-drawer 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    {activeAction.actionNumber} • {activeAction.site}
                  </span>
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: activeAction.type !== 'Preventive' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                    color: activeAction.type !== 'Preventive' ? 'var(--accent-red)' : 'var(--accent-green)'
                  }}>
                    {activeAction.type !== 'Preventive' ? '🔴 Corrective (CA)' : '🟢 Preventive (PA)'}
                  </span>
                </div>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {drawerMode === 'progress' && 'Update Action Progress & Evidence'}
                  {drawerMode === 'extend' && 'Request Due Date Extension'}
                  {drawerMode === 'resolve' && 'Resolve Extension Request'}
                  {drawerMode === 'details' && 'Action Item Details'}
                </h3>
              </div>
              <button 
                onClick={() => setShowDrawer(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
              
              {/* Parent Incident Banner */}
              <div 
                onClick={() => { setShowDrawer(false); onSelectIncident(activeAction.incidentId); }}
                style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Parent Incident</span>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>{activeAction.incidentNum || 'INC-2026-004'}: {activeAction.incidentTitle}</strong>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--accent-cyan)' }} />
              </div>

              {/* Action Description */}
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>Action Title & Description</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                  {activeAction.title}
                </p>
              </div>

              {/* Owner Info & Details List */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Owner</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>{activeAction.owner}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Department</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{activeAction.ownerDepartment || 'Safety Operations'}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Target Due Date</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>{new Date(activeAction.dueDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Priority Level</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: activeAction.priority === 'High' ? 'var(--accent-red)' : 'var(--accent-gold)' }}>
                    {activeAction.priority}
                  </span>
                </div>
              </div>

              {/* Progress Update Slider (Only in progress mode) */}
              {drawerMode === 'progress' && activeAction.owner === currentUser.name && (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>Remediation Progress</span>
                    <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>{progress}%</strong>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="10"
                    value={progress} 
                    onChange={(e) => setProgress(e.target.value)} 
                    style={{ width: '100%', marginTop: '8px', cursor: 'pointer', accentColor: 'var(--accent-cyan)' }}
                  />
                  
                  {parseInt(progress, 10) === 100 && (
                    <>
                      <div className="form-group" style={{ marginTop: '16px' }}>
                        <label className="form-label">Remediation Evidence Description *</label>
                        <textarea 
                          value={evidence}
                          onChange={(e) => setEvidence(e.target.value)}
                          placeholder="State steps performed, safety checks, or procedures updated..."
                          className="form-textarea"
                          style={{ fontSize: '0.8rem', minHeight: '60px' }}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ marginTop: '12px' }}>
                        <label className="form-label">Attach Photo & PDF Proof *</label>
                        <div 
                          style={{
                            border: '2px dashed var(--border-color)',
                            borderRadius: '8px',
                            padding: '16px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: '#ffffff',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => {
                            const dummyDocs = ['post_repair_photo.jpg', 'calibration_cert_signed.pdf', 'loto_clearance_signoff.png', 'remediation_manifest.pdf'];
                            const selectedDoc = dummyDocs[Math.floor(Math.random() * dummyDocs.length)];
                            setUploadedFileName(selectedDoc);
                          }}
                        >
                          <FileUp size={24} style={{ color: 'var(--accent-cyan)', marginBottom: '6px', marginLeft: 'auto', marginRight: 'auto' }} />
                          <p style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>Click to Upload File (Photos, PDFs, Manifests)</p>
                          {uploadedFileName && (
                            <div style={{ marginTop: '10px', background: 'rgba(16, 185, 129, 0.08)', padding: '6px 12px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                              <Check size={14} style={{ color: 'var(--accent-green)' }} />
                              <span style={{ fontSize: '0.78rem', color: 'var(--accent-green)', fontWeight: 600 }}>{uploadedFileName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <button onClick={handleUpdateProgress} className="btn btn-primary" style={{ width: '100%', marginTop: '14px', fontSize: '0.82rem', background: 'var(--accent-cyan)', border: 'none' }}>
                    Save & Update Action Progress
                  </button>
                </div>
              )}

              {/* Progress Update Read-Only Details */}
              {(drawerMode === 'details' || drawerMode === 'resolve') && (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>Status Details</span>
                  <p style={{ fontSize: '0.86rem', fontWeight: 600, marginTop: '4px', margin: 0 }}>
                    Currently <strong style={{ color: 'var(--accent-cyan)' }}>{activeAction.status}</strong> at {activeAction.progress}% progress.
                  </p>
                  {activeAction.completionEvidence && (
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <strong>Evidence Log:</strong> {activeAction.completionEvidence}
                    </div>
                  )}
                </div>
              )}

              {/* Extensions Requests section */}
              {(drawerMode === 'extend' || drawerMode === 'resolve' || (drawerMode === 'details' && activeAction.extensionRequests?.length > 0)) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} style={{ color: 'var(--accent-gold)' }} />
                    Due-Date Extensions
                  </h4>

                  {/* Show active requests */}
                  {activeAction.extensionRequests?.map(req => {
                    const showResolveButtons = drawerMode === 'resolve' && req.status === 'Pending' && hasRole([roles.HSE_MANAGER, roles.ADMIN]);
                    return (
                      <div 
                        key={req.id} 
                        style={{ 
                          background: 'rgba(217, 119, 6, 0.04)', 
                          padding: '12px', 
                          borderRadius: '8px', 
                          border: '1px solid rgba(217, 119, 6, 0.1)',
                          fontSize: '0.8rem'
                        }}
                      >
                        <p style={{ margin: '0 0 4px 0' }}><strong>Proposed Due Date:</strong> {req.requestedDueDate}</p>
                        <p style={{ margin: '0 0 4px 0' }}><strong>Reason:</strong> "{req.reason}"</p>
                        <p style={{ margin: '0 0 4px 0' }}><strong>Controls:</strong> "{req.interimControls}"</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed rgba(0,0,0,0.06)' }}>
                          <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>{req.status}</span>
                          
                          {showResolveButtons && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleResolveExt(req.id, true)} className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.7rem', background: 'var(--accent-green)', color: 'white', border: 'none' }}>Approve</button>
                              <button onClick={() => handleResolveExt(req.id, false)} className="btn btn-danger" style={{ padding: '3px 8px', fontSize: '0.7rem', border: 'none' }}>Deny</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Request Extension Form */}
                  {drawerMode === 'extend' && activeAction.owner === currentUser.name && (
                    <form onSubmit={handleRequestExt} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block' }}>Request Due Date Extension</span>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">New Target Due Date *</label>
                        <input type="date" value={extDate} onChange={(e) => setExtDate(e.target.value)} className="form-control" style={{ fontSize: '0.82rem' }} required />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Reason *</label>
                        <input type="text" value={extReason} onChange={(e) => setExtReason(e.target.value)} className="form-control" style={{ fontSize: '0.82rem' }} placeholder="Delayed parts delivery, technical review..." required />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Interim Safe Controls</label>
                        <input type="text" value={extControls} onChange={(e) => setExtControls(e.target.value)} className="form-control" style={{ fontSize: '0.82rem' }} placeholder="Equipped backup locks, daily watch log..." />
                      </div>
                      <button type="submit" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', marginTop: '4px' }}>
                        Submit Extension Request
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>

            {/* Sticky bottom footer */}
            <div style={{
              padding: '16px 28px',
              borderTop: '1px solid var(--border-color)',
              background: '#f8fafc',
              display: 'flex',
              justify: 'flex-end',
              gap: '10px',
              zIndex: 10
            }}>
              <button 
                type="button" 
                onClick={() => setShowDrawer(false)} 
                className="btn btn-secondary" 
                style={{ fontSize: '0.82rem', padding: '8px 24px' }}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ActionManagement;
