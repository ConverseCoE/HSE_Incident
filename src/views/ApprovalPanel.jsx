import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useUser } from '../context/UserContext';
import { 
  CheckSquare, 
  ShieldCheck, 
  ChevronRight, 
  FileCheck, 
  Check, 
  Calendar, 
  AlertCircle, 
  Clock, 
  X, 
  Lock,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

const ApprovalPanel = ({ onViewIncident }) => {
  const { incidents, updateActionStatus, resolveExtensionRequest, resetDatabase } = useDatabase();
  const { currentUser, roles, hasRole } = useUser();

  // 1. Incidents in initial 'Pending Review' stage (needs triage review)
  const pendingInitialReview = incidents.filter(i => i.status === 'Pending Review');

  // 2. CAPA actions awaiting verification
  const pendingActionVerifications = incidents.reduce((acc, inc) => {
    const acts = inc.actions || [];
    acts.forEach(act => {
      if (act.status === 'Pending verification' || act.status === 'Pending Verification') {
        acc.push({
          ...act,
          incidentId: inc.id,
          incidentNum: inc.incidentNumber,
          incidentTitle: inc.title
        });
      }
    });
    return acc;
  }, []);

  // 3. Pending Due-Date Extension Requests across all incident actions
  const pendingExtensionRequests = incidents.reduce((acc, inc) => {
    const acts = inc.actions || [];
    acts.forEach(act => {
      const extRequests = act.extensionRequests || [];
      extRequests.forEach(req => {
        if (req.status === 'Pending') {
          acc.push({
            ...req,
            actionId: act.id,
            actionNumber: act.actionNumber,
            actionTitle: act.title,
            owner: act.owner,
            currentDueDate: act.dueDate,
            incidentId: inc.id,
            incidentNum: inc.incidentNumber,
            site: inc.site
          });
        }
      });
    });
    return acc;
  }, []);

  // 4. Incidents in 'Pending Approval' stage (needs final closure signoff)
  const pendingClosureSignoff = incidents.filter(i => i.status === 'Pending Approval');

  // Role Permissions Gating for Column Visibility
  const canTriage = hasRole([roles.SUPERVISOR, roles.SITE_MANAGER, roles.HSE_OFFICER, roles.HSE_MANAGER, roles.ADMIN]);
  const canVerifyCapa = hasRole([roles.HSE_MANAGER, roles.ADMIN]);
  const canApproveExtension = hasRole([roles.HSE_OFFICER, roles.HSE_MANAGER, roles.ADMIN]);
  const canFinalSignoff = hasRole([roles.HSE_MANAGER, roles.ADMIN]);

  const visibleColumnsCount = [canTriage, canVerifyCapa, canApproveExtension, canFinalSignoff].filter(Boolean).length;

  const handleVerifyAction = (incidentId, actionId) => {
    updateActionStatus(incidentId, actionId, { 
      status: 'Verified',
      verifiedBy: currentUser.name
    }, currentUser.name);
    alert('CAPA action successfully verified and closed.');
  };

  const handleResolveExtension = (incidentId, actionId, reqId, isApproved) => {
    resolveExtensionRequest(
      incidentId,
      actionId,
      reqId,
      isApproved,
      isApproved ? 'Extension request approved.' : 'Extension request rejected. Maintain target deadline.',
      currentUser.name
    );
    alert(isApproved ? 'Due date extension approved.' : 'Due date extension rejected.');
  };

  const handleResetData = () => {
    if (window.confirm('Reset database to default mock data (re-populating approvals queue)?')) {
      resetDatabase();
    }
  };

  // Calculate total items applicable to the logged-in user's role
  const roleApplicablePendingCount = 
    (canTriage ? pendingInitialReview.length : 0) +
    (canVerifyCapa ? pendingActionVerifications.length : 0) +
    (canApproveExtension ? pendingExtensionRequests.length : 0) +
    (canFinalSignoff ? pendingClosureSignoff.length : 0);

  return (
    <div className="approval-panel-layout animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0px' }}>
      
      {/* Top Action & Overview Toolbar */}
      <div style={{
        background: '#ffffff',
        padding: '16px 24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={20} style={{ color: 'var(--accent-cyan)' }} />
            Approvals Center ({currentUser.role})
          </h2>
          <p className="text-muted" style={{ fontSize: '0.82rem', margin: 0 }}>
            Displaying approval columns specifically authorized for the <strong>{currentUser.role}</strong> role.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            {roleApplicablePendingCount} Actionable Approvals
          </span>

          <button 
            onClick={handleResetData}
            className="btn btn-secondary" 
            style={{ fontSize: '0.78rem', padding: '6px 14px', borderColor: 'var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} /> Seed Demo Data
          </button>
        </div>
      </div>

      {/* Dynamic Grid: Renders ONLY columns applicable to current user's role */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${visibleColumnsCount || 1}, 1fr)`, 
        gap: '20px', 
        textAlign: 'left', 
        alignItems: 'start' 
      }}>
        
        {/* COLUMN 1: INITIAL INCIDENT REVIEW & TRIAGE (Supervisor, Site Manager, HSE Officer, HSE Manager, Admin) */}
        {canTriage && (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={16} style={{ color: 'var(--accent-cyan)' }} />
                  Incident Triage & Review
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Initial triage review</span>
              </div>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, background: '#ffffff', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                {pendingInitialReview.length}
              </span>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '320px' }}>
              {pendingInitialReview.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  No incidents pending triage review.
                </div>
              ) : (
                pendingInitialReview.map(inc => (
                  <div 
                    key={inc.id}
                    onClick={() => onViewIncident(inc.id)}
                    style={{
                      padding: '14px',
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease'
                    }}
                    className="approval-card-hover"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{inc.incidentNumber}</span>
                      <span style={{ fontSize: '0.64rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{inc.site}</span>
                    </div>
                    <h4 style={{ fontSize: '0.84rem', margin: 0, fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.3' }}>{inc.title}</h4>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Reported by: <strong>{inc.reportedBy}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* COLUMN 2: CAPA EVIDENCE VERIFICATION (HSE MANAGER & ADMIN ONLY) */}
        {canVerifyCapa && (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileCheck size={16} style={{ color: 'var(--accent-gold)' }} />
                  CAPA Verifications
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Audit proof & signoff</span>
              </div>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, background: '#ffffff', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                {pendingActionVerifications.length}
              </span>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '320px' }}>
              {pendingActionVerifications.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  No CAPA items awaiting audit verification.
                </div>
              ) : (
                pendingActionVerifications.map(act => (
                  <div 
                    key={act.id}
                    style={{
                      padding: '14px',
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{act.actionNumber}</span>
                      <span style={{ fontSize: '0.64rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-gold)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Awaiting Audit</span>
                    </div>

                    <h4 style={{ fontSize: '0.84rem', margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{act.title}</h4>

                    <div style={{ fontSize: '0.74rem', background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <strong>Evidence:</strong> {act.completionEvidence || 'No text summary uploaded.'}
                    </div>

                    <button 
                      onClick={() => handleVerifyAction(act.incidentId, act.id)}
                      className="btn btn-primary"
                      style={{ width: '100%', fontSize: '0.74rem', padding: '6px', background: 'var(--accent-green)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <Check size={14} /> Verify & Close CAPA
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* COLUMN 3: DUE-DATE EXTENSION APPROVALS (HSE Officer, HSE Manager, Admin) */}
        {canApproveExtension && (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} style={{ color: 'var(--accent-gold)' }} />
                  Due-Date Extensions
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Delay & interim controls</span>
              </div>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, background: '#ffffff', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                {pendingExtensionRequests.length}
              </span>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '320px' }}>
              {pendingExtensionRequests.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  No due-date extension requests pending.
                </div>
              ) : (
                pendingExtensionRequests.map(req => (
                  <div 
                    key={req.id}
                    style={{
                      padding: '14px',
                      background: 'rgba(245, 158, 11, 0.04)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{req.actionNumber}</span>
                      <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>{req.site}</span>
                    </div>

                    <h4 style={{ fontSize: '0.82rem', margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{req.actionTitle}</h4>

                    <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '2px', color: 'var(--text-secondary)' }}>
                      <span>Requested Date: <strong style={{ color: 'var(--accent-gold)' }}>{req.requestedDueDate}</strong></span>
                      <span>Reason: "{req.reason}"</span>
                      {req.interimControls && <span>Controls: "{req.interimControls}"</span>}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <button 
                        onClick={() => handleResolveExtension(req.incidentId, req.actionId, req.id, true)}
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: '0.72rem', padding: '5px', background: 'var(--accent-green)', border: 'none' }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleResolveExtension(req.incidentId, req.actionId, req.id, false)}
                        className="btn btn-secondary"
                        style={{ flex: 1, fontSize: '0.72rem', padding: '5px', color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* COLUMN 4: FINAL INVESTIGATION SIGN-OFF (HSE MANAGER & ADMIN ONLY) */}
        {canFinalSignoff && (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--accent-green)' }} />
                  Final Investigation Sign-off
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Closure sign-off</span>
              </div>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, background: '#ffffff', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                {pendingClosureSignoff.length}
              </span>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '320px' }}>
              {pendingClosureSignoff.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  No completed investigations awaiting final sign-off.
                </div>
              ) : (
                pendingClosureSignoff.map(inc => (
                  <div 
                    key={inc.id}
                    onClick={() => onViewIncident(inc.id)}
                    style={{
                      padding: '14px',
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}
                    className="approval-card-hover"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: 700 }}>{inc.incidentNumber}</span>
                      <span style={{ fontSize: '0.64rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Ready for Sign-off</span>
                    </div>

                    <h4 style={{ fontSize: '0.84rem', margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{inc.title}</h4>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Lead: <strong>{inc.investigation?.leadInvestigator || 'N/A'}</strong> • {inc.site}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      <style>{`
        .approval-card-hover:hover {
          border-color: var(--accent-cyan) !important;
          transform: translateY(-2px);
          boxShadow: 0 4px 12px rgba(0,0,0,0.06);
        }
      `}</style>
    </div>
  );
};

export default ApprovalPanel;
