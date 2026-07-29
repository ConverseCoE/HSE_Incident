import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Users, PlusCircle, Edit2, Trash2, Check, X, ShieldAlert, AlertCircle, Search } from 'lucide-react';

const AZURE_AD_USERS = [
  { email: 'alex.chen@ecopower.com', name: 'Alex Chen', department: 'Technician Operations' },
  { email: 'marcus@apexturbines.com', name: 'Marcus Miller', department: 'Turbine Engineering' },
  { email: 'sarah.j@ecopower.com', name: 'Sarah Jenkins', department: 'Site Operations' },
  { email: 'elena.r@ecopower.com', name: 'Elena Rostova', department: 'HSE Safety Control' },
  { email: 'david.v@ecopower.com', name: 'David Vance', department: 'RCA Investigation' },
  { email: 'thomas.m@ecopower.com', name: 'Thomas Mueller', department: 'Remediation Team' },
  { email: 'karen.n@ecopower.com', name: 'Karen Nielsen', department: 'Site Operations' },
  { email: 'robert.s@ecopower.com', name: 'Robert Sinclair', department: 'Global HSE' },
  { email: 'olivia.s@ecopower.com', name: 'Olivia Sterling', department: 'Executive Board' },
  { email: 'admin@ecopower.com', name: 'Admin User', department: 'IT Systems' },
  { email: 'freja.nielsen@orsted.dk', name: 'Freja Nielsen', department: 'Offshore Construction' },
  { email: 'sven.larsson@vattenfall.se', name: 'Sven Larsson', department: 'Grid Connection' },
];

const AdminRoleMapping = () => {
  const { currentUser, roles } = useUser();
  
  // Mappings state backed by localStorage
  const [mappings, setMappings] = useState(() => {
    const saved = localStorage.getItem('hse_user_role_mappings');
    if (saved) return JSON.parse(saved);
    
    // Initial mock GWO multi-role mappings
    return [
      { id: 'map-1', name: 'Elena Rostova', email: 'elena.r@ecopower.com', department: 'HSE Safety Control', roles: [roles.HSE_OFFICER, roles.INVESTIGATOR], status: 'Active', updatedBy: 'Azure AD Sync', updatedAt: '2026-07-28 08:30' },
      { id: 'map-2', name: 'Alex Chen', email: 'alex.chen@ecopower.com', department: 'Technician Operations', roles: [roles.REPORTER, roles.ACTION_OWNER], status: 'Active', updatedBy: 'Azure AD Sync', updatedAt: '2026-07-28 08:35' },
      { id: 'map-3', name: 'Robert Sinclair', email: 'robert.s@ecopower.com', department: 'Global HSE', roles: [roles.HSE_MANAGER, roles.EXECUTIVE], status: 'Active', updatedBy: 'Azure AD Sync', updatedAt: '2026-07-28 08:40' },
      { id: 'map-4', name: 'Admin User', email: 'admin@ecopower.com', department: 'IT Systems', roles: [roles.ADMIN], status: 'Active', updatedBy: 'Azure AD Sync', updatedAt: '2026-07-28 08:45' },
      { id: 'map-5', name: 'Sarah Jenkins', email: 'sarah.j@ecopower.com', department: 'Site Operations', roles: [roles.SUPERVISOR], status: 'Inactive', updatedBy: 'Azure AD Sync', updatedAt: '2026-07-28 08:50' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('hse_user_role_mappings', JSON.stringify(mappings));
  }, [mappings]);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedAdEmail, setSelectedAdEmail] = useState(AZURE_AD_USERS[0].email);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Filter toolbar states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRolesFilter, setSelectedRolesFilter] = useState([]);
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Active');

  // Filtered mapping items list
  const filteredMappings = mappings.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.roles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = selectedRolesFilter.length === 0 || 
      m.roles.some(r => selectedRolesFilter.includes(r));
      
    const matchesStatus = (m.status || 'Active') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sync selected AD user details
  const selectedAdUser = AZURE_AD_USERS.find(u => u.email === selectedAdEmail);

  // Toggle role in selection list
  const handleToggleRole = (roleVal) => {
    if (selectedRoles.includes(roleVal)) {
      setSelectedRoles(selectedRoles.filter(r => r !== roleVal));
    } else {
      setSelectedRoles([...selectedRoles, roleVal]);
    }
  };

  const handleStartCreate = () => {
    setEditId(null);
    setSelectedAdEmail(AZURE_AD_USERS[0].email);
    setSelectedRoles([]);
    setSelectedStatus('Active');
    setShowForm(true);
  };

  const handleStartEdit = (mapRecord) => {
    setEditId(mapRecord.id);
    setSelectedAdEmail(mapRecord.email);
    setSelectedRoles(mapRecord.roles);
    setSelectedStatus(mapRecord.status || 'Active');
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      setMappings(mappings.filter(m => m.id !== deleteTargetId));
      setDeleteTargetId(null);
      alert('User role mapping deleted successfully.');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (selectedRoles.length === 0) {
      alert('Please assign at least one role to the user.');
      return;
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (editId) {
      // Edit mapping
      setMappings(mappings.map(m => 
        m.id === editId ? {
          ...m,
          roles: selectedRoles,
          status: selectedStatus,
          updatedBy: currentUser.name,
          updatedAt: timestamp
        } : m
      ));
      alert('User role mapping updated successfully.');
    } else {
      // Check duplicate
      const duplicate = mappings.find(m => m.email === selectedAdUser.email);
      if (duplicate) {
        alert('This user is already mapped. Edit their existing record instead.');
        return;
      }

      // Add new mapping
      const newMapping = {
        id: `map-${Date.now()}`,
        name: selectedAdUser.name,
        email: selectedAdUser.email,
        department: selectedAdUser.department,
        roles: selectedRoles,
        status: selectedStatus,
        updatedBy: currentUser.name,
        updatedAt: timestamp
      };
      setMappings([newMapping, ...mappings]);
      alert('User role mapping created successfully.');
    }

    setShowForm(false);
    setEditId(null);
    setSelectedRoles([]);
  };
  return (
    <div className="admin-role-mapping animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Filters Toolbar */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '16px',
          flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.01)',
          padding: '8px 0',
          borderRadius: '8px'
        }}
      >
        {/* Left side: Search & filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '260px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-muted)' }}>
              <Search size={14} />
            </span>
            <input 
              type="text" 
              className="form-control"
              placeholder="Search user or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '0.82rem', height: '38px' }}
            />
          </div>

          {/* Custom Roles Multi-Select Dropdown */}
          <div style={{ position: 'relative', zIndex: 80 }}>
            <button
              type="button"
              onClick={() => setRolesDropdownOpen(!rolesDropdownOpen)}
              className="form-select"
              style={{
                width: '200px',
                fontSize: '0.82rem',
                height: '38px',
                padding: '0 12px',
                textAlign: 'left',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--text-primary)'
              }}
            >
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                {selectedRolesFilter.length === 0 
                  ? 'All Roles' 
                  : `${selectedRolesFilter.length} Role${selectedRolesFilter.length > 1 ? 's' : ''} Selected`}
              </span>
            </button>

            {rolesDropdownOpen && (
              <>
                <div 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
                  onClick={() => setRolesDropdownOpen(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '44px',
                    left: 0,
                    width: '240px',
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px',
                    zIndex: 95,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    maxHeight: '260px',
                    overflowY: 'auto'
                  }}
                >
                  {Object.values(roles).map(r => {
                    const isChecked = selectedRolesFilter.includes(r);
                    return (
                      <label
                        key={r}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          margin: 0,
                          userSelect: 'none',
                          background: isChecked ? 'rgba(18, 78, 70, 0.04)' : 'transparent',
                          transition: 'background 0.1s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedRolesFilter(selectedRolesFilter.filter(x => x !== r));
                            } else {
                              setSelectedRolesFilter([...selectedRolesFilter, r]);
                            }
                          }}
                          style={{ accentColor: 'var(--accent-cyan)' }}
                        />
                        <span style={{ color: isChecked ? 'var(--accent-cyan)' : 'var(--text-primary)', fontWeight: isChecked ? 600 : 400 }}>
                          {r}
                        </span>
                      </label>
                    );
                  })}
                  
                  {selectedRolesFilter.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedRolesFilter([])}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-red)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '2px 6px'
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Status Filter Select (Single select, Active/Inactive, default Active) */}
          <select 
            className="form-select" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '150px', fontSize: '0.82rem', height: '38px', padding: '0 12px' }}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Right side: Create button */}
        {!showForm && (
          <button 
            onClick={handleStartCreate} 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 16px', height: '38px' }}
          >
            <PlusCircle size={16} /> Create Role Mapping
          </button>
        )}
      </div>

      {/* Interactive Form Drawer */}
      {showForm && (
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
              setShowForm(false);
              setEditId(null);
            }
          }}
        >
          <div style={{
            width: '100%',
            maxWidth: '650px',
            height: '100%',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.08)',
            position: 'relative',
            borderLeft: '1px solid var(--border-color)',
            animation: 'slide-in-drawer 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#2A738F',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
              zIndex: 10
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                <Users size={20} style={{ color: '#ffffff' }} />
                {editId ? 'Edit Access Authorization' : 'Authorize AD Directory User'}
              </h3>
              <button 
                onClick={() => { setShowForm(false); setEditId(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.85,
                  outline: 'none'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form wrapping both scrollable contents and sticky footer */}
            <form onSubmit={handleSave} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100% - 62px)', overflow: 'hidden' }}>
              
              {/* Scrollable Form Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* AD User Selector */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">User *</label>
                  <select 
                    className="form-select" 
                    value={selectedAdEmail}
                    onChange={(e) => setSelectedAdEmail(e.target.value)}
                    disabled={!!editId}
                    style={{ fontSize: '0.84rem' }}
                  >
                    {AZURE_AD_USERS.map(u => (
                      <option key={u.email} value={u.email}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedAdUser && (
                  <div 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: '16px',
                      marginTop: '-4px',
                      fontSize: '0.82rem',
                      paddingLeft: '4px'
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Email:</span>{' '}
                      <span style={{ color: 'var(--text-primary)', marginLeft: '6px', fontFamily: 'monospace' }}>{selectedAdUser.email}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Department:</span>{' '}
                      <span style={{ color: 'var(--text-primary)', marginLeft: '6px' }}>{selectedAdUser.department}</span>
                    </div>
                  </div>
                )}

                 {/* Checkbox role list - NO divider line */}
                 <div style={{ marginTop: '24px' }}>
                   <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Roles (Select all that apply) *</label>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                     {Object.values(roles).map(roleVal => (
                       <div 
                         key={roleVal}
                         onClick={() => handleToggleRole(roleVal)}
                         style={{
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'space-between',
                           padding: '11px 16px',
                           background: selectedRoles.includes(roleVal) ? '#124e46' : 'rgba(0,0,0,0.02)',
                           border: selectedRoles.includes(roleVal) ? '1.5px solid #124e46' : '1px solid var(--border-color)',
                           borderRadius: '8px',
                           cursor: 'pointer',
                           fontSize: '0.82rem',
                           fontWeight: selectedRoles.includes(roleVal) ? 600 : 500,
                           color: selectedRoles.includes(roleVal) ? '#ffffff' : 'var(--text-secondary)',
                           transition: 'all 0.15s ease-in-out',
                           userSelect: 'none',
                           boxShadow: selectedRoles.includes(roleVal) ? '0 2px 8px rgba(18, 78, 70, 0.12)' : 'none'
                         }}
                       >
                         <span>{roleVal}</span>
                         <input 
                            type="checkbox"
                            checked={selectedRoles.includes(roleVal)}
                            readOnly
                            style={{ 
                              width: '16px', 
                              height: '16px', 
                              accentColor: 'var(--accent-cyan)',
                              margin: 0,
                              pointerEvents: 'none'
                            }}
                          />
                       </div>
                     ))}
                   </div>
                 </div>

              </div>

              {/* Sticky Bottom Footer */}
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
                  onClick={() => { setShowForm(false); setEditId(null); }} 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.82rem', padding: '8px 20px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ fontSize: '0.82rem', padding: '8px 24px', background: 'var(--accent-cyan)' }}
                >
                  Save Permissions
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* registry table */}
      <div style={{ padding: '0px' }}>
        {filteredMappings.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)' }}>
            <AlertCircle size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
            No role mappings found. Create one or adjust your filter parameters.
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Department</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Last Modified</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', fontSize: '0.88rem' }}>{m.name}</span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{m.email}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{m.department}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {m.roles.map(r => (
                          <span 
                            key={r}
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
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span 
                        style={{ 
                          fontSize: '0.74rem', 
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: (m.status || 'Active') === 'Active' ? 'rgba(5, 150, 105, 0.08)' : 'rgba(100, 116, 139, 0.08)',
                          color: (m.status || 'Active') === 'Active' ? 'var(--accent-green)' : 'var(--text-muted)',
                          border: (m.status || 'Active') === 'Active' ? '1px solid rgba(5, 150, 105, 0.15)' : '1px solid rgba(100, 116, 139, 0.15)',
                          fontWeight: 600,
                          display: 'inline-block'
                        }}
                      >
                        {m.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>{m.updatedAt}</span>
                        {m.updatedBy !== 'Azure AD Sync' && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>By: {m.updatedBy}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleStartEdit(m)}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}
                          title="Edit User Permissions"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(m.id)}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                          title="Delete Mapping"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Custom Delete Confirmation Modal */}
      {deleteTargetId && (
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
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 150,
            animation: 'fade-in 0.2s ease-out'
          }}
          onClick={() => setDeleteTargetId(null)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '24px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              border: '1px solid var(--border-color)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Title / Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: 'rgba(225, 29, 72, 0.08)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--accent-red)' 
                }}
              >
                <Trash2 size={18} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Remove Access Authorization?
              </h4>
            </div>

            {/* Modal Content */}
            <p className="text-muted" style={{ fontSize: '0.84rem', margin: 0, lineHeight: '1.5' }}>
              Are you sure you want to remove this role mapping? The user will lose all associated safety portal roles immediately. This action cannot be undone.
            </p>

            {/* Modal Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button 
                type="button" 
                onClick={() => setDeleteTargetId(null)} 
                className="btn btn-secondary" 
                style={{ fontSize: '0.82rem', padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDelete} 
                className="btn btn-primary" 
                style={{ fontSize: '0.82rem', padding: '8px 18px', background: 'var(--accent-red)', border: 'none' }}
              >
                Remove Access
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRoleMapping;
