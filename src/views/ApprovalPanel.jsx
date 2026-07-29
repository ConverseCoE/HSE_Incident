import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useUser } from '../context/UserContext';
import { CheckSquare, ShieldCheck, ChevronRight, FileCheck, Check } from 'lucide-react';

const ApprovalPanel = ({ onViewIncident }) => {
  const { incidents, updateActionStatus, resetDatabase } = useDatabase();
  const { currentUser, roles, hasRole } = useUser();

  // Incidents in initial 'Pending Review' stage (needs review)
  const pendingInitialReview = incidents.filter(i => i.status === 'Pending Review');

  // Incidents in 'Pending Approval' stage (needs final closure signoff)
  const pendingClosureSignoff = incidents.filter(i => i.status === 'Pending Approval');

  // CAPA actions awaiting verification
  const pendingActionVerifications = incidents.reduce((acc, inc) => {
    const acts = inc.actions || [];
    acts.forEach(act => {
      if (act.status === 'Pending verification') {
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

  const handleVerifyAction = (incidentId, actionId) => {
    updateActionStatus(incidentId, actionId, { 
      status: 'Verified',
      verifiedBy: currentUser.name
    }, currentUser.name);
    alert('CAPA action successfully verified and closed.');
  };

  const isManager = hasRole([roles.HSE_MANAGER, roles.SITE_MANAGER, roles.ADMIN]);

  const handleResetData = () => {
    if (window.confirm('Reset database to default mock data (re-populating approvals queue)?')) {
      resetDatabase();
    }
  };

  return (
    <div className="approval-panel-layout animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top action toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="text-muted" style={{ fontSize: '0.82rem', margin: 0 }}>
          Manage and sign off on active safety tasks requiring immediate verification or supervisor review.
        </p>
        <button 
          onClick={handleResetData}
          className="btn btn-secondary" 
          style={{ fontSize: '0.78rem', padding: '6px 14px', borderColor: 'var(--border-color)' }}
        >
          Reset Demo Data
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
        
        {pendingInitialReview.length === 0 && pendingActionVerifications.length === 0 && pendingClosureSignoff.length === 0 ? (
          <div style={{
            gridColumn: 'span 3',
            padding: '48px 32px',
            textAlign: 'center',
            background: '#ffffff',
            border: '1px dashed var(--border-color)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            minHeight: '260px'
          }}>
            <CheckSquare size={36} style={{ color: 'var(--accent-green)' }} />
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              All Approvals & Reviews Completed!
            </h4>
            <p className="text-muted" style={{ fontSize: '0.84rem', maxWidth: '500px', margin: 0, lineHeight: '1.5' }}>
              All pending incident triages, CAPA action verifications, and final manager sign-offs have been resolved. Click the button below to re-populate the demo database.
            </p>
            <button 
              onClick={resetDatabase} 
              className="btn btn-primary" 
              style={{ fontSize: '0.82rem', padding: '8px 20px', background: 'var(--accent-cyan)' }}
            >
              Seed Demo Approvals
            </button>
          </div>
        ) : (
          <>
        
        {/* Column 1: HSE Initial Reviews */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="h2-title" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckSquare size={20} style={{ color: 'var(--accent-cyan)' }} />
            Triage & Review ({pendingInitialReview.length})
          </h3>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '20px' }}>
            Review new reports from the field, confirm consequence severity, and initiate investigations.
          </p>

          {pendingInitialReview.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
              No incidents awaiting initial review.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingInitialReview.map(inc => (
                <div 
                  key={inc.id}
                  onClick={() => onViewIncident(inc.id)}
                  style={{
                    padding: '16px',
                    background: 'rgba(0,0,0,0.15)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  className="approval-item-hover"
                >
                  <div style={{ marginRight: '10px', minWidth: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{inc.incidentNumber}</span>
                    <h4 style={{ fontSize: '0.88rem', marginTop: '2px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={inc.title}>{inc.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      By {inc.reportedBy} | Site: {inc.site}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: CAPA Action Verification */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="h2-title" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FileCheck size={20} style={{ color: 'var(--accent-gold)' }} />
            CAPA Verifications ({pendingActionVerifications.length})
          </h3>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '20px' }}>
            Audit corrective actions marked complete. Verify completion evidence and sign off closure.
          </p>

          {pendingActionVerifications.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
              No CAPA actions awaiting verification.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingActionVerifications.map(act => (
                <div 
                  key={act.id}
                  style={{
                    padding: '16px',
                    background: 'rgba(0,0,0,0.15)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{act.actionNumber} ({act.site})</span>
                    <h4 style={{ fontSize: '0.85rem', marginTop: '2px', fontWeight: 600 }}>{act.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                      <strong>Evidence:</strong> {act.completionEvidence || 'No summary text provided.'}
                    </p>
                  </div>

                  {isManager ? (
                    <button 
                      onClick={() => handleVerifyAction(act.incidentId, act.id)} 
                      className="btn btn-secondary" 
                      style={{ 
                        width: '100%', 
                        fontSize: '0.75rem', 
                        padding: '6px', 
                        background: 'var(--accent-green)', 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Check size={12} /> Verify & Close Action
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Awaiting manager signature</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 3: Manager Final Sign-offs */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="h2-title" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldCheck size={20} style={{ color: 'var(--accent-green)' }} />
            Final Sign-off ({pendingClosureSignoff.length})
          </h3>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '20px' }}>
            Verify that root-cause analyses are closed, and all corrective actions are verified.
          </p>

          {pendingClosureSignoff.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
              No incidents awaiting final closure.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingClosureSignoff.map(inc => (
                <div 
                  key={inc.id}
                  onClick={() => onViewIncident(inc.id)}
                  style={{
                    padding: '16px',
                    background: 'rgba(16, 185, 129, 0.02)',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  className="approval-item-hover"
                >
                  <div style={{ marginRight: '10px', minWidth: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: 600 }}>{inc.incidentNumber}</span>
                    <h4 style={{ fontSize: '0.88rem', marginTop: '2px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={inc.title}>{inc.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Lead: {inc.investigation?.leadInvestigator || 'N/A'} | Site: {inc.site}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}
      </div>

      <style>{`
        .approval-item-hover:hover {
          background: var(--bg-panel-hover) !important;
          border-color: var(--accent-cyan) !important;
        }
      `}</style>
    </div>
  );
};

export default ApprovalPanel;
