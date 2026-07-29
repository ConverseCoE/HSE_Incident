import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useUser } from '../context/UserContext';
import {
  FileText, ShieldAlert, CheckSquare, Clock,
  PhoneCall, AlertTriangle, Lightbulb, ArrowRight, Shield
} from 'lucide-react';

const HomeScreen = ({ onViewIncident, onNewReport, onGoToTab }) => {
  const { incidents, safetyAlerts } = useDatabase();
  const { currentUser, hasRole, roles } = useUser();

  const [activeWorklistTab, setActiveWorklistTab] = useState('reports');

  // Premium render helpers for modern SaaS tables
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderStatusBadge = (status) => {
    if (!status) return null;
    let bg = 'rgba(18, 78, 70, 0.06)';
    let color = 'var(--accent-cyan)';
    if (status === 'Pending Review' || status === 'Submitted' || status === 'Pending Action' || status === 'Open') {
      bg = 'rgba(100, 116, 139, 0.08)';
      color = 'var(--text-secondary)';
    } else if (status === 'Under Investigation' || status === 'Investigation' || status === 'In Progress') {
      bg = 'rgba(124, 58, 237, 0.08)';
      color = 'var(--accent-purple)';
    } else if (status === 'Pending Approval' || status === 'Investigation Approved' || status === 'Approved & Pending Closure') {
      bg = 'rgba(217, 119, 6, 0.08)';
      color = 'var(--accent-gold)';
    } else if (status === 'Closed' || status === 'Closed & Published' || status === 'Approved' || status === 'Completed' || status === 'Verified') {
      bg = 'rgba(5, 150, 105, 0.08)';
      color = 'var(--accent-green)';
    } else if (status === 'Overdue') {
      bg = 'rgba(225, 29, 72, 0.08)';
      color = 'var(--accent-red)';
    }

    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '20px',
        background: bg,
        color: color,
        fontSize: '0.72rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        display: 'inline-block'
      }}>
        {status}
      </span>
    );
  };

  const renderRiskCell = (risk) => {
    if (!risk) return null;
    let dotColor = 'var(--accent-green)';
    let bg = 'rgba(5, 150, 105, 0.06)';
    let textCol = 'var(--accent-green)';
    if (risk === 'Moderate' || risk === 'Medium' || risk === 'Medium Priority') {
      dotColor = 'var(--accent-cyan)';
      bg = 'rgba(18, 78, 70, 0.06)';
      textCol = 'var(--accent-cyan)';
    } else if (risk === 'High') {
      dotColor = 'var(--accent-purple)';
      bg = 'rgba(124, 58, 237, 0.06)';
      textCol = 'var(--accent-purple)';
    } else if (risk === 'Major') {
      dotColor = 'var(--accent-gold)';
      bg = 'rgba(217, 119, 6, 0.06)';
      textCol = 'var(--accent-gold)';
    } else if (risk === 'Critical') {
      dotColor = 'var(--accent-red)';
      bg = 'rgba(225, 29, 72, 0.06)';
      textCol = 'var(--accent-red)';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '20px',
        background: bg,
        color: textCol,
        fontSize: '0.72rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.03em'
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: dotColor
        }}></span>
        {risk}
      </span>
    );
  };

  const renderOwnerCell = (name) => {
    if (!name) return null;
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'var(--bg-panel-solid)',
          color: 'var(--text-secondary)',
          fontSize: '0.68rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-color)',
          flexShrink: 0
        }}>
          {initials}
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{name}</span>
      </div>
    );
  };

  // Filter incidents for display based on role
  const myReports = incidents.filter(inc => inc.reportedBy === currentUser.name);

  // Incidents requiring supervisor review (Status: 'Pending Review' / 'Submitted' and matching site/ALL)
  const reviewRequired = incidents.filter(inc => {
    if (inc.status !== 'Pending Review' && inc.status !== 'Submitted') return false;
    return currentUser.role === roles.SUPERVISOR ? inc.site === currentUser.site : true;
  });

  // Action owners filtering
  const myActions = incidents.reduce((acc, inc) => {
    const owned = inc.actions?.filter(act => act.owner === currentUser.name && act.status !== 'Completed' && act.status !== 'Verified') || [];
    if (owned.length > 0) {
      acc.push(...owned.map(a => ({ ...a, incidentId: inc.id, incidentTitle: inc.title, incidentNum: inc.incidentNumber })));
    }
    return acc;
  }, []);

  // Overdue actions filtering
  const overdueActions = incidents.reduce((acc, inc) => {
    const overdue = inc.actions?.filter(act => {
      const isOverdue = act.status !== 'Completed' && act.status !== 'Verified' && new Date(act.dueDate) < new Date();
      return isOverdue && (hasRole([roles.HSE_MANAGER, roles.ADMIN]) || act.owner === currentUser.name);
    }) || [];
    if (overdue.length > 0) {
      acc.push(...overdue.map(a => ({ ...a, incidentId: inc.id, incidentTitle: inc.title, incidentNum: inc.incidentNumber })));
    }
    return acc;
  }, []);

  const overdueActionsCount = overdueActions.length;

  const visibleTabs = ['reports', 'lessons'];
  if (hasRole([roles.ACTION_OWNER, roles.ADMIN, roles.HSE_OFFICER, roles.HSE_MANAGER, roles.SUPERVISOR])) {
    visibleTabs.push('actions');
  }
  if (hasRole([roles.SUPERVISOR, roles.HSE_MANAGER, roles.SITE_MANAGER, roles.ADMIN])) {
    visibleTabs.push('review');
  }
  if (hasRole([roles.ACTION_OWNER, roles.ADMIN, roles.HSE_OFFICER, roles.HSE_MANAGER, roles.SUPERVISOR])) {
    visibleTabs.push('overdue');
  }

  React.useEffect(() => {
    const checkTabs = ['reports', 'lessons'];
    if (hasRole([roles.ACTION_OWNER, roles.ADMIN, roles.HSE_OFFICER, roles.HSE_MANAGER, roles.SUPERVISOR])) {
      checkTabs.push('actions');
    }
    if (hasRole([roles.SUPERVISOR, roles.HSE_MANAGER, roles.SITE_MANAGER, roles.ADMIN])) {
      checkTabs.push('review');
    }
    if (hasRole([roles.ACTION_OWNER, roles.ADMIN, roles.HSE_OFFICER, roles.HSE_MANAGER, roles.SUPERVISOR])) {
      checkTabs.push('overdue');
    }
    if (!checkTabs.includes(activeWorklistTab)) {
      setActiveWorklistTab('reports');
    }
  }, [currentUser.role, activeWorklistTab]);

  const totalReportsCount = incidents.length;
  const inInvestigationCount = incidents.filter(i => i.status === 'Under Investigation' || i.status === 'Investigation').length;
  const pendingApprovalsCount = incidents.filter(i => i.status === 'Pending Review' || i.status === 'Pending Approval' || i.status === 'Submitted' || i.status === 'Approved & Pending Closure').length;

  return (
    <div className="home-screen-layout">




      {/* KPI Cards Grid */}
      <div className="grid-cols-4" style={{ gap: '20px', marginBottom: '28px' }}>
        {/* Card 1: Total Incidents */}
        <div className="glass-panel kpi-card-premium" style={{
          padding: '20px 24px',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderLeft: '4px solid var(--accent-cyan)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 40px -10px rgba(0, 0, 0, 0.04)'
        }}>
          {/* Subtle Vector Watermark */}
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', right: '-10px', bottom: '-15px', opacity: 0.08, color: 'var(--accent-cyan)', pointerEvents: 'none' }}>
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
            <path className="turbine-blade" d="M50 10 L50 50 L20 65 M50 50 L80 65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FileText size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Total Incidents
              </span>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>
              {totalReportsCount}
            </div>
          </div>
        </div>

        {/* Card 2: Under Investigation */}
        <div className="glass-panel kpi-card-premium" style={{
          padding: '20px 24px',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderLeft: '4px solid var(--accent-purple)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 40px -10px rgba(0, 0, 0, 0.04)'
        }}>
          {/* Subtle Vector Watermark */}
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', right: '-10px', bottom: '-15px', opacity: 0.08, color: 'var(--accent-purple)', pointerEvents: 'none' }}>
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" />
            <circle className="radar-ring" cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="2" />
            <path d="M50 5 L50 95 M5 50 L95 50" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          </svg>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldAlert size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Under Investigation
              </span>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>
              {inInvestigationCount}
            </div>
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="glass-panel kpi-card-premium" style={{
          padding: '20px 24px',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderLeft: '4px solid var(--accent-green)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 40px -10px rgba(0, 0, 0, 0.04)'
        }}>
          {/* Subtle Vector Watermark */}
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', right: '-10px', bottom: '-15px', opacity: 0.07, color: 'var(--accent-green)', pointerEvents: 'none' }}>
            <path className="solar-grid" d="M10 20 H90 M10 40 H90 M10 60 H90 M10 80 H90" stroke="currentColor" strokeWidth="1.5" />
            <path className="solar-grid" d="M20 10 V90 M40 10 V90 M60 10 V90 M80 10 V90" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 10 L90 90 M90 10 L10 90" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          </svg>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CheckSquare size={14} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Pending Approvals
              </span>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>
              {pendingApprovalsCount}
            </div>
          </div>
        </div>

        {/* Card 4: Overdue Actions */}
        <div className="glass-panel kpi-card-premium" style={{
          padding: '20px 24px',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderLeft: overdueActionsCount > 0 ? '4px solid var(--accent-red)' : '4px solid var(--text-muted)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 40px -10px rgba(0, 0, 0, 0.04)'
        }}>
          {/* Subtle Vector Watermark */}
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', right: '-10px', bottom: '-15px', opacity: 0.08, color: overdueActionsCount > 0 ? 'var(--accent-red)' : 'var(--text-muted)', pointerEvents: 'none' }}>
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.5" />
            <path className="clock-hand" d="M50 20 V50 L70 60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Clock size={14} style={{ color: overdueActionsCount > 0 ? 'var(--accent-red)' : 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Overdue Actions
              </span>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 700, letterSpacing: '-0.03em', color: overdueActionsCount > 0 ? 'var(--accent-red)' : 'var(--text-primary)', lineHeight: 1 }}>
              {overdueActionsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Worklists Tabbed Section (Full Width) */}
      <div style={{ marginBottom: '28px' }}>
        {/* Tab Headers Row (uses app background) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '2px'
        }}>
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto' }}>
            {/* Tab 1: My Reports */}
            {visibleTabs.includes('reports') && (
              <button
                onClick={() => setActiveWorklistTab('reports')}
                className={`dashboard-tab-btn ${activeWorklistTab === 'reports' ? 'active' : ''}`}
              >
                My Reports
                <span style={{
                  fontSize: '0.74rem',
                  background: activeWorklistTab === 'reports' ? 'rgba(18, 78, 70, 0.1)' : 'var(--bg-panel-solid)',
                  color: activeWorklistTab === 'reports' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 600
                }}>
                  {myReports.length}
                </span>
              </button>
            )}
            {/* Tab 1.5: Lessons Learned */}
            {visibleTabs.includes('lessons') && (
              <button
                onClick={() => setActiveWorklistTab('lessons')}
                className={`dashboard-tab-btn ${activeWorklistTab === 'lessons' ? 'active' : ''}`}
              >
                Lessons Learned
                <span style={{
                  fontSize: '0.74rem',
                  background: activeWorklistTab === 'lessons' ? 'rgba(18, 78, 70, 0.1)' : 'var(--bg-panel-solid)',
                  color: activeWorklistTab === 'lessons' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 600
                }}>
                  {safetyAlerts?.length || 0}
                </span>
              </button>
            )}

            {/* Tab 2: My Assigned Actions */}
            {visibleTabs.includes('actions') && (
              <button
                onClick={() => setActiveWorklistTab('actions')}
                className={`dashboard-tab-btn ${activeWorklistTab === 'actions' ? 'active' : ''}`}
              >
                My Assigned Actions
                <span style={{
                  fontSize: '0.74rem',
                  background: activeWorklistTab === 'actions' ? 'rgba(18, 78, 70, 0.1)' : 'var(--bg-panel-solid)',
                  color: activeWorklistTab === 'actions' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 600
                }}>
                  {myActions.length}
                </span>
              </button>
            )}

            {/* Tab 3: Requiring Review */}
            {visibleTabs.includes('review') && (
              <button
                onClick={() => setActiveWorklistTab('review')}
                className={`dashboard-tab-btn ${activeWorklistTab === 'review' ? 'active' : ''}`}
              >
                Requiring Review
                <span style={{
                  fontSize: '0.74rem',
                  background: activeWorklistTab === 'review' ? 'rgba(18, 78, 70, 0.1)' : 'var(--bg-panel-solid)',
                  color: activeWorklistTab === 'review' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 600
                }}>
                  {reviewRequired.length}
                </span>
              </button>
            )}

            {/* Tab 4: Overdue Actions */}
            {visibleTabs.includes('overdue') && (
              <button
                onClick={() => setActiveWorklistTab('overdue')}
                className={`dashboard-tab-btn ${activeWorklistTab === 'overdue' ? 'active' : ''}`}
              >
                Overdue Actions
                <span style={{
                  fontSize: '0.74rem',
                  background: activeWorklistTab === 'overdue' ? 'rgba(18, 78, 70, 0.1)' : 'var(--bg-panel-solid)',
                  color: activeWorklistTab === 'overdue' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 600
                }}>
                  {overdueActions.length}
                </span>
              </button>
            )}
          </div>

          {/* Floating actions on the right */}
          {activeWorklistTab === 'actions' && (
            <span onClick={() => onGoToTab('actions')} style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, paddingBottom: '6px' }}>
              Manage Actions Registry <ArrowRight size={12} />
            </span>
          )}
          {activeWorklistTab === 'review' && (
            <span onClick={() => onGoToTab('approvals')} style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, paddingBottom: '6px' }}>
              Approval Center Workspace <ArrowRight size={12} />
            </span>
          )}
        </div>

        {/* Tab Content Panel (uses transparent background) */}
        <div style={{ padding: '0 4px' }}>

          {/* My Reports Content */}
          {activeWorklistTab === 'reports' && (
            <div>
              {myReports.length === 0 ? (
                <p className="text-muted" style={{ padding: '24px 0', textAlign: 'center', fontSize: '0.85rem' }}>
                  You have not submitted any incident reports. Use the buttons above to create one.
                </p>
              ) : (
                <div className="table-container" style={{ marginTop: 0 }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Number</th>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Risk Rating</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myReports.slice(0, 5).map(inc => (
                        <tr key={inc.id} onClick={() => onViewIncident(inc.id)} style={{ cursor: 'pointer' }}>
                          <td style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontFamily: 'var(--font-title)', letterSpacing: '0.02em', fontSize: '0.82rem' }}>{inc.incidentNumber}</td>
                          <td style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: '250px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{inc.title}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{formatDate(inc.reportedDate)}</td>
                          <td>{renderRiskCell(inc.riskRating)}</td>
                          <td>{renderStatusBadge(inc.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* My Assigned Actions Content */}
          {activeWorklistTab === 'actions' && (
            <div>
              {myActions.length === 0 ? (
                <p className="text-muted" style={{ padding: '24px 0', textAlign: 'center', fontSize: '0.85rem' }}>
                  No active corrective actions assigned to you.
                </p>
              ) : (
                <div className="table-container" style={{ marginTop: 0 }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Action Number</th>
                        <th>Incident</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myActions.map(act => (
                        <tr key={act.id} onClick={() => onViewIncident(act.incidentId)} style={{ cursor: 'pointer' }}>
                          <td style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontFamily: 'var(--font-title)', letterSpacing: '0.02em', fontSize: '0.82rem' }}>{act.actionNumber}</td>
                          <td style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: '250px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{act.incidentTitle}</td>
                          <td>{renderRiskCell(act.priority)}</td>
                          <td style={{ color: new Date(act.dueDate) < new Date() ? 'var(--accent-red)' : 'var(--text-secondary)', fontWeight: new Date(act.dueDate) < new Date() ? 600 : 500 }}>
                            {formatDate(act.dueDate)}
                          </td>
                          <td>{renderStatusBadge(act.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Requiring Review Content */}
          {activeWorklistTab === 'review' && (
            <div>
              {reviewRequired.length === 0 ? (
                <p className="text-muted" style={{ padding: '24px 0', textAlign: 'center', fontSize: '0.85rem' }}>
                  No new incident reports awaiting supervisor review.
                </p>
              ) : (
                <div className="table-container" style={{ marginTop: 0 }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Incident Number</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Site</th>
                        <th>Reported By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewRequired.map(inc => (
                        <tr key={inc.id} onClick={() => onViewIncident(inc.id)} style={{ cursor: 'pointer' }}>
                          <td style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontFamily: 'var(--font-title)', letterSpacing: '0.02em', fontSize: '0.82rem' }}>{inc.incidentNumber}</td>
                          <td style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: '250px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{inc.title}</td>
                          <td>
                            <span className="badge badge-cyan" style={{ textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: '0.72rem', padding: '4px 10px', borderRadius: '20px' }}>
                              {inc.category}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{inc.site}</td>
                          <td>{renderOwnerCell(inc.reportedBy)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Overdue Actions Content */}
          {activeWorklistTab === 'overdue' && (
            <div>
              {overdueActions.length === 0 ? (
                <p className="text-muted" style={{ padding: '24px 0', textAlign: 'center', fontSize: '0.85rem' }}>
                  No overdue corrective actions.
                </p>
              ) : (
                <div className="table-container" style={{ marginTop: 0 }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Action Number</th>
                        <th>Incident</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Owner</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdueActions.map(act => (
                        <tr key={act.id} onClick={() => onViewIncident(act.incidentId)} style={{ cursor: 'pointer' }}>
                          <td style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontFamily: 'var(--font-title)', letterSpacing: '0.02em', fontSize: '0.82rem' }}>{act.actionNumber}</td>
                          <td style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: '250px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{act.incidentTitle}</td>
                          <td>{renderRiskCell(act.priority)}</td>
                          <td style={{ color: 'var(--accent-red)', fontWeight: 600 }}>
                            {formatDate(act.dueDate)}
                          </td>
                          <td>{renderOwnerCell(act.owner)}</td>
                          <td>{renderStatusBadge('Overdue')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {/* Lessons Learned Content */}
          {activeWorklistTab === 'lessons' && (
            <div className="animate-fade">
              {!safetyAlerts || safetyAlerts.length === 0 ? (
                <p className="text-muted" style={{ padding: '24px 0', textAlign: 'center', fontSize: '0.85rem' }}>
                  No published safety alerts / lessons learned registry items.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {safetyAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      className="glass-panel"
                      style={{ 
                        padding: '20px', 
                        borderLeft: '4px solid var(--accent-cyan)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        background: '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                          {alert.incidentNumber || 'SAFETY-ALERT'} | Site: {alert.site}
                        </span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                          {alert.category}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.02rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {alert.title}
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', marginTop: '4px' }}>
                        <p>
                          <strong style={{ color: 'var(--text-secondary)' }}>Root Cause:</strong> {alert.why}
                        </p>
                        <p>
                          <strong style={{ color: 'var(--text-secondary)' }}>CAPA Measures:</strong> {alert.what}
                        </p>
                        <div style={{ background: 'rgba(16, 185, 129, 0.04)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid var(--accent-green)', marginTop: '4px' }}>
                          <strong style={{ color: 'var(--accent-green)', display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', marginBottom: '2px' }}>
                            Key Learning:
                          </strong>
                          <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>{alert.learning}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '6px' }}>
                        <span>Published by: {alert.publishedBy}</span>
                        <span>Date: {new Date(alert.publishedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid for Secondary Reference Panels (Full Width 2-Column Layout) */}
      <div className="grid-cols-2" style={{ gap: '20px', marginTop: '28px' }}>
        {/* Safety Alerts */}
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '3px solid var(--accent-gold)', background: '#ffffff' }}>
          <h3 className="h2-title" style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--accent-gold)' }}>
            <AlertTriangle size={18} /> High-Priority Safety Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'rgba(217, 119, 6, 0.04)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(217, 119, 6, 0.1)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Dropped Objects Audit Campaign</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Following near-miss HSE-DK-WF01-2026-0001, all sites must inspect tool lanyards and log certifications by Friday.
              </p>
            </div>
            <div style={{ background: 'rgba(225, 29, 72, 0.04)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(225, 29, 72, 0.1)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>BESS High Temp Emergency Drill</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Bavaria site (DE-BESS03) conducting mandatory fire-suppression interface testing on Rack modules.
              </p>
            </div>
          </div>
        </div>

        {/* Lessons Learned */}
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '3px solid var(--accent-green)', background: '#ffffff' }}>
          <h3 className="h2-title" style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--accent-green)' }}>
            <Lightbulb size={18} /> Recent Lessons Learned
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incidents.filter(i => i.lessonsLearned).length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No recent bulletins published.</p>
            ) : (
              incidents.filter(i => i.lessonsLearned).slice(0, 2).map(inc => (
                <div key={inc.id} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', color: 'var(--accent-cyan)' }}>
                    {inc.lessonsLearned.eventSummary}
                  </span>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                    <strong>Root Cause:</strong> {inc.lessonsLearned.whyItHappened}
                  </p>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                    <strong>Rule:</strong> {inc.lessonsLearned.recommendedControls}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
