import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const ROLES = {
  REPORTER: 'Incident Reporter',
  CONTRACTOR: 'Contractor Reporter',
  SUPERVISOR: 'Site Supervisor',
  HSE_OFFICER: 'HSE Officer',
  INVESTIGATOR: 'Investigator',
  ACTION_OWNER: 'Action Owner',
  SITE_MANAGER: 'Site Manager',
  HSE_MANAGER: 'HSE Manager',
  EXECUTIVE: 'Executive Viewer',
  ADMIN: 'System Administrator',
};

export const MOCK_USERS = [
  { id: 'usr-1', name: 'Alex Chen', role: ROLES.REPORTER, site: 'DK-WF01', employer: 'EcoPower Global', email: 'alex.chen@ecopower.com' },
  { id: 'usr-2', name: 'Marcus Miller', role: ROLES.CONTRACTOR, site: 'US-SF02', employer: 'Apex Turbines Ltd', email: 'marcus@apexturbines.com' },
  { id: 'usr-3', name: 'Sarah Jenkins', role: ROLES.SUPERVISOR, site: 'DK-WF01', employer: 'EcoPower Global', email: 'sarah.j@ecopower.com' },
  { id: 'usr-4', name: 'Elena Rostova', role: ROLES.HSE_OFFICER, site: 'DK-WF01', employer: 'EcoPower Global', email: 'elena.r@ecopower.com' },
  { id: 'usr-5', name: 'David Vance', role: ROLES.INVESTIGATOR, site: 'DK-WF01', employer: 'EcoPower Global', email: 'david.v@ecopower.com' },
  { id: 'usr-6', name: 'Thomas Mueller', role: ROLES.ACTION_OWNER, site: 'US-SF02', employer: 'EcoPower Global', email: 'thomas.m@ecopower.com' },
  { id: 'usr-7', name: 'Karen Nielsen', role: ROLES.SITE_MANAGER, site: 'DK-WF01', employer: 'EcoPower Global', email: 'karen.n@ecopower.com' },
  { id: 'usr-8', name: 'Robert Sinclair', role: ROLES.HSE_MANAGER, site: 'ALL', employer: 'EcoPower Global', email: 'robert.s@ecopower.com' },
  { id: 'usr-9', name: 'Olivia Sterling', role: ROLES.EXECUTIVE, site: 'ALL', employer: 'EcoPower Global', email: 'olivia.s@ecopower.com' },
  { id: 'usr-10', name: 'Admin User', role: ROLES.ADMIN, site: 'ALL', employer: 'EcoPower Global', email: 'admin@ecopower.com' },
];

export const UserProvider = ({ children }) => {
  // Try loading active user from localStorage, default to the HSE Officer for standard debugging
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('hse_current_user');
    return saved ? JSON.parse(saved) : MOCK_USERS[3]; // Elena Rostova (HSE Officer)
  });

  useEffect(() => {
    localStorage.setItem('hse_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Access check helpers
  const hasRole = (roles) => {
    const rolesList = Array.isArray(roles) ? roles : [roles];
    return rolesList.includes(currentUser.role) || currentUser.role === ROLES.ADMIN;
  };

  const canViewIncident = (incident) => {
    if (currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.HSE_MANAGER || currentUser.role === ROLES.EXECUTIVE) {
      return true;
    }
    
    // Contractors can only see incidents they reported or incidents involving their organization
    if (currentUser.role === ROLES.CONTRACTOR) {
      return incident.reporterOrganisation === currentUser.employer || incident.reportedBy === currentUser.name;
    }

    // Site supervisors and managers can see incidents in their site
    if (currentUser.role === ROLES.SUPERVISOR || currentUser.role === ROLES.SITE_MANAGER) {
      return incident.site === currentUser.site;
    }

    // Investigators can see assigned incidents
    if (currentUser.role === ROLES.INVESTIGATOR) {
      return incident.investigation?.leadInvestigator === currentUser.name || incident.reportedBy === currentUser.name;
    }

    // Action owners can view incidents they own actions for
    if (currentUser.role === ROLES.ACTION_OWNER) {
      return incident.reportedBy === currentUser.name || incident.actions?.some(a => a.owner === currentUser.name);
    }

    // Field employee / Reporter can see their own reports
    return incident.reportedBy === currentUser.name || incident.site === currentUser.site;
  };

  const canEditIncident = (incident) => {
    // Closed incidents cannot be edited
    if (incident.status === 'Closed') return false;

    if (currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.HSE_MANAGER) {
      return true;
    }

    if (currentUser.role === ROLES.HSE_OFFICER) {
      return incident.site === currentUser.site || currentUser.site === 'ALL';
    }

    if (currentUser.role === ROLES.SUPERVISOR) {
      return incident.site === currentUser.site && incident.status === 'Submitted';
    }

    return incident.status === 'Draft' && incident.reportedBy === currentUser.name;
  };

  const canViewSensitiveInfo = (incident) => {
    // Medical details, Witness statements, Personal identifiers, Legal investigation records
    return hasRole([ROLES.HSE_OFFICER, ROLES.HSE_MANAGER, ROLES.INVESTIGATOR, ROLES.ADMIN]);
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      setCurrentUser,
      usersList: MOCK_USERS,
      hasRole,
      canViewIncident,
      canEditIncident,
      canViewSensitiveInfo,
      roles: ROLES
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
