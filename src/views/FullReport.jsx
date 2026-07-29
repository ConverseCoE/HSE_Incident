import React, { useState } from 'react';
import { useDatabase, calculateRisk } from '../context/DatabaseContext';
import { useUser } from '../context/UserContext';
import { ChevronLeft, ChevronRight, Save, Clipboard, MapPin, Users, Activity, Eye, ShieldCheck, Sun, ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="custom-select-container" style={{ position: 'relative', width: '100%' }}>
      <div 
        className="form-select" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundImage: 'none',
          paddingRight: '14px'
        }}
      >
        <span>{selectedOption?.label || selectedOption?.value}</span>
        <ChevronDown size={16} style={{ 
          color: 'var(--text-secondary)',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s ease',
          flexShrink: 0
        }} />
      </div>
      
      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setIsOpen(false)} />
          
          <div className="glass-panel" style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 999,
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
            overflow: 'hidden',
            maxHeight: '220px',
            overflowY: 'auto',
            padding: 0
          }}>
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  fontSize: '0.88rem',
                  color: opt.value === value ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  background: opt.value === value ? 'rgba(18, 78, 70, 0.05)' : 'transparent',
                  fontWeight: opt.value === value ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderLeft: opt.value === value ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (opt.value !== value) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (opt.value !== value) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {opt.label || opt.value}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const FullReport = ({ onCancel, onSaveSuccess, initialCategory = 'Safety Incident' }) => {
  const { sites, assets, addIncident } = useDatabase();
  const { currentUser } = useUser();

  const [step, setStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(initialCategory === 'Incident' ? 'Safety Incident' : initialCategory);
  const [subcategory, setSubcategory] = useState('Personal Injury');
  const [incidentType, setIncidentType] = useState('Incident');

  // Location & Asset
  const [site, setSite] = useState(sites[0]?.id || '');
  const [siteArea, setSiteArea] = useState('');
  const [asset, setAsset] = useState('');
  const [assetType, setAssetType] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [weatherConditions, setWeatherConditions] = useState('Overcast');

  // Personnel Involved
  const [involvedPerson, setInvolvedPerson] = useState('');
  const [employer, setEmployer] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [injuryStatus, setInjuryStatus] = useState('None');
  const [bodyPart, setBodyPart] = useState('None');
  const [injuryType, setInjuryType] = useState('None');
  const [treatmentProvided, setTreatmentProvided] = useState('');
  const [lostWorkTime, setLostWorkTime] = useState('0');

  // Classifications & Risk
  const [potentialConsequence, setPotentialConsequence] = useState('2');
  const [likelihood, setLikelihood] = useState('2');
  const [actualConsequence, setActualConsequence] = useState('2');
  
  const [regulatoryReportable, setRegulatoryReportable] = useState(false);
  const [lostTimeIncident, setLostTimeIncident] = useState(false);
  const [medicalTreatment, setMedicalTreatment] = useState(false);
  const [environmentalImpact, setEnvironmentalImpact] = useState(false);
  const [assetDamage, setAssetDamage] = useState(false);

  // Immediate Action
  const [immediateActionDesc, setImmediateActionDesc] = useState('');

  // Renewable Energy Scenarios
  const [renewableScenario, setRenewableScenario] = useState('None');
  
  // Height Specifics
  const [heightOfWork, setHeightOfWork] = useState('');
  const [accessMethod, setAccessMethod] = useState('');
  const [fallArrestEquipment, setFallArrestEquipment] = useState('');
  const [harnessInspectionStatus, setHarnessInspectionStatus] = useState('Valid');
  const [rescuePlanAvailable, setRescuePlanAvailable] = useState(false);
  const [droppedObjectInvolved, setDroppedObjectInvolved] = useState(false);
  const [windSpeed, setWindSpeed] = useState('');

  // Offshore Specifics
  const [vesselName, setVesselName] = useState('');
  const [waveHeight, setWaveHeight] = useState('');
  const [seaStateClass, setSeaStateClass] = useState('Moderate');
  const [accessSuspended, setAccessSuspended] = useState(false);

  // Battery Specifics
  const [batteryTemp, setBatteryTemp] = useState('');
  const [smokeDetected, setSmokeDetected] = useState(false);
  const [suppressionActivated, setSuppressionActivated] = useState(false);
  const [thermalRunawaySuspected, setThermalRunawaySuspected] = useState(false);

  // Oil Specifics
  const [oilQty, setOilQty] = useState('');
  const [oilType, setOilType] = useState('');
  const [containmentStatus, setContainmentStatus] = useState('None');

  // Wildlife Specifics
  const [species, setSpecies] = useState('');
  const [carcassHandling, setCarcassHandling] = useState('');

  // Electrical Specifics
  const [voltageLevel, setVoltageLevel] = useState('');
  const [isolationStatus, setIsolationStatus] = useState('No');
  const [lockoutApplied, setLockoutApplied] = useState(false);
  const [arcFlashInvolved, setArcFlashInvolved] = useState(false);

  // Weather Evac specifics
  const [evacReason, setEvacReason] = useState('Lightning Proximity');
  const [peopleEvacuated, setPeopleEvacuated] = useState('');

  // Confined Space specifics
  const [confinedOxygenLevel, setConfinedOxygenLevel] = useState('');
  const [confinedGasDetectorCalibrated, setConfinedGasDetectorCalibrated] = useState(false);
  const [confinedStandbyPerson, setConfinedStandbyPerson] = useState('');
  const [confinedPermitId, setConfinedPermitId] = useState('');

  // Heavy Lifting specifics
  const [liftingCraneModel, setLiftingCraneModel] = useState('');
  const [liftingWindSpeed, setLiftingWindSpeed] = useState('');
  const [liftingRiggingInspected, setLiftingRiggingInspected] = useState(false);
  const [liftingPlanApproved, setLiftingPlanApproved] = useState(false);

  // Subsea Dive specifics
  const [subseaDiveSupervisor, setSubseaDiveSupervisor] = useState('');
  const [subseaDecompressionChamber, setSubseaDecompressionChamber] = useState(false);
  const [subseaRovUsed, setSubseaRovUsed] = useState(false);
  const [subseaWaterDepth, setSubseaWaterDepth] = useState('');

  // Risk Rating Calculation
  const riskResult = calculateRisk(potentialConsequence, likelihood);

  const availableAssets = assets[site] || [];

  const handleNext = () => setStep(prev => Math.min(prev + 1, 6));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSave = (isDraft = false) => {
    if (!title || !description || !site) {
      alert('Please fill out Title, Description, and Site fields.');
      return;
    }

    const payload = {
      title,
      description,
      category,
      subcategory,
      incidentType,
      site,
      siteArea,
      asset,
      assetType,
      gpsCoordinates,
      locationDescription,
      weatherConditions,
      reportedBy: currentUser.name,
      reporterOrganisation: currentUser.employer,
      reporterType: currentUser.role.includes('Contractor') ? 'Contractor' : 'Employee',
      
      // Personnel
      involvedPerson,
      employer,
      jobTitle,
      injuryStatus,
      bodyPart,
      injuryType,
      treatmentProvided,
      lostWorkTime,

      // Classifications
      potentialConsequence,
      likelihood,
      actualConsequence,
      regulatoryReportable,
      lostTimeIncident,
      medicalTreatment,
      environmentalImpact,
      assetDamage,

      // Renewable Scenario Details
      renewableScenario,
      heightOfWork,
      accessMethod,
      fallArrestEquipment,
      harnessInspectionStatus,
      rescuePlanAvailable,
      droppedObjectInvolved,
      windSpeed,
      vesselName,
      waveHeight,
      seaStateClass,
      accessSuspended,
      batteryTemp,
      smokeDetected,
      suppressionActivated,
      thermalRunawaySuspected,
      oilQty,
      oilType,
      containmentStatus,
      species,
      carcassHandling,
      voltageLevel,
      isolationStatus,
      lockoutApplied,
      arcFlashInvolved,
      evacReason,
      peopleEvacuated,
      confinedOxygenLevel,
      confinedGasDetectorCalibrated,
      confinedStandbyPerson,
      confinedPermitId,
      liftingCraneModel,
      liftingWindSpeed,
      liftingRiggingInspected,
      liftingPlanApproved,
      subseaDiveSupervisor,
      subseaDecompressionChamber,
      subseaRovUsed,
      subseaWaterDepth,

      immediateActions: immediateActionDesc ? [{
        id: `ia-${Date.now()}`,
        description: immediateActionDesc,
        owner: currentUser.name,
        dateTime: new Date().toISOString(),
        status: 'Completed',
        verification: 'Self-verified upon report creation'
      }] : []
    };

    addIncident(payload, isDraft);
    onSaveSuccess();
  };

  return (
    <div className="glass-panel" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 118px)', 
      minHeight: '620px',
      width: '100%', 
      margin: '0', 
      overflow: 'hidden', 
      background: 'var(--bg-panel)', 
      border: 'none', 
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.03), 0 10px 20px -5px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.02)'
    }}>
      
      {/* Main Body Layout Grid */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        
        {/* Left Sidebar Steps Timeline */}
        <div style={{ 
          width: '280px', 
          backgroundColor: '#f8fafc', // soft cool slate background
          borderRight: '1px solid var(--border-color)', 
          padding: '32px 24px',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px',
          position: 'relative',
          flexShrink: 0
        }}>
          {/* Vertical Connecting Line */}
          <div style={{
            position: 'absolute',
            left: '40px',
            top: '48px',
            bottom: '48px',
            width: '2px',
            background: 'var(--border-color)',
            zIndex: 1
          }}>
            {/* Active progress indicator line */}
            <div style={{
              width: '100%',
              height: `${((step - 1) / 5) * 100}%`,
              background: 'var(--accent-cyan)',
              transition: 'height 0.3s ease'
            }}></div>
          </div>

          {[
            { icon: Clipboard, label: 'General Info', desc: 'Category, title, description' },
            { icon: MapPin, label: 'Location & Assets', desc: 'Site area, asset details, GPS' },
            { icon: Users, label: 'Personnel Involved', desc: 'Involved worker details' },
            { icon: Activity, label: 'Classify & Risk', desc: 'Consequence, rating, flags' },
            { icon: Sun, label: 'Renewable Scenario', desc: 'Scenario specific parameters' },
            { icon: ShieldCheck, label: 'Review & Submit', desc: 'Final check and validation' }
          ].map((item, idx) => {
            const Icon = item.icon;
            const active = step >= idx + 1;
            const current = step === idx + 1;
            
            let circleBg = 'var(--bg-panel)';
            let circleBorder = '1px solid var(--border-color)';
            let circleColor = 'var(--text-muted)';
            let titleColor = 'var(--text-muted)';
            let descColor = 'var(--text-muted)';
            let glow = 'none';

            if (current) {
              circleBg = 'var(--bg-app)';
              circleBorder = '2px solid var(--accent-cyan)';
              circleColor = 'var(--accent-cyan)';
              titleColor = 'var(--text-primary)';
              descColor = 'var(--text-secondary)';
              glow = 'var(--glow-cyan)';
            } else if (active) {
              circleBg = 'var(--accent-cyan)';
              circleBorder = '1px solid var(--accent-cyan)';
              circleColor = '#ffffff';
              titleColor = 'var(--text-primary)';
              descColor = 'var(--text-muted)';
            }

            return (
              <div 
                key={idx} 
                style={{ display: 'flex', gap: '16px', zIndex: 2, position: 'relative', cursor: 'pointer' }}
                onClick={() => setStep(idx + 1)}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: circleBg,
                  border: circleBorder,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: circleColor,
                  transition: 'all 0.3s ease',
                  boxShadow: glow,
                  flexShrink: 0
                }}>
                  <Icon size={15} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ 
                    fontSize: '0.82rem', 
                    fontWeight: current ? 600 : 500, 
                    color: titleColor,
                    fontFamily: 'var(--font-title)'
                  }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: descColor, marginTop: '2px' }}>
                    {item.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Pane Scrollable Form Content */}
        <div style={{ 
          flex: 1, 
          padding: '40px', 
          overflowY: 'auto',
          backgroundColor: '#ffffff'
        }}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="form-step-content animate-fade">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', fontFamily: 'var(--font-title)' }}>
                General Information
              </h3>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Report Category *</label>
                  <CustomSelect 
                    value={category} 
                    onChange={setCategory} 
                    options={[
                      { value: 'Safety Incident', label: 'Safety Incident' },
                      { value: 'Near Miss', label: 'Near Miss' },
                      { value: 'Environmental Event', label: 'Environmental Event' },
                      { value: 'Other HSE', label: 'Other HSE' }
                    ]}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subcategory</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g., Laceration, Chemical Spill, Dropped Tool"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Incident Title / Summary *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Provide a clear, brief title of the incident"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description *</label>
                <textarea 
                  className="form-textarea" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="State exactly what occurred, who was performing the action, permit references, and immediate consequences..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Immediate Containment Action (What did you do right after?)</label>
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: '80px' }}
                  value={immediateActionDesc}
                  onChange={(e) => setImmediateActionDesc(e.target.value)}
                  placeholder="e.g., Isolated energy source, deployed spill pads, escorted injured to clinic..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Location & Assets */}
          {step === 2 && (
            <div className="form-step-content animate-fade">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', fontFamily: 'var(--font-title)' }}>
                Location & Asset Details
              </h3>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Facility / Renewable Site *</label>
                  <CustomSelect 
                    value={site} 
                    onChange={(val) => { setSite(val); setAsset(''); }} 
                    options={sites.map(s => ({ value: s.id, label: `${s.name} (${s.id})` }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Area / Location details</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={siteArea}
                    onChange={(e) => setSiteArea(e.target.value)}
                    placeholder="e.g., Turbine Nacelle, Transformer Yard, BESS Bins"
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Associated Asset</label>
                  <CustomSelect 
                    value={asset} 
                    onChange={(val) => {
                      const selected = availableAssets.find(a => a.id === val);
                      setAsset(val);
                      setAssetType(selected ? selected.type : '');
                    }} 
                    options={[
                      { value: '', label: '-- None / General Location --' },
                      ...availableAssets.map(a => ({ value: a.id, label: `${a.name} (${a.id})` }))
                    ]}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Asset Type</label>
                  <input type="text" className="form-control" value={assetType} readOnly placeholder="Auto-populated from Asset" />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">GPS Coordinates</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={gpsCoordinates}
                    onChange={(e) => setGpsCoordinates(e.target.value)}
                    placeholder="e.g., 55.4743° N, 8.4474° E"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Weather Conditions</label>
                  <select className="form-select" value={weatherConditions} onChange={(e) => setWeatherConditions(e.target.value)}>
                    <option value="Clear">Clear / Sunny</option>
                    <option value="Overcast">Overcast / Cloud</option>
                    <option value="Rain">Rainy</option>
                    <option value="Windy">Extreme Wind</option>
                    <option value="Snow/Ice">Ice / Snow</option>
                    <option value="Fog">Fog / Low Visibility</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location Description</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={locationDescription}
                  onChange={(e) => setLocationDescription(e.target.value)}
                  placeholder="Additional details on access or ground conditions..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Personnel Involved */}
          {step === 3 && (
            <div className="form-step-content animate-fade">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', fontFamily: 'var(--font-title)' }}>
                Personnel Involved
              </h3>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Person Involved Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={involvedPerson} 
                    onChange={(e) => setInvolvedPerson(e.target.value)}
                    placeholder="Name of worker" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Employer / Contractor Company</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={employer} 
                    onChange={(e) => setEmployer(e.target.value)}
                    placeholder="e.g., EcoPower, Apex Logistics" 
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={jobTitle} 
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Turbine Engineer, Rope Specialist" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Injury Severity Category</label>
                  <CustomSelect 
                    value={injuryStatus} 
                    onChange={setInjuryStatus} 
                    options={[
                      { value: 'None', label: 'No Injury / Near Miss' },
                      { value: 'First Aid', label: 'First Aid Treatment' },
                      { value: 'Medical Treatment', label: 'Medical Treatment Case' },
                      { value: 'Restricted Work', label: 'Restricted Work Day Case' },
                      { value: 'Lost Time', label: 'Lost Time Injury (LTI)' },
                      { value: 'Fatality', label: 'Fatality Case' }
                    ]}
                  />
                </div>
              </div>

              {injuryStatus !== 'None' && (
                <div className="grid-cols-3 animate-fade">
                  <div className="form-group">
                    <label className="form-label">Body Part Affected</label>
                    <select className="form-select" value={bodyPart} onChange={(e) => setBodyPart(e.target.value)}>
                      <option value="Head/Face">Head / Face</option>
                      <option value="Eyes">Eyes</option>
                      <option value="Hands/Fingers">Hands / Fingers</option>
                      <option value="Arms/Shoulders">Arms / Shoulders</option>
                      <option value="Back/Spine">Back / Spine</option>
                      <option value="Legs/Feet">Legs / Feet</option>
                      <option value="Multiple">Multiple parts</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Injury Type</label>
                    <select className="form-select" value={injuryType} onChange={(e) => setInjuryType(e.target.value)}>
                      <option value="Cut/Laceration">Cut / Laceration</option>
                      <option value="Strain/Sprain">Strain / Sprain</option>
                      <option value="Fracture">Fracture</option>
                      <option value="Electric Shock">Electric Shock</option>
                      <option value="Thermal Burn">Thermal Burn</option>
                      <option value="Chemical Burn">Chemical Burn</option>
                      <option value="Contusion">Contusion / Bruising</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lost Work Days Estimate</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={lostWorkTime} 
                      onChange={(e) => setLostWorkTime(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Treatment Description / Clinical Referral details</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={treatmentProvided} 
                  onChange={(e) => setTreatmentProvided(e.target.value)}
                  placeholder="e.g., Washed wound and applied sterile bandage. Transported to hospital." 
                />
              </div>
            </div>
          )}

          {/* Step 4: Classifications & Risk Calculation */}
          {step === 4 && (
            <div className="form-step-content animate-fade">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', fontFamily: 'var(--font-title)' }}>
                Classifications & Consequence
              </h3>
              <div className="grid-cols-2">
                <div>
                  <h3 className="form-label" style={{ marginBottom: '14px' }}>Risk Rating Matrix Indicator</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Potential Consequence Severity (1 - 5)</label>
                    <CustomSelect 
                      value={potentialConsequence} 
                      onChange={setPotentialConsequence} 
                      options={[
                        { value: '1', label: '1 - Insignificant' },
                        { value: '2', label: '2 - Minor' },
                        { value: '3', label: '3 - Moderate' },
                        { value: '4', label: '4 - Major' },
                        { value: '5', label: '5 - Critical' }
                      ]}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Likelihood of Recurrence (1 - 5)</label>
                    <CustomSelect 
                      value={likelihood} 
                      onChange={setLikelihood} 
                      options={[
                        { value: '1', label: '1 - Rare' },
                        { value: '2', label: '2 - Unlikely' },
                        { value: '3', label: '3 - Possible' },
                        { value: '4', label: '4 - Likely' },
                        { value: '5', label: '5 - Almost Certain' }
                      ]}
                    />
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Calculated Risk:</span>
                    <div className={`badge ${riskResult.class} risk-cell`} style={{ marginTop: '6px', padding: '8px 16px', fontSize: '0.9rem', width: '100%', textAlign: 'center', justifyContent: 'center' }}>
                      {riskResult.rating} (Score: {riskResult.score})
                    </div>
                  </div>
                </div>

                {/* Checklist options */}
                <div style={{ background: 'var(--bg-panel-solid)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span className="form-label" style={{ display: 'block', marginBottom: '14px' }}>HSE Incident Flags</span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                      <input type="checkbox" checked={regulatoryReportable} onChange={(e) => setRegulatoryReportable(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                      Regulatory Reportable Indicator
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                      <input type="checkbox" checked={lostTimeIncident} onChange={(e) => setLostTimeIncident(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                      Lost Time Incident (LTI) Flag
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                      <input type="checkbox" checked={medicalTreatment} onChange={(e) => setMedicalTreatment(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                      Medical Treatment Flag
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                      <input type="checkbox" checked={environmentalImpact} onChange={(e) => setEnvironmentalImpact(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                      Environmental Impact Flag
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                      <input type="checkbox" checked={assetDamage} onChange={(e) => setAssetDamage(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                      Asset or Property Damage Flag
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Renewable Scenario Adaptations */}
          {step === 5 && (
            <div className="form-step-content animate-fade">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', fontFamily: 'var(--font-title)' }}>
                Renewable Energy Scenario
              </h3>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Select Renewable Scenario Type</label>
                <CustomSelect 
                  value={renewableScenario} 
                  onChange={setRenewableScenario} 
                  options={[
                    { value: 'None', label: 'None / General HSE Incident' },
                    { value: 'Working-at-Height', label: 'Working at Height Incident' },
                    { value: 'Offshore Access', label: 'Offshore Vessel Access Issue' },
                    { value: 'Battery Thermal Event', label: 'BESS Battery Thermal Event' },
                    { value: 'Oil Leakage', label: 'Dielectric / Lubricant Oil Leak' },
                    { value: 'Bird or Wildlife Incident', label: 'Bird / Protected Wildlife strike' },
                    { value: 'Electrical Safety Incident', label: 'Electrical Switching & Isolation (LOTO)' },
                    { value: 'Weather-Related Site Evacuation', label: 'Extreme Weather Site Evacuation' },
                    { value: 'Confined Space Entry', label: 'Confined Space Entry Incident' },
                    { value: 'Heavy Lifting', label: 'Heavy Lifting & Crane Operations' },
                    { value: 'Subsea Dive', label: 'Subsea Cable & Dive Operations' }
                  ]}
                />
              </div>

              {/* Working-at-Height */}
              {renewableScenario === 'Working-at-Height' && (
                <div className="grid-cols-2 animate-fade">
                  <div className="form-group"><label className="form-label">Height of work (meters)</label><input type="text" className="form-control" value={heightOfWork} onChange={(e) => setHeightOfWork(e.target.value)} placeholder="e.g. 70m" /></div>
                  <div className="form-group"><label className="form-label">Access Method</label><input type="text" className="form-control" value={accessMethod} onChange={(e) => setAccessMethod(e.target.value)} placeholder="e.g. Internal Ladder, Rope Access" /></div>
                  <div className="form-group"><label className="form-label">Fall Arrest Equipment Used</label><input type="text" className="form-control" value={fallArrestEquipment} onChange={(e) => setFallArrestEquipment(e.target.value)} placeholder="e.g. Petzl harness, twin lanyard" /></div>
                  <div className="form-group"><label className="form-label">Harness Inspection Valid?</label>
                    <select className="form-select" value={harnessInspectionStatus} onChange={(e) => setHarnessInspectionStatus(e.target.value)}>
                      <option value="Valid">Yes, inspected within 6 months</option>
                      <option value="Invalid">No/Expired</option>
                      <option value="Not Inspected">Unknown</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={rescuePlanAvailable} onChange={(e) => setRescuePlanAvailable(e.target.checked)} style={{ width: '16px', height: '16px' }} /> Anchor Point and Rescue Plan Available?
                    </label>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={droppedObjectInvolved} onChange={(e) => setDroppedObjectInvolved(e.target.checked)} style={{ width: '16px', height: '16px' }} /> Did this involve a Dropped Object?
                    </label>
                  </div>
                </div>
              )}

              {/* Offshore Access */}
              {renewableScenario === 'Offshore Access' && (
                <div className="grid-cols-2 animate-fade">
                  <div className="form-group"><label className="form-label">Crew Transfer Vessel (CTV) Name</label><input type="text" className="form-control" value={vesselName} onChange={(e) => setVesselName(e.target.value)} placeholder="e.g. Windcat 42" /></div>
                  <div className="form-group"><label className="form-label">Wave Height (Swell) in meters</label><input type="text" className="form-control" value={waveHeight} onChange={(e) => setWaveHeight(e.target.value)} placeholder="e.g. 2.2m" /></div>
                  <div className="form-group"><label className="form-label">Sea State Classification</label>
                    <select className="form-select" value={seaStateClass} onChange={(e) => setSeaStateClass(e.target.value)}>
                      <option value="Calm">Sea State 1-2 (Calm)</option>
                      <option value="Moderate">Sea State 3-4 (Moderate)</option>
                      <option value="Rough">Sea State 5+ (Rough)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={accessSuspended} onChange={(e) => setAccessSuspended(e.target.checked)} style={{ width: '16px', height: '16px' }} /> Access suspended to turbine?
                    </label>
                  </div>
                </div>
              )}

              {/* Battery Thermal Event */}
              {renewableScenario === 'Battery Thermal Event' && (
                <div className="grid-cols-2 animate-fade">
                  <div className="form-group"><label className="form-label">Battery Compartment Temp (°C)</label><input type="text" className="form-control" value={batteryTemp} onChange={(e) => setBatteryTemp(e.target.value)} placeholder="e.g. 115" /></div>
                  <div className="form-group" style={{ marginTop: '24px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={smokeDetected} onChange={(e) => setSmokeDetected(e.target.checked)} style={{ width: '16px', height: '16px' }} /> Smoke or gas detected?</label></div>
                  <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={suppressionActivated} onChange={(e) => setSuppressionActivated(e.target.checked)} style={{ width: '16px', height: '16px' }} /> Fire suppression system activated?</label></div>
                  <div className="form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={thermalRunawaySuspected} onChange={(e) => setThermalRunawaySuspected(e.target.checked)} style={{ width: '16px', height: '16px' }} /> Suspect active Thermal Runaway?</label></div>
                </div>
              )}

              {/* Oil Leakage */}
              {renewableScenario === 'Oil Leakage' && (
                <div className="grid-cols-2 animate-fade">
                  <div className="form-group"><label className="form-label">Lubricant/Fluid Type</label><input type="text" className="form-control" value={oilType} onChange={(e) => setOilType(e.target.value)} placeholder="e.g. Bio-Ester fluid, gear oil" /></div>
                  <div className="form-group"><label className="form-label">Estimated Leak Quantity (Gallons/Liters)</label><input type="text" className="form-control" value={oilQty} onChange={(e) => setOilQty(e.target.value)} placeholder="e.g. 100 Gallons" /></div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Containment and Spill Kits Deployed?</label>
                    <select className="form-select" value={containmentStatus} onChange={(e) => setContainmentStatus(e.target.value)}>
                      <option value="None">None deployed</option>
                      <option value="Attempted">Spill pads laid (spill spreading)</option>
                      <option value="Contained">Contained locally in bund/drip trays</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Bird/Wildlife */}
              {renewableScenario === 'Bird or Wildlife Incident' && (
                <div className="grid-cols-2 animate-fade">
                  <div className="form-group"><label className="form-label">Bird / Wildlife Species</label><input type="text" className="form-control" value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="e.g. Golden Eagle, Sea Gull" /></div>
                  <div className="form-group"><label className="form-label">Carcass Handling / Veterinary details</label><input type="text" className="form-control" value={carcassHandling} onChange={(e) => setCarcassHandling(e.target.value)} placeholder="e.g. Kept in cold store, bagged for agency" /></div>
                </div>
              )}

              {/* Electrical Safety */}
              {renewableScenario === 'Electrical Safety Incident' && (
                <div className="grid-cols-2 animate-fade">
                  <div className="form-group"><label className="form-label">Voltage Level (kV)</label><input type="text" className="form-control" value={voltageLevel} onChange={(e) => setVoltageLevel(e.target.value)} placeholder="e.g. 33kV" /></div>
                  <div className="form-group">
                    <label className="form-label">Was Isolation Performed?</label>
                    <select className="form-select" value={isolationStatus} onChange={(e) => setIsolationStatus(e.target.value)}>
                      <option value="No">No isolation</option>
                      <option value="Yes">Yes, isolate only</option>
                      <option value="Verified">Yes, isolated and verified dead</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginTop: '24px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={lockoutApplied} onChange={(e) => setLockoutApplied(e.target.checked)} style={{ width: '16px', height: '16px' }} /> Lockout/Tagout (LOTO) locks applied?</label></div>
                  <div className="form-group" style={{ marginTop: '24px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={arcFlashInvolved} onChange={(e) => setArcFlashInvolved(e.target.checked)} style={{ width: '16px', height: '16px' }} /> Arc flash event involved?</label></div>
                </div>
              )}

              {/* Weather Evacuation */}
              {renewableScenario === 'Weather-Related Site Evacuation' && (
                <div className="grid-cols-2 animate-fade">
                  <div className="form-group">
                    <label className="form-label">Evacuation Reason</label>
                    <select className="form-select" value={evacReason} onChange={(e) => setEvacReason(e.target.value)}>
                      <option value="Lightning Proximity">Lightning Proximity (&lt; 10km)</option>
                      <option value="High Winds">Wind speed exceeding turbine cut-off</option>
                      <option value="Offshore Storm">Offshore sea conditions storm swell</option>
                      <option value="Extreme Heat">Extreme temperatures (&gt; 42°C)</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Headcount of People Evacuated</label><input type="number" className="form-control" value={peopleEvacuated} onChange={(e) => setPeopleEvacuated(e.target.value)} min="1" /></div>
                </div>
              )}

              {/* Confined Space Entry */}
              {renewableScenario === 'Confined Space Entry' && (
                <div className="grid-cols-2 animate-fade">
                  <div className="form-group">
                    <label className="form-label">Confined Space Permit ID</label>
                    <input type="text" className="form-control" value={confinedPermitId} onChange={(e) => setConfinedPermitId(e.target.value)} placeholder="e.g. CSP-2026-0041" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Oxygen Level (%)</label>
                    <input type="text" className="form-control" value={confinedOxygenLevel} onChange={(e) => setConfinedOxygenLevel(e.target.value)} placeholder="e.g. 20.9%" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Standby / Safety Watch Person</label>
                    <input type="text" className="form-control" value={confinedStandbyPerson} onChange={(e) => setConfinedStandbyPerson(e.target.value)} placeholder="Name of standby watcher" />
                  </div>
                  <div className="form-group" style={{ marginTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={confinedGasDetectorCalibrated} onChange={(e) => setConfinedGasDetectorCalibrated(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                      Gas detector calibrated and verified?
                    </label>
                  </div>
                </div>
              )}

              {/* Heavy Lifting & Crane Operations */}
              {renewableScenario === 'Heavy Lifting' && (
                <div className="grid-cols-2 animate-fade">
                  <div className="form-group">
                    <label className="form-label">Crane Model / Equipment ID</label>
                    <input type="text" className="form-control" value={liftingCraneModel} onChange={(e) => setLiftingCraneModel(e.target.value)} placeholder="e.g. Liebherr LTM 1500" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Wind Speed at Boom Height</label>
                    <input type="text" className="form-control" value={liftingWindSpeed} onChange={(e) => setLiftingWindSpeed(e.target.value)} placeholder="e.g. 9.5 m/s" />
                  </div>
                  <div className="form-group" style={{ marginTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={liftingRiggingInspected} onChange={(e) => setLiftingRiggingInspected(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                      Rigging and tackle pre-use inspected?
                    </label>
                  </div>
                  <div className="form-group" style={{ marginTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={liftingPlanApproved} onChange={(e) => setLiftingPlanApproved(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                      Critical Lift Plan reviewed and signed?
                    </label>
                  </div>
                </div>
              )}

              {/* Subsea Cable & Dive Operations */}
              {renewableScenario === 'Subsea Dive' && (
                <div className="grid-cols-2 animate-fade">
                  <div className="form-group">
                    <label className="form-label">Dive Supervisor Name</label>
                    <input type="text" className="form-control" value={subseaDiveSupervisor} onChange={(e) => setSubseaDiveSupervisor(e.target.value)} placeholder="e.g. Capt. Douglas Vance" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Water Depth (meters)</label>
                    <input type="text" className="form-control" value={subseaWaterDepth} onChange={(e) => setSubseaWaterDepth(e.target.value)} placeholder="e.g. 45m" />
                  </div>
                  <div className="form-group" style={{ marginTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={subseaDecompressionChamber} onChange={(e) => setSubseaDecompressionChamber(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                      Decompression chamber available on site?
                    </label>
                  </div>
                  <div className="form-group" style={{ marginTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={subseaRovUsed} onChange={(e) => setSubseaRovUsed(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                      ROV support active?
                    </label>
                  </div>
                </div>
              )}

              {renewableScenario === 'None' && (
                <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                  No specialized scenario parameters needed. General template is applied.
                </div>
              )}
            </div>
          )}

          {/* Step 6: Review & Submit */}
          {step === 6 && (
            <div className="form-step-content animate-fade">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', fontFamily: 'var(--font-title)' }}>
                Review & Submit
              </h3>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '24px', 
                background: 'var(--bg-panel-solid)', 
                border: '1px solid var(--border-color)',
                padding: '20px', 
                borderRadius: '8px', 
                fontSize: '0.88rem' 
              }}>
                <div>
                  <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--text-secondary)' }}>Title:</strong> {title || <span style={{ color: 'var(--accent-red)' }}>Missing Title</span>}</p>
                  <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--text-secondary)' }}>Category:</strong> {category}</p>
                  <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--text-secondary)' }}>Site Location:</strong> {site} - {siteArea || 'General area'}</p>
                  <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--text-secondary)' }}>Associated Asset:</strong> {asset || 'No Asset'}</p>
                </div>
                <div>
                  <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--text-secondary)' }}>Involved Person:</strong> {involvedPerson || 'None'}</p>
                  <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--text-secondary)' }}>Calculated Risk:</strong> <span className={`badge ${riskResult.class}`}>{riskResult.rating}</span></p>
                  <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--text-secondary)' }}>Scenario Profile:</strong> {renewableScenario}</p>
                  <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--text-secondary)' }}>Reported By:</strong> {currentUser.name}</p>
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <p><strong style={{ color: 'var(--text-secondary)' }}>Description:</strong></p>
                  <p className="text-muted" style={{ fontStyle: 'italic', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{description || <span style={{ color: 'var(--accent-red)' }}>Missing Description</span>}</p>
                </div>
              </div>

              <div style={{ marginTop: '24px', padding: '12px 16px', background: 'rgba(6,182,212,0.04)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.1)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'block' }}>Workflow Action upon Submit:</span>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  The record status will advance to **Supervisor Review**. Critical alarms ({riskResult.rating === 'Critical' ? 'YES' : 'NO'}) will dispatch automated Teams/SMS notifications to Senior management, operations directors, and legal compliance teams.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Footer Navigation Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '16px 32px', 
        borderTop: '1px solid var(--border-color)', 
        background: '#ffffff',
        zIndex: 10
      }}>
        {/* Left Actions: Cancel & Save Draft */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={onCancel} 
            className="btn btn-secondary" 
            style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}
          >
            Cancel
          </button>
          <button 
            onClick={() => handleSave(true)} 
            className="btn btn-secondary" 
            style={{ fontSize: '0.85rem' }}
          >
            <Save size={14} /> Save Draft
          </button>
        </div>

        {/* Right Actions: Back & Next/Submit */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleBack} 
            disabled={step === 1}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: step === 1 ? 0.3 : 1, pointerEvents: step === 1 ? 'none' : 'auto' }}
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < 6 ? (
            <button 
              onClick={handleNext} 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button 
              onClick={() => handleSave(false)} 
              disabled={!title || !description}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--accent-green)', color: 'white', border: 'none' }}
            >
              Submit Incident Report
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default FullReport;
