import React, { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import OfflineIndicator from './components/OfflineIndicator';
import NotificationFeed from './components/NotificationFeed';
import HomeScreen from './views/HomeScreen';
import DashboardScreen from './views/DashboardScreen';
import QuickReport from './views/QuickReport';
import FullReport from './views/FullReport';
import DetailScreen from './views/DetailScreen';
import InvestigationWorkspace from './views/InvestigationWorkspace';
import ActionManagement from './views/ActionManagement';
import ApprovalPanel from './views/ApprovalPanel';
import AdminRoleMapping from './views/AdminRoleMapping';
import InvestigationHub from './views/InvestigationHub';
import LessonsLearned from './views/LessonsLearned';
import logoImg from './assets/Logo.png';
import logoGraphicsImg from './assets/Logo Graphics.png';
import { 
  ShieldAlert, LayoutDashboard, Calendar, ClipboardList, CheckSquare, 
  BarChart2, FilePlus2, AlertTriangle, Eye, ShieldCheck, Sun, Search, ArrowLeftToLine, ArrowRightToLine,
  PhoneCall, Globe, Users, BookOpen
} from 'lucide-react';

const AppContent = () => {
  const { currentUser, setCurrentUser, usersList, roles, hasRole } = useUser();
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const [emergencyPopoverOpen, setEmergencyPopoverOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');
  const [langPopoverOpen, setLangPopoverOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // home, actions, approvals, dashboard
  const [activeView, setActiveView] = useState('hub'); // hub, detail, workspace, wizard
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [workspaceSource, setWorkspaceSource] = useState('detail'); // detail, hub
  const [quickReportOpen, setQuickReportOpen] = useState(false);
  const [wizardCategory, setWizardCategory] = useState('Safety Incident');

  const { isOnline } = useDatabase();

  const handleSelectIncident = (id) => {
    setSelectedIncidentId(id);
    setActiveView('detail');
  };

  const handleGoToWorkspace = (id) => {
    setSelectedIncidentId(id);
    setWorkspaceSource('detail');
    setActiveView('workspace');
  };

  const handleNewReport = (type) => {
    if (type === 'quick') {
      setQuickReportOpen(true);
    } else {
      setWizardCategory('Safety Incident');
      setActiveView('wizard');
    }
  };

  const handleViewChangeFromHeader = (tab) => {
    setActiveTab(tab);
    setActiveView('hub');
  };

  const getInitials = (name) => {
    if (!name) return 'ER';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderHeaderLeft = () => {
    let crumbs = ['AURA HSE'];
    let title = '';
    let Icon = LayoutDashboard;

    if (activeView === 'hub') {
      if (activeTab === 'home') {
        crumbs.push('Dashboard');
        title = `Welcome back, ${currentUser.name}`;
        Icon = LayoutDashboard;
      } else if (activeTab === 'actions') {
        crumbs.push('Actions');
        title = 'Actions Registry';
        Icon = ClipboardList;
      } else if (activeTab === 'approvals') {
        crumbs.push('Approvals');
        title = 'Approvals Center';
        Icon = CheckSquare;
      } else if (activeTab === 'dashboard') {
        crumbs.push('Performance');
        title = 'Safety Performance';
        Icon = BarChart2;
      } else if (activeTab === 'investigations') {
        crumbs.push('Workspace', 'Investigations');
        title = 'Investigation Hub';
        Icon = ShieldAlert;
      } else if (activeTab === 'lessons') {
        crumbs.push('Knowledge Hub', 'Lessons Learned');
        title = 'Lessons Learned & Safety Alerts';
        Icon = BookOpen;
      } else if (activeTab === 'admin') {
        crumbs.push('System Admin', 'Roles');
        title = 'Role Mapping Registry';
        Icon = Users;
      }
    } else if (activeView === 'detail') {
      crumbs.push('Incidents', 'Details');
      title = 'Incident Details';
      Icon = Eye;
    } else if (activeView === 'workspace') {
      crumbs.push('Incidents', 'Investigation');
      title = 'Investigation Workspace';
      Icon = ShieldCheck;
    } else if (activeView === 'wizard') {
      crumbs.push('Incidents', 'New Report');
      title = 'Incident Reporting Wizard';
      Icon = FilePlus2;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left', transform: 'translateY(10px)' }}>
        {/* Title first with Icon */}
        <h1 style={{ 
          fontSize: '1.35rem', 
          fontWeight: 700, 
          letterSpacing: '-0.02em', 
          color: 'var(--text-primary)', 
          margin: 0,
          fontFamily: 'var(--font-title)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Icon size={20} style={{ color: 'var(--accent-cyan)' }} />
          {title}
        </h1>
        {/* Breadcrumbs underneath */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          fontSize: '0.68rem', 
          color: 'var(--text-muted)', 
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {crumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span style={{ opacity: 0.5, fontSize: '0.6rem' }}>/</span>}
              <span style={{ color: idx === crumbs.length - 1 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Floating Collapse/Expand Button */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="sidebar-toggle-floating"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ArrowRightToLine size={14} /> : <ArrowLeftToLine size={14} />}
        </button>

        <div className="sidebar-brand" style={{ 
          justifyContent: 'center', 
          padding: sidebarCollapsed ? '0' : '0 20px',
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center'
        }}>
          {sidebarCollapsed ? (
            <img 
              src={logoGraphicsImg} 
              alt="Logo Graphics" 
              style={{ height: '36px', width: '36px', objectFit: 'contain' }} 
            />
          ) : (
            <img 
              src={logoImg} 
              alt="Logo" 
              style={{ height: '58px', maxWidth: '100%', objectFit: 'contain' }} 
            />
          )}
        </div>

        <ul className="sidebar-menu">
          <li 
            onClick={() => handleViewChangeFromHeader('home')} 
            className={`menu-item ${activeTab === 'home' && activeView === 'hub' ? 'active' : ''}`}
            title="Dashboard Hub"
          >
            <LayoutDashboard className="menu-icon" />
            <span>Dashboard Hub</span>
          </li>
          
          {hasRole([roles.SUPERVISOR, roles.SITE_MANAGER, roles.HSE_OFFICER, roles.HSE_MANAGER, roles.ADMIN]) && (
            <li 
              onClick={() => handleViewChangeFromHeader('approvals')} 
              className={`menu-item ${activeTab === 'approvals' && activeView === 'hub' ? 'active' : ''}`}
              title="Approvals Center"
            >
              <CheckSquare className="menu-icon" />
              <span>Approvals Center</span>
            </li>
          )}

          {hasRole([roles.HSE_OFFICER, roles.HSE_MANAGER, roles.INVESTIGATOR, roles.ADMIN, roles.SUPERVISOR, roles.SITE_MANAGER]) && (
            <li 
              onClick={() => handleViewChangeFromHeader('investigations')} 
              className={`menu-item ${activeTab === 'investigations' && activeView === 'hub' ? 'active' : ''}`}
              title="Investigation Hub"
            >
              <ShieldAlert className="menu-icon" />
              <span>Investigation Hub</span>
            </li>
          )}

          <li 
            onClick={() => handleViewChangeFromHeader('actions')} 
            className={`menu-item ${activeTab === 'actions' && activeView === 'hub' ? 'active' : ''}`}
            title="Actions Registry"
          >
            <ClipboardList className="menu-icon" />
            <span>Actions Registry</span>
          </li>

          <li 
            onClick={() => handleViewChangeFromHeader('lessons')} 
            className={`menu-item ${activeTab === 'lessons' && activeView === 'hub' ? 'active' : ''}`}
            title="Lessons Learned"
          >
            <BookOpen className="menu-icon" />
            <span>Lessons Learned</span>
          </li>

          <li 
            onClick={() => handleViewChangeFromHeader('dashboard')} 
            className={`menu-item ${activeTab === 'dashboard' && activeView === 'hub' ? 'active' : ''}`}
            title="Safety Performance"
          >
            <BarChart2 className="menu-icon" />
            <span>Safety Performance</span>
          </li>

          {currentUser.role === roles.ADMIN && (
            <li 
              onClick={() => handleViewChangeFromHeader('admin')} 
              className={`menu-item ${activeTab === 'admin' && activeView === 'hub' ? 'active' : ''}`}
              title="Role Mappings"
            >
              <Users className="menu-icon" />
              <span>Role Mappings</span>
            </li>
          )}
        </ul>

      </aside>

      {/* Main app layout wrapper */}
      <main className={`app-main ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Header toolbar */}
        <header className="app-header" style={{ justifyContent: 'space-between' }}>
          {renderHeaderLeft()}
          <div className="header-actions" style={{ gap: '16px' }}>
            {/* Global Search Bar */}
            <div className="header-search-mockup" style={{ width: '340px', height: '40px', padding: '0 14px', boxSizing: 'border-box' }}>
              <Search size={16} className="text-muted" style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search..." readOnly style={{ fontSize: '0.82rem' }} />
            </div>

            {/* Quick Log Button */}
            <button 
              onClick={() => handleNewReport('quick')} 
              className="btn btn-secondary" 
              style={{ 
                height: '40px', 
                fontSize: '0.82rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                border: '1px solid var(--border-color)'
              }}
              title="Quick Log"
            >
              <FilePlus2 size={15} /> 
              <span>Quick Log</span>
            </button>

            {/* Global "Report an Incident" Button */}
            <button 
              onClick={() => { handleNewReport('incident'); setEmergencyPopoverOpen(false); setProfilePopoverOpen(false); }}
              className="btn btn-primary"
              style={{
                fontSize: '0.82rem',
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'var(--accent-cyan)',
                color: '#ffffff',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(18, 78, 70, 0.15)',
                height: '40px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              title="Log a new event or request"
            >
              <span>Report an Incident</span>
            </button>

            {/* Sync & network simulation status */}
            <OfflineIndicator />

            {/* Emergency Support Hotline Popover */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => { setEmergencyPopoverOpen(!emergencyPopoverOpen); setProfilePopoverOpen(false); setLangPopoverOpen(false); }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: emergencyPopoverOpen ? 'var(--accent-red)' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                title="Emergency Support Hotlines"
              >
                <PhoneCall size={18} />
              </button>

              {emergencyPopoverOpen && (
                <div style={{
                  position: 'absolute',
                  right: '-60px',
                  top: '50px',
                  width: '320px',
                  padding: '20px',
                  zIndex: 99,
                  borderRadius: '12px',
                  background: '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.03), 0 10px 20px -5px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.02)',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #edf2f0', paddingBottom: '12px', marginBottom: '14px' }}>
                    <PhoneCall size={16} style={{ color: 'var(--accent-red)' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Emergency Hotlines</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid #edf2f0', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Offshore Marine Control</span>
                      <span style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>+44 191 498 9000</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid #edf2f0', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>BESS Emergency Response</span>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>+49 89 234 4455</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '4px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Global HSE Director Office</span>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>+45 88 12 34 56</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher Popover */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => { setLangPopoverOpen(!langPopoverOpen); setEmergencyPopoverOpen(false); setProfilePopoverOpen(false); }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: langPopoverOpen ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  gap: '4px'
                }}
                title="Select Language"
              >
                <Globe size={16} />
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                  {currentLang.slice(0, 2)}
                </span>
              </button>

              {langPopoverOpen && (
                <div style={{
                  position: 'absolute',
                  right: '-10px',
                  top: '50px',
                  width: '160px',
                  padding: '8px',
                  zIndex: 99,
                  borderRadius: '10px',
                  background: '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.03), 0 10px 20px -5px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.02)',
                  textAlign: 'left',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {[
                    { code: 'EN', name: 'English', flag: '🇬🇧' },
                    { code: 'DA', name: 'Danish', flag: '🇩🇰' },
                    { code: 'SV', name: 'Swedish', flag: '🇸🇪' }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang.name);
                        setLangPopoverOpen(false);
                        alert(`Language switched to ${lang.name}`);
                      }}
                      style={{
                        background: currentLang === lang.name ? 'rgba(18, 78, 70, 0.05)' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.82rem',
                        fontWeight: currentLang === lang.name ? 600 : 500,
                        color: currentLang === lang.name ? 'var(--accent-cyan)' : 'var(--text-primary)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                      {currentLang === lang.name && (
                        <span style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification bell widget */}
            <NotificationFeed onSelectIncident={handleSelectIncident} />

            {/* Profile Avatar Button & Popover */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => { setProfilePopoverOpen(!profilePopoverOpen); setEmergencyPopoverOpen(false); setLangPopoverOpen(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none'
                }}
                title="View profile & change role"
              >
                <div className="profile-avatar" style={{ margin: 0, width: '40px', height: '40px', fontSize: '0.95rem' }}>
                  {getInitials(currentUser.name)}
                </div>
              </button>

              {profilePopoverOpen && (
                <div className="glass-panel" style={{
                  position: 'absolute',
                  right: 0,
                  top: '50px',
                  width: '280px',
                  padding: '20px',
                  zIndex: 99,
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  textAlign: 'left',
                  boxShadow: 'var(--shadow-lg)',
                  background: '#ffffff'
                }}>
                  {/* User details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                    <div className="profile-avatar" style={{ width: '44px', height: '44px', fontSize: '1rem', flexShrink: 0 }}>
                      {getInitials(currentUser.name)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{currentUser.name}</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{currentUser.email}</span>
                      <span className="badge badge-cyan" style={{ fontSize: '0.62rem', padding: '2px 6px', marginTop: '4px', width: 'fit-content' }}>{currentUser.role}</span>
                    </div>
                  </div>

                  {/* Role Switcher */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Change active role
                    </span>
                    <select
                      value={currentUser.id}
                      onChange={(e) => {
                        const selectedUser = usersList.find(u => u.id === e.target.value);
                        if (selectedUser) {
                          setCurrentUser(selectedUser);
                        }
                      }}
                      className="form-select"
                      style={{ fontSize: '0.8rem', padding: '8px 10px' }}
                    >
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mock actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <button 
                      onClick={() => { setProfilePopoverOpen(false); alert('Settings under development.'); }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
                    >
                      Account Settings
                    </button>
                    <button 
                      onClick={() => { setProfilePopoverOpen(false); alert('Sign out is disabled in demo mode.'); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* View Routing */}
        <div className="content-body">
          {activeView === 'hub' && (
            <>
              {activeTab === 'home' && (
                <HomeScreen 
                  onViewIncident={handleSelectIncident} 
                  onNewReport={handleNewReport}
                  onGoToTab={handleViewChangeFromHeader}
                />
              )}
              {activeTab === 'actions' && (
                <ActionManagement onSelectIncident={handleSelectIncident} />
              )}
              {activeTab === 'lessons' && (
                <LessonsLearned onSelectIncident={handleSelectIncident} />
              )}
              {activeTab === 'approvals' && (
                <ApprovalPanel onViewIncident={handleSelectIncident} />
              )}
              {activeTab === 'dashboard' && (
                <DashboardScreen />
              )}
              {activeTab === 'investigations' && (
                <InvestigationHub 
                  onSelectIncident={handleSelectIncident}
                  onStartInvestigation={(incidentId) => {
                    setSelectedIncidentId(incidentId);
                    setWorkspaceSource('hub');
                    setActiveView('workspace');
                  }}
                  onTriageIncident={(incidentId) => {
                    setSelectedIncidentId(incidentId);
                    setWorkspaceSource('hub');
                    setActiveView('detail');
                  }}
                />
              )}
              {activeTab === 'admin' && currentUser.role === roles.ADMIN && (
                <AdminRoleMapping />
              )}
            </>
          )}

          {activeView === 'detail' && (
            <DetailScreen 
              incidentId={selectedIncidentId} 
              onBack={() => {
                // If we came from approvals tab, return back to approvals, else home
                setActiveView('hub');
              }}
              onGoToWorkspace={handleGoToWorkspace}
            />
          )}

          {activeView === 'workspace' && (
            <InvestigationWorkspace 
              incidentId={selectedIncidentId}
              onBack={() => {
                if (workspaceSource === 'hub') {
                  setActiveView('hub');
                  setActiveTab('investigations');
                } else {
                  setActiveView('detail');
                }
              }}
            />
          )}

          {activeView === 'wizard' && (
            <FullReport 
              initialCategory={wizardCategory}
              onCancel={() => setActiveView('hub')}
              onSaveSuccess={() => {
                setActiveTab('home');
                setActiveView('hub');
              }}
            />
          )}
        </div>
      </main>

      {/* Quick report modal overlay */}
      {quickReportOpen && (
        <QuickReport 
          onClose={() => setQuickReportOpen(false)} 
          onSaveSuccess={() => {
            setQuickReportOpen(false);
            setActiveTab('home');
            setActiveView('hub');
          }}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <DatabaseProvider>
        <AppContent />
      </DatabaseProvider>
    </UserProvider>
  );
}

export default App;
