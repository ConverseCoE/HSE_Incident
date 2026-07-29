import React, { createContext, useContext, useState, useEffect } from 'react';

const DatabaseContext = createContext();

// Master Data
export const MOCK_SITES = [
  { id: 'DK-WF01', name: 'Esbjerg Wind Farm 01', country: 'DK', code: 'WF01' },
  { id: 'US-SF02', name: 'Mojave Solar Farm 02', country: 'US', code: 'SF02' },
  { id: 'DE-BESS03', name: 'Bavaria Battery Storage 03', country: 'DE', code: 'BESS03' },
  { id: 'UK-OFF04', name: 'Dogger Bank Offshore Wind 04', country: 'UK', code: 'OFF04' },
  { id: 'CA-HYD05', name: 'Niagara Hydroelectric 05', country: 'CA', code: 'HYD05' },
];

export const MOCK_ASSETS = {
  'DK-WF01': [
    { id: 'WTG-01', name: 'Vestas V112 Turbine 01', type: 'Wind Turbine' },
    { id: 'WTG-02', name: 'Vestas V112 Turbine 02', type: 'Wind Turbine' },
    { id: 'WTG-03', name: 'Vestas V112 Turbine 03', type: 'Wind Turbine' },
    { id: 'SUB-A', name: 'Substation Alpha', type: 'Substation' },
    { id: 'WH-01', name: 'Maintenance Warehouse', type: 'Warehouse' },
  ],
  'US-SF02': [
    { id: 'ARR-A', name: 'Photovoltaic Array Alpha', type: 'Solar Array' },
    { id: 'ARR-B', name: 'Photovoltaic Array Beta', type: 'Solar Array' },
    { id: 'INV-01', name: 'Inverter Cabin 01', type: 'Inverter' },
    { id: 'TRF-01', name: 'Step-Up Transformer 01', type: 'Transformer' },
  ],
  'DE-BESS03': [
    { id: 'BESS-C1', name: 'Tesla Megapack Container 1', type: 'BESS Container' },
    { id: 'BESS-C2', name: 'Tesla Megapack Container 2', type: 'BESS Container' },
    { id: 'CTRL-01', name: 'Control & Switchgear Cabin', type: 'Control Room' },
  ],
  'UK-OFF04': [
    { id: 'OS-01', name: 'Siemens Gamesa OS-01', type: 'Wind Turbine (Offshore)' },
    { id: 'OS-02', name: 'Siemens Gamesa OS-02', type: 'Wind Turbine (Offshore)' },
    { id: 'CTV-01', name: 'CTV - Windcat 42 Transfer Vessel', type: 'Vessel' },
    { id: 'SUB-OFF', name: 'Offshore Substation Platform', type: 'Substation' },
  ],
  'CA-HYD05': [
    { id: 'GEN-01', name: 'Francis Turbine Generator H1', type: 'Hydro Generator' },
    { id: 'GATE-01', name: 'Intake Gate Control System', type: 'Intake Gate' },
    { id: 'PEN-01', name: 'Penstock 1 Steel Conduit', type: 'Penstock' },
    { id: 'SPW-01', name: 'Emergency Spillway Gates', type: 'Spillway' },
  ]
};

// 5x5 Risk Matrix Calculation
export const calculateRisk = (consequence, likelihood) => {
  const consVal = parseInt(consequence || 1, 10);
  const likeVal = parseInt(likelihood || 1, 10);
  const score = consVal * likeVal;

  if (score >= 15) return { rating: 'Critical', score, class: 'risk-critical' };
  if (score >= 10) return { rating: 'Major', score, class: 'risk-major' };
  if (score >= 6) return { rating: 'High', score, class: 'risk-high' };
  if (score >= 3) return { rating: 'Moderate', score, class: 'risk-moderate' };
  return { rating: 'Low', score, class: 'risk-low' };
};

const DEFAULT_INCIDENTS = [
  {
    id: 'hse-inc-1',
    incidentNumber: 'HSE-DK-WF01-2026-0001',
    title: 'Dropped tool from nacelle during turbine maintenance',
    category: 'Near Miss',
    subcategory: 'Dropped Object',
    incidentType: 'Near Miss',
    site: 'DK-WF01',
    siteArea: 'Nacelle WTG-02',
    asset: 'WTG-02',
    assetType: 'Wind Turbine',
    reportedDate: '2026-07-15T09:12:00Z',
    actualDate: '2026-07-15T08:45:00Z',
    reportedBy: 'Alex Chen',
    reporterOrganisation: 'EcoPower Global',
    reporterType: 'Employee',
    locationDescription: 'Inside Turbine WTG-02, dropped tool fell from the hub hatch down to the lower platform deck.',
    description: 'While performing gearbox torque inspection, a heavy 1.5kg torque wrench slipped from the technician harness loop and fell approximately 45 meters, landing on the nacelle base platform. No workers were below at the time.',
    status: 'Under Investigation',
    actualConsequence: '1', // None
    potentialConsequence: '4', // Major Injury Potential
    likelihood: '3', // Possible
    riskRating: 'Major', // 4 * 3 = 12
    regulatoryReportable: false,
    lostTimeIncident: false,
    medicalTreatment: false,
    environmentalImpact: false,
    assetDamage: false,
    // Renewable Specific details
    renewableScenario: 'Working-at-Height',
    heightOfWork: '85m',
    accessMethod: 'Turbine Internal Ladder',
    fallArrestEquipment: 'Full-body harness with twin lanyard',
    harnessInspectionStatus: 'Valid',
    rescuePlanAvailable: true,
    droppedObjectInvolved: true,
    weatherConditions: 'Clear, strong winds',
    windSpeed: '12 m/s',
    permitToWorkRef: 'PTW-2026-0899',
    workAtHeightSupervisor: 'Sarah Jenkins',
    // Workflows
    immediateActions: [
      { id: 'ia-1', description: 'Stopped work in turbine tower tower and nacelle', owner: 'Alex Chen', dateTime: '2026-07-15T08:50:00Z', status: 'Completed', verification: 'Confirmed visually by Alex' },
      { id: 'ia-2', description: 'Inspected fall zone and recovered tool', owner: 'Sarah Jenkins', dateTime: '2026-07-15T09:05:00Z', status: 'Completed', verification: 'Cleared deck for safety' }
    ],
    witnesses: [
      { id: 'w-1', name: 'Jonas Lindqvist', organisation: 'EcoPower Global', role: 'Turbine Tech Lead', contact: '+45 99 88 77 66', relationship: 'Co-worker at site', interviewDate: '2026-07-16', interviewedBy: 'Elena Rostova', statement: 'We were setting up the rig. I heard a metallic clink, then a bang. We immediately halted operations and checked the deck.', attachment: null }
    ],
    investigation: {
      investigationNumber: 'INV-2026-0001',
      leadInvestigator: 'Elena Rostova',
      teamMembers: ['David Vance', 'Sarah Jenkins'],
      scope: 'Examine harness attachment points, tethering tool guidelines, and training records.',
      method: 'Five Whys',
      targetCompletionDate: '2026-07-30',
      priority: 'High',
      status: 'In Progress',
      checklist: [
        { task: 'Scene secured', completed: true },
        { task: 'Evidence preserved', completed: true },
        { task: 'Photographs collected', completed: true },
        { task: 'Equipment inspected', completed: false },
        { task: 'Permit-to-work reviewed', completed: true },
        { task: 'Procedure reviewed', completed: false },
        { task: 'Training records reviewed', completed: false }
      ],
      fiveWhys: {
        problem: 'Torque wrench fell 45m from the nacelle work deck.',
        why1: 'The wrench was not tethered to the worker while in use.',
        why2: 'The tool holster did not have a matching lanyard attach point.',
        why3: 'The standard issue tool kit for torque inspection lacks integrated tethers.',
        why4: 'The procurement specification for the tool kits did not enforce dropped-object protection.',
        why5: 'Safety specifications were not linked to the tool purchasing catalog.',
        rootCause: 'Systemic gap in procurement guidelines for tooling used at heights.'
      },
      barrierAnalysis: [
        { barrier: 'Tool Lanyard Tether', existed: true, functioned: false, reason: 'Not attached to wrench', owner: 'Alex Chen' },
        { barrier: 'Nacelle Deck Mesh Guards', existed: false, functioned: false, reason: 'Hatch left open during work', owner: 'Jonas Lindqvist' },
        { barrier: 'Permit-to-Work Safety Review', existed: true, functioned: true, reason: 'Identified risk but failed to audit compliance', owner: 'Sarah Jenkins' }
      ]
    },
    actions: [
      { 
        id: 'act-1', 
        actionNumber: 'ACT-2026-0001', 
        type: 'Preventive', 
        title: 'Procure and distribute tool tethers for all wind technicians', 
        rootCauseAddressed: 'Lack of integrated tool tethers in kits', 
        owner: 'Thomas Mueller', 
        ownerDepartment: 'Procurement', 
        site: 'DK-WF01', 
        priority: 'High', 
        dueDate: '2026-08-15', 
        status: 'In progress', 
        progress: 40, 
        requiredEvidence: 'Purchase orders and photo verification of distributed tethers.',
        extensionRequests: [
          {
            id: 'ext-req-101',
            requestedDueDate: '2026-08-30',
            reason: 'Global supply chain delay on certified 5kg tool tethers from manufacturer.',
            interimControls: 'Equipped field technicians with backup wrist lanyards and temporary drop netting.',
            requestedBy: 'Thomas Mueller',
            requestedDate: '2026-07-28',
            status: 'Pending'
          }
        ]
      }
    ],
    approvals: [],
    communications: [],
    auditLogs: [
      { timestamp: '2026-07-15T09:12:00Z', user: 'Alex Chen', action: 'Created Report', details: 'Initial report saved as Submitted.' }
    ]
  },
  {
    id: 'hse-inc-2',
    incidentNumber: 'HSE-DE-BESS03-2026-0002',
    title: 'High temperature alarm in BESS Container 1',
    category: 'Property or Asset Damage',
    subcategory: 'Battery Thermal runaway suspected',
    incidentType: 'Incident',
    site: 'DE-BESS03',
    siteArea: 'BESS Enclosure Zone 1',
    asset: 'BESS-C1',
    assetType: 'BESS Container',
    reportedDate: '2026-07-19T22:30:00Z',
    actualDate: '2026-07-19T22:15:00Z',
    reportedBy: 'Elena Rostova',
    reporterOrganisation: 'EcoPower Global',
    reporterType: 'Employee',
    locationDescription: 'Bavaria Site, Container BESS-C1, Rack 04, Module B',
    description: 'Automated monitoring software detected a temperature spike exceeding 110 degrees C in Module B, Rack 04. Smoke alarm triggered inside BESS-C1. The automated fire suppression system deployed successfully.',
    status: 'Supervisor Review',
    actualConsequence: '2', // Minor Asset Damage
    potentialConsequence: '5', // Critical Catastrophic explosion potential
    likelihood: '3', // Possible
    riskRating: 'Critical', // 5 * 3 = 15
    regulatoryReportable: true,
    lostTimeIncident: false,
    medicalTreatment: false,
    environmentalImpact: false,
    assetDamage: true,
    // Renewable Specific details
    renewableScenario: 'Battery Thermal Event',
    batteryManufacturer: 'Tesla',
    batteryChemistry: 'LFP (Lithium Iron Phosphate)',
    batteryModuleRack: 'Rack 04, Module B',
    temperatureReading: '112 °C',
    smokeDetected: true,
    gasDetected: true,
    fireAlarmActivated: true,
    suppressionSystemActivated: true,
    thermalRunawaySuspected: true,
    isolationPerformed: true,
    emergencyServicesContacted: true,
    evacuationRadius: '100m',
    adjacentUnitsAffected: false,
    batteryMonitoringDataRef: 'BESS-LOG-20260719-2215',
    immediateActions: [
      { id: 'ia-3', description: 'Isolated electrical feed to Container BESS-C1', owner: 'Site Duty Operator', dateTime: '2026-07-19T22:20:00Z', status: 'Completed', verification: 'Confirmed isolated on SCADA' },
      { id: 'ia-4', description: 'Established 100m exclusion perimeter', owner: 'Elena Rostova', dateTime: '2026-07-19T22:25:00Z', status: 'Completed', verification: 'Barricades and signage posted' }
    ],
    witnesses: [],
    investigation: null,
    actions: [
      {
        id: 'act-3',
        actionNumber: 'ACT-2026-0003',
        type: 'Corrective',
        title: 'Install redundant Novec-1230 gas pressure sensors on BESS Container 1',
        rootCauseAddressed: 'Lack of redundant pressure sensor alerts in battery racks',
        owner: 'Alex Chen',
        ownerDepartment: 'Electrical Engineering',
        site: 'DE-BESS03',
        priority: 'High',
        dueDate: '2026-08-01',
        status: 'In progress',
        progress: 50,
        extensionRequests: [
          {
            id: 'ext-req-102',
            requestedDueDate: '2026-08-20',
            reason: 'Specialized Novec sensor calibration certificates delayed by testing laboratory.',
            interimControls: 'Performing twice-daily manual pressure gauge logs on BESS manifolds.',
            requestedBy: 'Alex Chen',
            requestedDate: '2026-07-27',
            status: 'Pending'
          }
        ]
      }
    ],
    approvals: [],
    auditLogs: [
      { timestamp: '2026-07-19T22:30:00Z', user: 'Elena Rostova', action: 'Created Critical Report', details: 'Thermal event triggered immediate SMS/Teams alerts to Operations, HSE Managers, and Fire coordinators.' }
    ]
  },
  {
    id: 'hse-inc-3',
    incidentNumber: 'HSE-US-SF02-2026-0003',
    title: 'Transformer dielectric oil leakage',
    category: 'Environmental Event',
    subcategory: 'Oil spill',
    incidentType: 'Environmental Event',
    site: 'US-SF02',
    siteArea: 'Main Substation Yard',
    asset: 'TRF-01',
    assetType: 'Transformer',
    reportedDate: '2026-07-10T14:20:00Z',
    actualDate: '2026-07-10T11:00:00Z',
    reportedBy: 'Marcus Miller',
    reporterOrganisation: 'Apex Turbines Ltd',
    reporterType: 'Contractor',
    locationDescription: 'Main step-up transformer bay, north gravel field.',
    description: 'During a routine inspection, a contractor noticed a slow, constant leak of dielectric oil from the cooling radiator flange on TRF-01. The oil has seeped through the gravel containment area into the underlying sand/soil.',
    status: 'Action Verification',
    actualConsequence: '2', // Minor Environmental
    potentialConsequence: '3', // Moderate
    likelihood: '4', // Likely
    riskRating: 'High', // 2 * 4 = 8
    regulatoryReportable: true,
    lostTimeIncident: false,
    medicalTreatment: false,
    environmentalImpact: true,
    assetDamage: true,
    // Environmental details
    environmentalEventCategory: 'Oil or Chemical Leakage',
    materialSubstance: 'FR3 Synthetic Ester Dielectric Fluid',
    estimatedQuantityReleased: '150',
    unitOfMeasurement: 'Gallons',
    releaseSource: 'Cooling Radiator Flange Flange',
    affectedLandWaterAir: 'Soil / Gravel Ground',
    wildlifeAffected: false,
    containmentStatus: 'Contained',
    cleanupStatus: 'In Progress',
    disposalMethod: 'Hazardous Waste Drum Disposal',
    externalAgencyNotified: 'US EPA / California State Environmental Dept',
    environmentalPermitRef: 'EP-US-SF02-99',
    estimatedEnvironmentalImpact: 'Localized soil contamination within the substation yard bounds.',
    samplingLabResults: 'Lab report #38992 indicates esters only, no PCB presence.',
    remediationActions: 'Excavation of contaminated gravel and sand.',
    // Renewable Specific details
    renewableScenario: 'Oil Leakage',
    equipmentSource: 'Transformer TRF-01 Radiator',
    oilType: 'Bio-Ester Oil',
    oilQty: 150,
    immediateActions: [
      { id: 'ia-5', description: 'Placed drip tray under the leaking flange', owner: 'Marcus Miller', dateTime: '2026-07-10T11:15:00Z', status: 'Completed', verification: 'Leak caught, tray emptied hourly' },
      { id: 'ia-6', description: 'Applied oil absorbent pads across ground area', owner: 'Marcus Miller', dateTime: '2026-07-10T11:30:00Z', status: 'Completed', verification: 'Prevented further soil spread' }
    ],
    witnesses: [],
    investigation: {
      investigationNumber: 'INV-2026-0003',
      leadInvestigator: 'Elena Rostova',
      teamMembers: ['David Vance', 'Marcus Miller'],
      scope: 'Review maintenance logs, check torque specs on gaskets, inspect flange structural wear.',
      method: 'Bow-tie analysis',
      targetCompletionDate: '2026-07-28',
      priority: 'Medium',
      status: 'Completed',
      checklist: [
        { task: 'Scene secured', completed: true },
        { task: 'Evidence preserved', completed: true },
        { task: 'Photographs collected', completed: true },
        { task: 'Equipment inspected', completed: true },
        { task: 'Permit-to-work reviewed', completed: true },
        { task: 'Procedure reviewed', completed: true },
        { task: 'Training records reviewed', completed: true }
      ],
      fiveWhys: {
        problem: '150 gallons of dielectric oil leaked from transformer flange.',
        why1: 'The gasket flange seals failed.',
        why2: 'Extreme thermal cycles caused the bolt joints to loosen.',
        why3: 'No lock-washers or torque tension indicators were installed on the flange bolts.',
        why4: 'The engineering design for high-heat solar substation transformers did not specify vibration-resistant fastener locks.',
        why5: 'Design review guidelines did not include check items for high thermal-expansion joints.',
        rootCause: 'Lack of thermal-expansion criteria in electrical substation fastener standards.'
      },
      barrierAnalysis: [
        { barrier: 'Oil Contaminant Pit', existed: true, functioned: false, reason: 'Leak bypassed the concrete pan due to wind blowing spray', owner: 'Site Manager' }
      ]
    },
    actions: [
      { id: 'act-2', actionNumber: 'ACT-2026-0002', type: 'Corrective', title: 'Excavate and safely dispose contaminated gravel/soil', rootCauseAddressed: 'Local soil contamination', owner: 'Thomas Mueller', ownerDepartment: 'Civil Operations', site: 'US-SF02', priority: 'High', dueDate: '2026-07-25', status: 'Pending verification', progress: 100, requiredEvidence: 'Waste manifest and post-remediation photographs.', completionEvidence: 'Excavated 12 barrels of soil. Post-excavation photo shows clean sandy layer. Manifest attached.', verifiedBy: 'Elena Rostova' }
    ],
    approvals: [],
    auditLogs: [
      { timestamp: '2026-07-10T14:20:00Z', user: 'Marcus Miller', action: 'Report Submitted', details: 'Initial report submitted by contractor.' }
    ]
  },
  {
    id: 'hse-inc-4',
    incidentNumber: 'HSE-UK-OFF04-2026-0004',
    title: 'Unsafe personnel CTV-to-turbine boat transfer',
    category: 'Safety Incident',
    subcategory: 'Offshore Access Issue',
    incidentType: 'Incident',
    site: 'UK-OFF04',
    siteArea: 'Offshore Turbine OS-02 Boat Landing',
    asset: 'OS-02',
    assetType: 'Wind Turbine (Offshore)',
    reportedDate: '2026-07-05T10:00:00Z',
    actualDate: '2026-07-05T07:30:00Z',
    reportedBy: 'Marcus Miller',
    reporterOrganisation: 'Apex Turbines Ltd',
    reporterType: 'Contractor',
    locationDescription: 'Boat landing ladder of OS-02 Turbine.',
    description: 'During heavy swells (2.4m wave heights), a contractor technician attempting to transfer from the Crew Transfer Vessel (CTV) to the turbine ladder slipped when the boat bow dropped suddenly. The technician hung by their fall-arrest lanyard. They were recovered back to the vessel deck with no injuries, but the event had high-potential for crush hazard.',
    status: 'Pending Approval',
    actualConsequence: '1', // None
    potentialConsequence: '4', // Major (Crush/Drowning)
    likelihood: '4', // Likely
    riskRating: 'Major', // 4 * 4 = 16
    regulatoryReportable: false,
    lostTimeIncident: false,
    medicalTreatment: false,
    environmentalImpact: false,
    assetDamage: false,
    // Renewable Specific details
    renewableScenario: 'Offshore Access Issue',
    offshoreFacility: 'Dogger Bank Platform A',
    turbinePlatform: 'OS-02',
    vesselName: 'Windcat 42',
    vesselOperator: 'Windcat Workboats',
    transferMethod: 'Vessel Push-On to Ladder',
    waveHeight: '2.4m',
    windSpeed: '18 knots',
    visibility: 'Good',
    seaStateClass: 'Sea State 4 (Moderate)',
    transferEquipmentUsed: 'Standard CTV Bow Fender and Fall Protection',
    crewTransferVesselStatus: 'Active',
    personalTransferEquipment: 'SafeTransfer Lanyard & Lifejacket',
    marineCoordinator: 'David Vance',
    accessSuspended: true,
    personnelStranded: false,
    immediateActions: [
      { id: 'ia-7', description: 'Suspended CTV marine transfers for UK-OFF04 immediately', owner: 'David Vance', dateTime: '2026-07-05T07:45:00Z', status: 'Completed', verification: 'Radio broadcast logged by Marine Coordinator' }
    ],
    witnesses: [],
    investigation: {
      investigationNumber: 'INV-2026-0004',
      leadInvestigator: 'David Vance',
      teamMembers: ['Elena Rostova', 'Marcus Miller'],
      scope: 'Evaluate marine safety guidelines and wave-height limits for CTV boat transfers.',
      method: 'Bow-tie analysis',
      targetCompletionDate: '2026-07-20',
      priority: 'High',
      status: 'Completed',
      checklist: [
        { task: 'Scene secured', completed: true },
        { task: 'Evidence preserved', completed: true }
      ],
      fiveWhys: {
        problem: 'Technician slipped on ladder during CTV transfer.',
        why1: 'The vessel bow shifted downward abruptly by 1.5m.',
        why2: 'The wave swell was near the maximum limits of the vessel push-on capability.',
        why3: 'Transfer was authorized in sea states exceeding safety procedures for this class of CTV.',
        why4: 'Marine control relied on regional forecast instead of local real-time wave buoy telemetry.',
        why5: 'Buoy telemetry was offline and no secondary local measurement process was defined.',
        rootCause: 'Lack of redundant wave-height measurement procedures for remote offshore sites.'
      },
      barrierAnalysis: []
    },
    actions: [
      { id: 'act-3', actionNumber: 'ACT-2026-0003', type: 'Corrective', title: 'Install real-time wave telemetry dashboard in Marine Control', rootCauseAddressed: 'Lack of telemetry data', owner: 'Thomas Mueller', ownerDepartment: 'Operations IT', site: 'UK-OFF04', priority: 'High', dueDate: '2026-07-18', status: 'Completed', progress: 100, verifiedBy: 'David Vance', verificationDate: '2026-07-19' }
    ],
    approvals: [
      { id: 'ap-1', stage: 'HSE Officer', reviewer: 'Elena Rostova', status: 'Approved', comments: 'Investigation thorough. Corrective actions validated and completed.', date: '2026-07-19T10:00:00Z' },
      { id: 'ap-2', stage: 'Site Manager', reviewer: 'Karen Nielsen', status: 'Approved', comments: 'Operational impact resolved. Happy to close.', date: '2026-07-19T15:30:00Z' }
    ],
    auditLogs: [
      { timestamp: '2026-07-05T10:00:00Z', user: 'Marcus Miller', action: 'Report Created', details: 'Incident submitted' }
    ]
  },
  {
    id: 'hse-inc-5',
    incidentNumber: 'HSE-DK-WF01-2026-0005',
    title: 'Eagle carcass found near WTG-01 turbine base',
    category: 'Environmental Event',
    subcategory: 'Bird or Wildlife Incident',
    incidentType: 'Environmental Event',
    site: 'DK-WF01',
    siteArea: 'Base of WTG-01 Turbine',
    asset: 'WTG-01',
    assetType: 'Wind Turbine',
    reportedDate: '2026-07-01T08:00:00Z',
    actualDate: '2026-07-01T07:15:00Z',
    reportedBy: 'Alex Chen',
    reporterOrganisation: 'EcoPower Global',
    reporterType: 'Employee',
    locationDescription: '45m North of WTG-01 tower foundation.',
    description: 'During monthly site walk, a technician discovered a dead Golden Eagle near WTG-01. Fatal injuries appear consistent with turbine blade strike.',
    status: 'Closed',
    actualConsequence: '2', // Local environmental impact
    potentialConsequence: '3', // Regulatory penalty risk
    likelihood: '3', // Possible
    riskRating: 'Moderate', // 2 * 3 = 6
    regulatoryReportable: true,
    lostTimeIncident: false,
    medicalTreatment: false,
    environmentalImpact: true,
    assetDamage: false,
    // Environmental Details
    environmentalEventCategory: 'Wildlife Impact',
    wildlifeAffected: true,
    wildlifeSpecies: 'Golden Eagle (Protected)',
    numberOfWildlife: 1,
    externalAgencyNotified: 'Danish Environmental Agency',
    environmentalPermitRef: 'EP-DK-WF01-ENV',
    // Renewable Specific details
    renewableScenario: 'Bird or Wildlife Incident',
    species: 'Golden Eagle',
    numberAffected: '1',
    discoveryDateTime: '2026-07-01T07:15:00Z',
    carcassHandling: 'Bagged and sent to Veterinary Institute for necropsy.',
    wildlifeAuthorityNotification: 'Danish EPA Notified on 2026-07-01',
    environmentalSpecialistReview: 'Dr. Hansen confirmed collision impact.',
    migrationPeriod: 'Summer Nesting',
    turbineOperationalStatus: 'Active',
    curtailmentAction: 'Implemented temporary blade-pitch curtailment during high eagle activity hours.',
    monitoringRequirement: 'Visual audits twice weekly.',
    immediateActions: [
      { id: 'ia-8', description: 'Secured carcass and documented with photos', owner: 'Alex Chen', dateTime: '2026-07-01T07:30:00Z', status: 'Completed', verification: 'Carcass refrigerated for transport' }
    ],
    witnesses: [],
    investigation: {
      investigationNumber: 'INV-2026-0005',
      leadInvestigator: 'Elena Rostova',
      teamMembers: ['David Vance'],
      scope: 'Analyze SCADA radar detections and blade rotation logs.',
      method: 'Barrier analysis',
      targetCompletionDate: '2026-07-15',
      priority: 'Low',
      status: 'Completed',
      checklist: [
        { task: 'Scene secured', completed: true },
        { task: 'Evidence preserved', completed: true }
      ],
      fiveWhys: {
        problem: 'Golden Eagle struck by turbine blade.',
        why1: 'Eagle flew into the path of rotating blade.',
        why2: 'The bird was hunting local rodent populations near the cleared grass turbine base.',
        why3: 'The mowed grass base attracted small rodents into clear view.',
        why4: 'Vegetation control procedure specified short-mowing around all turbine pads.',
        why5: 'Wildlife collision risks were not reviewed during the review of the vegetation control specifications.',
        rootCause: 'Vegetation management program created wildlife feeding attractants near active blades.'
      },
      barrierAnalysis: []
    },
    actions: [
      { id: 'act-4', actionNumber: 'ACT-2026-0004', type: 'Corrective', title: 'Amend vegetation mowing rules to retain tall scrub within 50m of WTG towers', rootCauseAddressed: 'Short-grass rodent attraction', owner: 'Thomas Mueller', ownerDepartment: 'Environment', site: 'DK-WF01', priority: 'Medium', dueDate: '2026-07-10', status: 'Completed', progress: 100, verifiedBy: 'Elena Rostova', verificationDate: '2026-07-11' }
    ],
    approvals: [
      { id: 'ap-3', stage: 'HSE Officer', reviewer: 'Elena Rostova', status: 'Approved', comments: 'Curtailment guidelines verified.', date: '2026-07-12' },
      { id: 'ap-4', stage: 'HSE Manager', reviewer: 'Robert Sinclair', status: 'Approved', comments: 'Closure approved. Lessons learned published.', date: '2026-07-14' }
    ],
    lessonsLearned: {
      id: 'll-1',
      eventSummary: 'Golden Eagle strike at WTG-01',
      whatHappened: 'A protected Golden Eagle collided with a rotating wind turbine blade.',
      whyItHappened: 'Short-cut grass around turbine bases created a clear-view hunting ground for birds of prey targeting rodents, increasing their flight time in the sweep hazard zone.',
      actionsTaken: 'Revised mowing instructions to maintain high grass/scrub cover near towers, reducing rodent visibility.',
      recommendedControls: 'Do not mow within 50m of turbines during migration/nesting seasons unless safety requires.',
      sitesAffected: 'All onshore wind farms (DK-WF01, etc.)',
      communicationAudience: 'Operations & Maintenance Teams',
      confidentialityClass: 'Public Internal'
    },
    auditLogs: [
      { timestamp: '2026-07-01T08:00:00Z', user: 'Alex Chen', action: 'Report Created', details: 'Incident submitted' },
      { timestamp: '2026-07-14T17:00:00Z', user: 'Robert Sinclair', action: 'Closed', details: 'All actions verified, incident marked as closed.' }
    ]
  },
  {
    id: 'hse-inc-6',
    incidentNumber: 'HSE-US-SF02-2026-0006',
    title: 'Arc flash hazard during inverter enclosure audit',
    category: 'Near Miss',
    subcategory: 'Electrical Safety',
    incidentType: 'Near Miss',
    site: 'US-SF02',
    siteArea: 'Inverter Cabin 01',
    asset: 'INV-01',
    assetType: 'Inverter',
    reportedDate: '2026-06-10T09:00:00Z',
    actualDate: '2026-06-10T08:30:00Z',
    reportedBy: 'Marcus Miller',
    reporterOrganisation: 'Apex Turbines Ltd',
    reporterType: 'Contractor',
    locationDescription: 'Inside inverter cabinet INV-01.',
    description: 'While performing standard insulation testing, a contractor noticed degraded barrier shields near the busbars. There was potential for an arc flash under high load.',
    status: 'Under Investigation',
    actualConsequence: '1',
    potentialConsequence: '4',
    likelihood: '4',
    riskRating: 'Major',
    regulatoryReportable: false,
    lostTimeIncident: false,
    medicalTreatment: false,
    environmentalImpact: false,
    assetDamage: false,
    renewableScenario: 'Electrical Safety',
    immediateActions: [
      { id: 'ia-10', description: 'De-energized inverter cabinet for repairs', owner: 'Marcus Miller', dateTime: '2026-06-10T08:45:00Z', status: 'Completed', verification: 'Lockout tagout applied' }
    ],
    witnesses: [],
    investigation: {
      investigationNumber: 'INV-2026-0006',
      leadInvestigator: 'Elena Rostova',
      teamMembers: ['David Vance'],
      scope: 'Check preventive maintenance frequencies and barrier shield material ratings.',
      method: 'Five Whys',
      targetCompletionDate: '2026-07-25',
      priority: 'High',
      status: 'In Progress',
      checklist: [
        { task: 'Cabinet isolated', completed: true },
        { task: 'Materials verified', completed: true },
        { task: 'Circuit logs reviewed', completed: true },
        { task: 'Thermal scan completed', completed: true }
      ],
      fiveWhys: {
        problem: 'Insulation shield degradation went undetected during enclosure audit.',
        why1: 'No check items existed for shield inspection in weekly PMs.',
        why2: 'Weekly checklists only covered functional readings.',
        why3: 'PM guidelines assumed annual checks were sufficient.',
        why4: 'High solar heat acceleration of plastic aging was not factored.',
        why5: '',
        rootCause: ''
      },
      barrierAnalysis: []
    },
    actions: [
      { id: 'act-6', actionNumber: 'ACT-2026-0006', type: 'Corrective', title: 'Replace worn insulating shields in Inverter cabin 01', rootCauseAddressed: 'Plastic shield wear', owner: 'Thomas Mueller', ownerDepartment: 'Maintenance', site: 'US-SF02', priority: 'High', dueDate: '2026-07-05', status: 'Assigned', progress: 0, requiredEvidence: 'Photo of new insulation shield installed.' }
    ],
    approvals: [],
    auditLogs: [
      { timestamp: '2026-06-10T09:00:00Z', user: 'Marcus Miller', action: 'Report Created', details: 'Initial report saved.' }
    ]
  },
  {
    id: 'hse-inc-7',
    incidentNumber: 'HSE-UK-OFF04-2026-0007',
    title: 'Cable handling minor hand abrasion',
    category: 'Safety Incident',
    subcategory: 'First Aid Case',
    incidentType: 'Incident',
    site: 'UK-OFF04',
    siteArea: 'Offshore Substation Deck A',
    asset: 'SUB-OFF',
    assetType: 'Substation',
    reportedDate: '2026-07-20T10:00:00Z',
    actualDate: '2026-07-20T09:40:00Z',
    reportedBy: 'Robert Sinclair',
    reporterOrganisation: 'EcoPower Global',
    reporterType: 'Employee',
    locationDescription: 'Cable pull zone, platform deck level 2.',
    description: 'While pulling light control cables, a worker scraped their hand on a metal cable tray edge. Minor abrasion, treated with first-aid ointment and plaster.',
    status: 'Pending Review',
    actualConsequence: '1',
    potentialConsequence: '2',
    likelihood: '2',
    riskRating: 'Low',
    regulatoryReportable: false,
    lostTimeIncident: false,
    medicalTreatment: false,
    environmentalImpact: false,
    assetDamage: false,
    renewableScenario: 'Cable Handling',
    immediateActions: [
      { id: 'ia-11', description: 'Applied first aid plaster', owner: 'Robert Sinclair', dateTime: '2026-07-20T09:45:00Z', status: 'Completed', verification: 'Tech returned to work' }
    ],
    witnesses: [],
    investigation: null,
    actions: [],
    approvals: [],
    auditLogs: [
      { timestamp: '2026-07-20T10:00:00Z', user: 'Robert Sinclair', action: 'Report Created', details: 'Incident submitted' }
    ]
  },
  {
    id: 'hse-inc-8',
    incidentNumber: 'HSE-DK-WF01-2026-0008',
    title: 'Hydraulic leak from pitch control manifold WTG-03',
    category: 'Environmental Event',
    subcategory: 'Oil spill',
    incidentType: 'Environmental Event',
    site: 'DK-WF01',
    siteArea: 'Hub area, WTG-03',
    asset: 'WTG-03',
    assetType: 'Wind Turbine',
    reportedDate: '2026-07-20T16:00:00Z',
    actualDate: '2026-07-20T15:00:00Z',
    reportedBy: 'Alex Chen',
    reporterOrganisation: 'EcoPower Global',
    reporterType: 'Employee',
    locationDescription: 'Inside WTG-03 hub nose cone.',
    description: 'During inspection of pitch actuators, minor leakage of hydraulic fluid was found leaking from a manifold connector, dripping onto the internal nose cone surfaces. Spill volume estimated at 3 liters, contained internally.',
    status: 'Pending Review',
    actualConsequence: '1',
    potentialConsequence: '2',
    likelihood: '3',
    riskRating: 'Moderate',
    regulatoryReportable: false,
    lostTimeIncident: false,
    medicalTreatment: false,
    environmentalImpact: true,
    assetDamage: false,
    renewableScenario: 'Oil Leakage',
    immediateActions: [
      { id: 'ia-12', description: 'Tightened manifold connection, absorbed fluid', owner: 'Alex Chen', dateTime: '2026-07-20T15:30:00Z', status: 'Completed', verification: 'Cleaned surfaces verified' }
    ],
    witnesses: [],
    investigation: null,
    actions: [],
    approvals: [],
    auditLogs: [
      { timestamp: '2026-07-20T16:00:00Z', user: 'Alex Chen', action: 'Report Created', details: 'Incident submitted' }
    ]
  },
  {
    id: 'hse-inc-9',
    incidentNumber: 'HSE-DK-WF01-2026-0009',
    title: 'Slipped ladder rung on turbine foundation',
    category: 'Safety Incident',
    subcategory: 'Near Miss',
    incidentType: 'Near Miss',
    site: 'DK-WF01',
    siteArea: 'Base Platform WTG-03',
    asset: 'WTG-03',
    assetType: 'Wind Turbine',
    reportedDate: '2026-07-12T08:00:00Z',
    actualDate: '2026-07-12T07:15:00Z',
    reportedBy: 'Sarah Jenkins',
    reporterOrganisation: 'EcoPower Global',
    reporterType: 'Employee',
    locationDescription: 'Access ladder, WTG-03 external platform.',
    description: 'While stepping onto the bottom ladder rung from the main deck, the technician slipped due to algae build-up on the rung. They did not fall as they had a secure three-point grip.',
    status: 'Under Investigation',
    actualConsequence: '1',
    potentialConsequence: '3',
    likelihood: '4',
    riskRating: 'High',
    regulatoryReportable: false,
    lostTimeIncident: false,
    medicalTreatment: false,
    environmentalImpact: false,
    assetDamage: false,
    renewableScenario: 'Working-at-Height',
    immediateActions: [
      { id: 'ia-13', description: 'Marked rung with safety caution tape', owner: 'Sarah Jenkins', dateTime: '2026-07-12T07:30:00Z', status: 'Completed', verification: 'Caution sign visible' }
    ],
    witnesses: [],
    investigation: {
      investigationNumber: 'INV-2026-0009',
      leadInvestigator: 'David Vance',
      teamMembers: ['Sarah Jenkins'],
      scope: 'Inspect external ladder surfaces and review cleaning protocols.',
      method: 'Five Whys',
      targetCompletionDate: '2026-07-30',
      priority: 'Medium',
      status: 'In Progress',
      checklist: [
        { task: 'Ladder inspected', completed: true },
        { task: 'Cleaning records reviewed', completed: true }
      ],
      fiveWhys: {
        problem: 'Algae build-up on platform ladder rung.',
        why1: 'The ladder has not been high-pressure washed this quarter.',
        why2: 'Maintenance team skipped ladder cleaning due to rough seas scheduling.',
        why3: 'Ladder cleaning is grouped under low-priority cosmetic tasks.',
        why4: 'Operational safety rules do not separate ladder cleaning from general deck wash.',
        why5: 'Safety management did not highlight ladder grip maintenance in site risk plans.',
        rootCause: 'Lack of distinct preventative cleaning logs for climbing structures.'
      },
      barrierAnalysis: []
    },
    actions: [
      { id: 'act-9', actionNumber: 'ACT-2026-0009', type: 'Preventive', title: 'Audit foundation ladders torque and rung grip coatings', owner: 'Sarah Jenkins', ownerDepartment: 'Operations', site: 'DK-WF01', priority: 'Medium', dueDate: '2026-08-01', status: 'Assigned', progress: 0, requiredEvidence: 'Ladders inspection sheet.' }
    ],
    approvals: [],
    auditLogs: [
      { timestamp: '2026-07-12T08:00:00Z', user: 'Sarah Jenkins', action: 'Report Created', details: 'Incident submitted' }
    ]
  },
  {
    id: 'hse-inc-10',
    incidentNumber: 'HSE-DK-WF01-2026-0010',
    title: 'Incorrect disposal of aerosol cans in scrap yard',
    category: 'Environmental Event',
    subcategory: 'Waste Management',
    incidentType: 'Incident',
    site: 'DK-WF01',
    siteArea: 'Warehouse scrap yard',
    asset: 'WH-01',
    assetType: 'Warehouse',
    reportedDate: '2026-06-15T09:00:00Z',
    actualDate: '2026-06-15T08:15:00Z',
    reportedBy: 'Alex Chen',
    reporterOrganisation: 'EcoPower Global',
    reporterType: 'Employee',
    locationDescription: 'Main warehouse waste bin area.',
    description: 'During a waste sorting check, two pressurized aerosol cans containing solvent cleaners were found disposed in the general scrap metal bin instead of the hazardous waste lockers.',
    status: 'Pending Approval',
    actualConsequence: '1',
    potentialConsequence: '3',
    likelihood: '3',
    riskRating: 'Moderate',
    regulatoryReportable: false,
    lostTimeIncident: false,
    medicalTreatment: false,
    environmentalImpact: true,
    assetDamage: false,
    renewableScenario: 'Waste Management',
    immediateActions: [
      { id: 'ia-14', description: 'Transferred cans to hazardous waste cabinet', owner: 'Alex Chen', dateTime: '2026-06-15T08:30:00Z', status: 'Completed', verification: 'Cans isolated safely' }
    ],
    witnesses: [],
    investigation: {
      investigationNumber: 'INV-2026-0010',
      leadInvestigator: 'Elena Rostova',
      teamMembers: ['Sarah Jenkins'],
      scope: 'Review warehouse waste label compliance and audit staff disposal habits.',
      method: 'Five Whys',
      targetCompletionDate: '2026-07-28',
      priority: 'Medium',
      status: 'In Progress',
      checklist: [
        { task: 'Bins audited', completed: true },
        { task: 'Signs checked', completed: true }
      ],
      fiveWhys: {
        problem: 'Aerosol cans placed in general scrap bins.',
        why1: 'The subcontractor worker did not read the bin warning label.',
        why2: 'The warning label was faded and partially covered by dirt.',
        why3: 'Labels are not regularly audited or replaced by housekeeping.',
        why4: 'No audit check items existed for bin labeling in safety tours.',
        why5: 'Housekeeping specifications lacked hazardous sorting guidelines.',
        rootCause: 'Inadequate auditing of hazardous waste signage and subcontract training.'
      },
      barrierAnalysis: []
    },
    actions: [
      { id: 'act-10', actionNumber: 'ACT-2026-0010', type: 'Preventive', title: 'Conduct scrap yard hazardous materials sorting refresher audit', owner: 'Elena Rostova', ownerDepartment: 'HSE', site: 'DK-WF01', priority: 'High', dueDate: '2026-07-10', status: 'Assigned', progress: 0, requiredEvidence: 'Audit completion log and training attendance list.' }
    ],
    approvals: [],
    auditLogs: [
      { timestamp: '2026-06-15T09:00:00Z', user: 'Alex Chen', action: 'Report Created', details: 'Incident submitted' }
    ]
  },
  {
    id: 'hse-inc-11',
    incidentNumber: 'HSE-DK-WF01-2026-0011',
    title: 'Thermal camera scanner calibration drift',
    category: 'Near Miss',
    subcategory: 'Equipment Calibration',
    incidentType: 'Near Miss',
    site: 'DK-WF01',
    siteArea: 'Maintenance Warehouse room 2',
    asset: 'WH-01',
    assetType: 'Warehouse',
    reportedDate: '2026-07-21T08:00:00Z',
    actualDate: '2026-07-21T07:45:00Z',
    reportedBy: 'Karen Nielsen',
    reporterOrganisation: 'EcoPower Global',
    reporterType: 'Employee',
    locationDescription: 'Calibration lab WTG warehouse.',
    description: 'A contractor conducting thermographic scans noticed their camera reading was drifting by +5 degrees C, which could cause missing hot spots on solar arrays or sub-components. Re-calibrated.',
    status: 'Pending Review',
    actualConsequence: '1',
    potentialConsequence: '2',
    likelihood: '3',
    riskRating: 'Moderate',
    regulatoryReportable: false,
    lostTimeIncident: false,
    medicalTreatment: false,
    environmentalImpact: false,
    assetDamage: false,
    renewableScenario: 'Electrical Safety',
    immediateActions: [
      { id: 'ia-15', description: 'Calibrated camera using reference block', owner: 'Site Tech', dateTime: '2026-07-21T07:55:00Z', status: 'Completed', verification: 'Calibrated reading verified' }
    ],
    witnesses: [],
    investigation: null,
    actions: [],
    approvals: [],
    auditLogs: [
      { timestamp: '2026-07-21T08:00:00Z', user: 'Karen Nielsen', action: 'Report Created', details: 'Incident submitted' }
    ]
  }
];

export const DatabaseProvider = ({ children }) => {
  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem('hse_incidents_v4');
    return saved ? JSON.parse(saved) : DEFAULT_INCIDENTS;
  });

  const [notifications, setNotifications] = useState([
    { id: 'not-1', incidentId: 'hse-inc-2', title: 'CRITICAL: Thermal runaway alert at BESS-C1', timestamp: '2026-07-19T22:30:00Z', read: false },
    { id: 'not-2', incidentId: 'hse-inc-1', title: 'New Investigation assigned: Dropped tool at WTG-02', timestamp: '2026-07-15T09:15:00Z', read: true }
  ]);

  const [offlinePending, setOfflinePending] = useState(() => {
    const saved = localStorage.getItem('hse_offline_pending_v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [isOnline, setIsOnline] = useState(true);

  const [safetyAlerts, setSafetyAlerts] = useState(() => {
    const saved = localStorage.getItem('hse_safety_alerts_v3');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'sa-1',
        incidentId: 'hse-inc-2',
        incidentNumber: 'HSE-US-SF02-2026-0002',
        title: 'Lessons Learned: Dielectric Oil Leak at transformer flange',
        why: 'Lack of thermal-expansion criteria in electrical fastener standards.',
        what: 'Replaced standard washers with tension indicator springs.',
        learning: 'Verify thermal expansion limits when reviewing solar substation high-temperature electrical bolts.',
        site: 'US-SF02',
        category: 'Environmental Event',
        publishedBy: 'Elena Rostova',
        publishedDate: '2026-07-26T12:00:00Z'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('hse_safety_alerts_v3', JSON.stringify(safetyAlerts));
  }, [safetyAlerts]);

  // Persist back to local storage
  useEffect(() => {
    localStorage.setItem('hse_incidents_v4', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('hse_offline_pending_v3', JSON.stringify(offlinePending));
  }, [offlinePending]);

  // Generate Incident Number
  const generateIncidentNumber = (siteId, category) => {
    const siteObj = MOCK_SITES.find(s => s.id === siteId) || { country: 'XX', code: 'WFX' };
    const year = new Date().getFullYear();
    const count = incidents.length + offlinePending.length + 1;
    const seq = String(count).padStart(6, '0');
    
    // HSE-[Country]-[Site Code]-[Year]-[Sequential Number]
    return `HSE-${siteObj.country}-${siteObj.code}-${year}-${seq}`;
  };

  // Add Incident (Support Offline & Online)
  const addIncident = (incidentData, isDraft = false) => {
    const newId = `hse-inc-${Date.now()}`;
    const incidentNum = generateIncidentNumber(incidentData.site, incidentData.category);

    const calculatedRiskRating = calculateRisk(incidentData.potentialConsequence, incidentData.likelihood).rating;

    const newRecord = {
      ...incidentData,
      id: newId,
      incidentNumber: incidentNum,
      reportedDate: new Date().toISOString(),
      reportedBy: incidentData.reportedBy || 'System User',
      status: isDraft ? 'Draft' : 'Pending Review',
      riskRating: calculatedRiskRating,
      immediateActions: incidentData.immediateActions || [],
      witnesses: incidentData.witnesses || [],
      investigation: null,
      actions: [],
      approvals: [],
      auditLogs: [
        {
          timestamp: new Date().toISOString(),
          user: incidentData.reportedBy || 'System User',
          action: isDraft ? 'Draft Created' : 'Incident Submitted',
          details: isDraft ? 'Incident saved as draft' : `Incident submitted with Risk Level: ${calculatedRiskRating}`
        }
      ]
    };

    if (!isOnline) {
      setOfflinePending(prev => [...prev, newRecord]);
      // Push simple offline alert
      setNotifications(prev => [
        { id: `not-off-${Date.now()}`, incidentId: newRecord.id, title: `Offline Draft Saved: ${newRecord.incidentNumber}`, timestamp: new Date().toISOString(), read: false },
        ...prev
      ]);
      return newRecord;
    }

    setIncidents(prev => [newRecord, ...prev]);

    // Send notifications based on severity
    triggerNotifications(newRecord);
    return newRecord;
  };

  // Trigger Notifications
  const triggerNotifications = (incident) => {
    const isCritical = incident.riskRating === 'Critical' || incident.riskRating === 'Major';
    const title = `${isCritical ? 'ALERT' : 'INFO'} [${incident.riskRating} Severity]: ${incident.title} at ${incident.site}`;
    
    setNotifications(prev => [
      { id: `not-${Date.now()}`, incidentId: incident.id, title, timestamp: new Date().toISOString(), read: false },
      ...prev
    ]);
  };

  // Update Incident
  const updateIncident = (id, fields, userName = 'System User') => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        const updatedLogs = [...(inc.auditLogs || [])];
        Object.keys(fields).forEach(key => {
          if (fields[key] !== inc[key] && key !== 'auditLogs') {
            updatedLogs.push({
              timestamp: new Date().toISOString(),
              user: userName,
              action: `Modified ${key}`,
              details: `Changed from "${JSON.stringify(inc[key])}" to "${JSON.stringify(fields[key])}"`
            });
          }
        });

        // Auto recalculate risk rating if consequence/likelihood change
        let riskRating = inc.riskRating;
        if (fields.potentialConsequence !== undefined || fields.likelihood !== undefined) {
          const c = fields.potentialConsequence !== undefined ? fields.potentialConsequence : inc.potentialConsequence;
          const l = fields.likelihood !== undefined ? fields.likelihood : inc.likelihood;
          riskRating = calculateRisk(c, l).rating;
        }

        return { ...inc, ...fields, riskRating, auditLogs: updatedLogs };
      }
      return inc;
    }));
  };

  // Add Immediate Action
  const addImmediateAction = (incidentId, action, userName) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const newActions = [...(inc.immediateActions || []), { id: `ia-${Date.now()}`, ...action }];
        const updatedLogs = [...(inc.auditLogs || []), {
          timestamp: new Date().toISOString(),
          user: userName,
          action: 'Added Immediate Action',
          details: action.description
        }];
        return { ...inc, immediateActions: newActions, auditLogs: updatedLogs };
      }
      return inc;
    }));
  };

  // Complete Immediate Action
  const verifyImmediateAction = (incidentId, actionId, verificationDetails, userName) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const newActions = inc.immediateActions.map(act => {
          if (act.id === actionId) {
            return { ...act, status: 'Completed', verification: verificationDetails };
          }
          return act;
        });
        const updatedLogs = [...(inc.auditLogs || []), {
          timestamp: new Date().toISOString(),
          user: userName,
          action: 'Verified Immediate Action',
          details: `Action ID: ${actionId} marked complete.`
        }];
        return { ...inc, immediateActions: newActions, auditLogs: updatedLogs };
      }
      return inc;
    }));
  };

  // Investigation Setup
  const initializeInvestigation = (incidentId, leadInvestigator, targetDate, userName) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const updatedLogs = [...(inc.auditLogs || []), {
          timestamp: new Date().toISOString(),
          user: userName,
          action: 'Created Investigation Workspace',
          details: `Assigned Lead: ${leadInvestigator}, Target: ${targetDate}`
        }];
        return {
          ...inc,
          status: 'Under Investigation',
          investigation: {
            investigationNumber: `INV-${new Date().getFullYear()}-${String(incidents.length + 1).padStart(4, '0')}`,
            leadInvestigator,
            teamMembers: [userName],
            scope: `Analyze immediate and systemic causes for incident ${inc.incidentNumber}.`,
            method: 'Five Whys',
            targetCompletionDate: targetDate,
            priority: inc.riskRating === 'Critical' || inc.riskRating === 'Major' ? 'High' : 'Medium',
            status: 'In Progress',
            checklist: [
              { task: 'Scene secured', completed: false },
              { task: 'Evidence preserved', completed: false },
              { task: 'Photographs collected', completed: false },
              { task: 'Equipment inspected', completed: false },
              { task: 'Permit-to-work reviewed', completed: false },
              { task: 'Procedure reviewed', completed: false },
              { task: 'Training records reviewed', completed: false }
            ],
            fiveWhys: {
              problem: inc.title,
              why1: '', why2: '', why3: '', why4: '', why5: '',
              rootCause: ''
            },
            barrierAnalysis: []
          },
          auditLogs: updatedLogs
        };
      }
      return inc;
    }));
  };

  // Update Investigation checklist / five whys / barriers
  const updateInvestigationDetails = (incidentId, fields, userName) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId && inc.investigation) {
        return {
          ...inc,
          investigation: { ...inc.investigation, ...fields },
          auditLogs: [...(inc.auditLogs || []), {
            timestamp: new Date().toISOString(),
            user: userName,
            action: 'Updated Investigation Workspace',
            details: 'Saved root-causes, barriers, or checklists.'
          }]
        };
      }
      return inc;
    }));
  };

  // Corrective Actions management
  const addCorrectiveAction = (incidentId, action, userName) => {
    const actId = `act-${Date.now()}`;
    const actNum = `ACT-${new Date().getFullYear()}-${String(incidents.reduce((acc, current) => acc + (current.actions?.length || 0), 0) + 1).padStart(4, '0')}`;

    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const newAction = {
          id: actId,
          actionNumber: actNum,
          status: 'Assigned',
          progress: 0,
          ...action
        };
        const newActions = [...(inc.actions || []), newAction];
        
        return {
          ...inc,
          actions: newActions,
          auditLogs: [...(inc.auditLogs || []), {
            timestamp: new Date().toISOString(),
            user: userName,
            action: 'Created Corrective Action',
            details: `${actNum}: ${action.title} assigned to ${action.owner}`
          }]
        };
      }
      return inc;
    }));

    // Alert Owner
    setNotifications(prev => [
      { id: `not-${Date.now()}`, incidentId, title: `Corrective Action ${actNum} assigned to you: ${action.title}`, timestamp: new Date().toISOString(), read: false },
      ...prev
    ]);
  };

  // Update Corrective Action Status (from owner)
  const updateActionStatus = (incidentId, actionId, fields, userName) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const newActions = inc.actions.map(act => {
          if (act.id === actionId) {
            return { ...act, ...fields };
          }
          return act;
        });

        return {
          ...inc,
          actions: newActions,
          auditLogs: [...(inc.auditLogs || []), {
            timestamp: new Date().toISOString(),
            user: userName,
            action: 'Updated Action',
            details: `Action ${actionId} status/progress updated.`
          }]
        };
      }
      return inc;
    }));
  };

  // Request Corrective Action Extension
  const requestExtension = (incidentId, actionId, extensionDetails, userName) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const newActions = inc.actions.map(act => {
          if (act.id === actionId) {
            const reqs = act.extensionRequests || [];
            return {
              ...act,
              status: 'In progress', // keep in progress
              extensionRequests: [...reqs, {
                id: `ext-${Date.now()}`,
                requestedDate: new Date().toISOString(),
                requestedBy: userName,
                status: 'Pending',
                ...extensionDetails
              }]
            };
          }
          return act;
        });

        return {
          ...inc,
          actions: newActions,
          auditLogs: [...(inc.auditLogs || []), {
            timestamp: new Date().toISOString(),
            user: userName,
            action: 'Requested Action Extension',
            details: `For Action ID: ${actionId}. Due: ${extensionDetails.requestedDueDate}`
          }]
        };
      }
      return inc;
    }));
  };

  // Approve/Reject Extension
  const resolveExtensionRequest = (incidentId, actionId, requestId, isApproved, comments, userName) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const newActions = inc.actions.map(act => {
          if (act.id === actionId) {
            const reqs = act.extensionRequests.map(req => {
              if (req.id === requestId) {
                return { ...req, status: isApproved ? 'Approved' : 'Rejected', approverComments: comments, responseDate: new Date().toISOString() };
              }
              return req;
            });

            // If approved, update action due date
            const targetReq = act.extensionRequests.find(r => r.id === requestId);
            const newDueDate = isApproved && targetReq ? targetReq.requestedDueDate : act.dueDate;

            return { ...act, dueDate: newDueDate, extensionRequests: reqs };
          }
          return act;
        });

        return {
          ...inc,
          actions: newActions,
          auditLogs: [...(inc.auditLogs || []), {
            timestamp: new Date().toISOString(),
            user: userName,
            action: isApproved ? 'Approved Action Extension' : 'Rejected Action Extension',
            details: `Action ID: ${actionId}. Comments: ${comments}`
          }]
        };
      }
      return inc;
    }));
  };

  // Resolve investigation approval stages
  const submitInvestigationApproval = (incidentId, approval, userName) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const newApprovals = [...(inc.approvals || []), {
          id: `ap-${Date.now()}`,
          date: new Date().toISOString(),
          reviewer: userName,
          ...approval
        }];

        let nextStatus = inc.status;
        if (approval.status === 'Approved') {
          // If approved by HSE Manager or Site Manager, advance status
          if (approval.stage === 'HSE Manager' || approval.stage === 'Site Manager') {
            nextStatus = 'Approved & Pending Closure';
          } else {
            nextStatus = 'Investigation Approved';
          }
        } else if (approval.status === 'Returned') {
          nextStatus = 'Investigation';
        }

        return {
          ...inc,
          status: nextStatus,
          approvals: newApprovals,
          auditLogs: [...(inc.auditLogs || []), {
            timestamp: new Date().toISOString(),
            user: userName,
            action: `Investigation Review - ${approval.stage}`,
            details: `${approval.status}: ${approval.comments}`
          }]
        };
      }
      return inc;
    }));
  };

  // Close Incident
  const closeIncident = (incidentId, closureDetails, userName) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        // Validation: Verify all actions are completed
        const hasOpenActions = inc.actions?.some(act => act.status !== 'Completed' && act.status !== 'Verified');
        if (hasOpenActions) {
          alert('Cannot close incident. There are pending corrective actions.');
          return inc;
        }

        return {
          ...inc,
          status: 'Closed',
          closureInfo: {
            closedBy: userName,
            closedDate: new Date().toISOString(),
            ...closureDetails
          },
          lessonsLearned: closureDetails.lessonsLearned ? {
            id: `ll-${Date.now()}`,
            eventSummary: inc.title,
            whatHappened: inc.description,
            whyItHappened: inc.investigation?.fiveWhys?.rootCause || 'Under investigation',
            actionsTaken: inc.actions?.map(a => a.title).join(', ') || 'Corrective action executed.',
            recommendedControls: closureDetails.lessonsLearnedText || 'Follow procedure guidelines.',
            sitesAffected: inc.site,
            communicationAudience: 'Operations and Safety Bulletins',
            confidentialityClass: 'Public Internal'
          } : null,
          auditLogs: [...(inc.auditLogs || []), {
            timestamp: new Date().toISOString(),
            user: userName,
            action: 'Closed Incident',
            details: `Incident marked Closed. Lessons learned documented: ${closureDetails.lessonsLearned}`
          }]
        };
      }
      return inc;
    }));
  };

  // Reopen Incident
  const reopenIncident = (incidentId, reason, userName) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'Investigation',
          auditLogs: [...(inc.auditLogs || []), {
            timestamp: new Date().toISOString(),
            user: userName,
            action: 'Reopened Incident',
            details: `Reason: ${reason}`
          }]
        };
      }
      return inc;
    }));
  };

  // Sync Offline Queue
  const syncOfflineData = () => {
    if (offlinePending.length === 0) return;

    // Simulate batch syncing
    const syncedRecords = offlinePending.map(draft => ({
      ...draft,
      status: 'Pending Review', // promote drafts to submitted
      reportedDate: new Date().toISOString(),
      auditLogs: [
        ...draft.auditLogs,
        {
          timestamp: new Date().toISOString(),
          user: 'System Sync Manager',
          action: 'Synced Offline Report',
          details: 'Data uploaded successfully upon network reconnection.'
        }
      ]
    }));

    setIncidents(prev => [...syncedRecords, ...prev]);
    setOfflinePending([]);

    // Clear sync notifications
    setNotifications(prev => [
      { id: `sync-${Date.now()}`, title: `SUCCESS: Synced ${syncedRecords.length} offline records.`, timestamp: new Date().toISOString(), read: false },
      ...prev
    ]);
  };

  // Toggle Network State
  const toggleNetwork = () => {
    setIsOnline(prev => {
      const nextState = !prev;
      if (nextState) {
        // If switching to online, trigger automatic sync in 1.5 seconds
        setTimeout(() => {
          syncOfflineData();
        }, 1500);
      }
      return nextState;
    });
  };

  // Publish Safety Alert
  const publishSafetyAlert = (incidentId, alertData, userName) => {
    const newAlert = {
      id: `sa-${Date.now()}`,
      incidentId,
      publishedBy: userName,
      publishedDate: new Date().toISOString(),
      ...alertData
    };
    setSafetyAlerts(prev => [newAlert, ...prev]);

    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'Closed & Published',
          auditLogs: [...(inc.auditLogs || []), {
            timestamp: new Date().toISOString(),
            user: userName,
            action: 'Published Safety Alert',
            details: `Lessons learned safety alert published to company feed.`
          }]
        };
      }
      return inc;
    }));
  };

  const deleteIncident = (id) => {
    setIncidents(prev => prev.filter(inc => inc.id !== id));
  };

  const resetDatabase = () => {
    setIncidents(DEFAULT_INCIDENTS);
    localStorage.setItem('hse_incidents_v3', JSON.stringify(DEFAULT_INCIDENTS));
  };

  return (
    <DatabaseContext.Provider value={{
      incidents,
      notifications,
      offlinePending,
      isOnline,
      resetDatabase,
      toggleNetwork,
      sites: MOCK_SITES,
      assets: MOCK_ASSETS,
      addIncident,
      updateIncident,
      deleteIncident,
      addImmediateAction,
      verifyImmediateAction,
      initializeInvestigation,
      updateInvestigationDetails,
      addCorrectiveAction,
      updateActionStatus,
      requestExtension,
      resolveExtensionRequest,
      submitInvestigationApproval,
      closeIncident,
      reopenIncident,
      setNotifications,
      syncOfflineData,
      safetyAlerts,
      publishSafetyAlert
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
