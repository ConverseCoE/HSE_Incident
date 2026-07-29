import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useUser } from '../context/UserContext';
import { ClipboardList, Calendar, CheckCircle, Clock, AlertTriangle, FileUp, Save, Check, X, ChevronRight } from 'lucide-react';

const ActionManagement = ({ onSelectIncident }) => {
  const { incidents, updateActionStatus, requestExtension, resolveExtensionRequest } = useDatabase();
  const { currentUser, hasRole, roles } = useUser();

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

  // Filter actions based on role:
  // Action Owner sees only assigned actions. Others see all actions or site actions.
  const filteredActions = allActions.filter(act => {
    if (currentUser.role === roles.ACTION_OWNER) {
      return act.owner === currentUser.name;
    }
    if (currentUser.role === roles.SUPERVISOR) {
      return act.site === currentUser.site;
    }
    return true; // HSE, Admin, Executives see all
  });

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
    const isCompleted = progress === 100;
    
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

  return (
    <div className="action-management animate-fade">
      
      {/* Actions List - Full Body Width, No Glass-Panel borders, No Title */}
      <div style={{ padding: '0px' }}>
        {filteredActions.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)' }}>
            <ClipboardList size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
            No action items found matching your filters.
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Action Number</th>
                  <th>Action Item Title</th>
                  <th>Site</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Operations</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredActions.map(act => {
                  const isOverdue = act.status !== 'Completed' && act.status !== 'Verified' && new Date(act.dueDate) < new Date();
                  return (
                    <tr 
                      key={act.id} 
                      onClick={() => handleSelectAction(act, 'details')}
                      style={{ cursor: 'pointer', background: selectedActionId === act.id ? 'var(--bg-panel-hover)' : 'transparent' }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{act.actionNumber}</td>
                      <td style={{ maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{act.title}</td>
                      <td>{act.site}</td>
                      <td style={{ color: isOverdue ? 'var(--accent-red)' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                        {new Date(act.dueDate).toLocaleDateString()}
                        {isOverdue && <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--accent-red)' }}>OVERDUE</span>}
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '0.68rem', 
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: act.priority === 'High' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(217, 119, 6, 0.08)',
                          color: act.priority === 'High' ? 'var(--accent-red)' : 'var(--accent-gold)',
                          border: act.priority === 'High' ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(217, 119, 6, 0.15)',
                          display: 'inline-block'
                        }}>
                          {act.priority}
                        </span>
                      </td>
                      <td>
                        <span 
                          style={{ 
                            fontSize: '0.68rem', 
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: '#f1f5f9',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                            display: 'inline-block'
                          }}
                        >
                          {act.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {act.owner === currentUser.name ? (
                            <>
                              {act.status === 'Assigned' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleAccept(act); }}
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '0.72rem', background: 'var(--accent-green)', color: 'white', border: 'none' }}
                                >
                                  Accept Action
                                </button>
                              )}
                              {(act.status === 'Accepted' || act.status === 'In progress') && (
                                <>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleSelectAction(act, 'progress'); }}
                                    className="btn btn-primary" 
                                    style={{ padding: '4px 8px', fontSize: '0.72rem', background: 'var(--accent-cyan)', border: 'none' }}
                                  >
                                    Update Progress
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleSelectAction(act, 'extend'); }}
                                    className="btn btn-secondary" 
                                    style={{ padding: '4px 8px', fontSize: '0.72rem', borderColor: 'var(--border-color)', background: '#ffffff', color: 'var(--text-primary)' }}
                                  >
                                    Extend
                                  </button>
                                </>
                              )}
                              {(act.status === 'Pending verification' || act.status === 'Completed' || act.status === 'Verified') && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleSelectAction(act, 'details'); }}
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                >
                                  View Details
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {act.extensionRequests?.some(r => r.status === 'Pending') && hasRole([roles.HSE_MANAGER, roles.ADMIN]) ? (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleSelectAction(act, 'resolve'); }}
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '0.72rem', background: 'var(--accent-gold)', color: 'white', border: 'none' }}
                                >
                                  Resolve Extension
                                </button>
                              ) : (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleSelectAction(act, 'details'); }}
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                >
                                  View Details
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', width: '40px' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSelectIncident(act.incidentId); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px', transition: 'all 0.2s ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
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

      {/* Sliding Drawer details */}
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
            justifyContent: 'flex-end',
            zIndex: 100
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
              maxWidth: '480px',
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
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  {activeAction.actionNumber} • {activeAction.site}
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {drawerMode === 'progress' && 'Update Action Progress'}
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
              
              {/* Action Description */}
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>Description</h4>
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
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{activeAction.ownerDepartment}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Target Due Date</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{new Date(activeAction.dueDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Priority Level</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: activeAction.priority === 'High' ? 'var(--accent-red)' : 'var(--accent-gold)' }}>
                    {activeAction.priority}
                  </span>
                </div>
              </div>

              {/* Progress Update Slider (Only in progress mode) */}
              {drawerMode === 'progress' && activeAction.owner === currentUser.name && activeAction.status !== 'Completed' && activeAction.status !== 'Verified' && activeAction.status !== 'Pending verification' && (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>Completion Percentage</span>
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
                  
                  {progress == 100 && (
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
                        <label className="form-label">Attach Verification Evidence Documents *</label>
                        <div 
                          style={{
                            border: '2px dashed var(--border-color)',
                            borderRadius: '8px',
                            padding: '16px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: 'rgba(255, 255, 255, 0.02)',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => {
                            const dummyDocs = ['post_repair_photo.jpg', 'calibration_cert_signed.pdf', 'loto_clearance_signoff.png', 'remediation_manifest.pdf'];
                            const selectedDoc = dummyDocs[Math.floor(Math.random() * dummyDocs.length)];
                            setUploadedFileName(selectedDoc);
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                        >
                          <FileUp size={24} style={{ color: 'var(--accent-cyan)', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto' }} />
                          <p style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>Click to Upload File (Photos, PDFs, Manifests)</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>Max size: 10MB. Formats: JPG, PNG, PDF</p>
                          {uploadedFileName && (
                            <div style={{ marginTop: '10px', background: 'rgba(18, 78, 70, 0.05)', padding: '6px 12px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(18, 78, 70, 0.15)' }}>
                              <Check size={12} style={{ color: 'var(--accent-cyan)' }} />
                              <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{uploadedFileName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <button onClick={handleUpdateProgress} className="btn btn-primary" style={{ width: '100%', marginTop: '14px', fontSize: '0.82rem', background: 'var(--accent-cyan)' }}>
                    Update Action Progress
                  </button>
                </div>
              )}

              {/* Progress Update Read-Only Details (Only in details/resolve mode) */}
              {(drawerMode === 'details' || drawerMode === 'resolve') && (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>Status Details</span>
                  <p style={{ fontSize: '0.86rem', fontWeight: 600, marginTop: '4px', margin: 0 }}>
                    Currently <strong style={{ color: 'var(--accent-cyan)' }}>{activeAction.status}</strong> at {activeAction.progress}% progress.
                  </p>
                  {activeAction.completionEvidence && (
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <strong>Evidence:</strong> {activeAction.completionEvidence}
                    </div>
                  )}
                </div>
              )}

              {/* Extensions Requests section (Only in extend/resolve, or details with previous request logs) */}
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
                  {drawerMode === 'extend' && activeAction.owner === currentUser.name && activeAction.status !== 'Completed' && activeAction.status !== 'Verified' && activeAction.status !== 'Pending verification' && (
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
                        Submit Request
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
              justifyContent: 'flex-end',
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
