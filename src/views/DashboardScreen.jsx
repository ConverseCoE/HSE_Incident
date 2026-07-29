import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { ShieldAlert, Users, TrendingUp, BarChart2, AlertTriangle } from 'lucide-react';

const COLORS = ['#06b6d4', '#fbbf24', '#a855f7', '#f43f5e', '#10b981'];

const DashboardScreen = () => {
  const { incidents, sites } = useDatabase();

  const totalHoursWorked = 480000; // Mock organization total exposure hours

  // Calculations
  const recordableCount = incidents.filter(i => 
    i.medicalTreatment || i.lostTimeIncident || i.injuryStatus === 'Medical Treatment' || i.injuryStatus === 'Lost Time'
  ).length;

  const ltiCount = incidents.filter(i => i.lostTimeIncident || i.injuryStatus === 'Lost Time').length;
  const environmentalCount = incidents.filter(i => i.category === 'Environmental Event').length;
  const nearMissCount = incidents.filter(i => i.category === 'Near Miss').length;
  const hipoCount = incidents.filter(i => i.riskRating === 'Critical' || i.riskRating === 'Major').length;

  // TRIR = (Recordable Incidents * 200,000) / Hours
  const trir = ((recordableCount * 200000) / totalHoursWorked).toFixed(2);
  
  // LTIFR = (LTIs * 1,000,000) / Hours
  const ltifr = ((ltiCount * 1000000) / totalHoursWorked).toFixed(2);

  // 1. Category Distribution data
  const categories = ['Safety Incident', 'Near Miss', 'Environmental Event', 'Other HSE'];
  const categoryData = categories.map(cat => ({
    name: cat,
    value: incidents.filter(i => i.category === cat).length
  })).filter(item => item.value > 0);

  // 2. Site Comparison data
  const siteData = sites.map(site => ({
    name: site.id,
    'Incidents': incidents.filter(i => i.site === site.id && i.category !== 'Near Miss').length,
    'Near Misses': incidents.filter(i => i.site === site.id && i.category === 'Near Miss').length
  }));

  // 3. Monthly Trends data
  // We mock months since incidents occurred in July 2026, let's distribute them by month
  const monthlyData = [
    { name: 'Jan', 'Incidents': 1, 'Near Misses': 3 },
    { name: 'Feb', 'Incidents': 2, 'Near Misses': 4 },
    { name: 'Mar', 'Incidents': 0, 'Near Misses': 5 },
    { name: 'Apr', 'Incidents': 3, 'Near Misses': 2 },
    { name: 'May', 'Incidents': 1, 'Near Misses': 4 },
    { name: 'Jun', 'Incidents': 4, 'Near Misses': 6 },
    { name: 'Jul', 'Incidents': recordableCount + ltiCount, 'Near Misses': nearMissCount }
  ];

  // 4. Contractor vs Employee comparison
  const contractorCount = incidents.filter(i => i.reporterType === 'Contractor').length;
  const employeeCount = incidents.filter(i => i.reporterType === 'Employee').length;
  const reporterData = [
    { name: 'Contractors', value: contractorCount },
    { name: 'Employees', value: employeeCount }
  ].filter(i => i.value > 0);

  return (
    <div className="dashboard-screen animate-fade">
      
      {/* Metrics Row */}
      <div className="grid-cols-4" style={{ marginBottom: '28px' }}>
        <div className="glass-panel kpi-card" style={{ borderLeft: '3px solid var(--accent-cyan)' }}>
          <div className="kpi-details">
            <h3>TRIR Indicator</h3>
            <div className="kpi-value">{trir}</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Incidents per 200k hours</span>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ borderLeft: '3px solid var(--accent-red)' }}>
          <div className="kpi-details">
            <h3>LTIFR Safety Score</h3>
            <div className="kpi-value" style={{ color: 'var(--accent-red)' }}>{ltifr}</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Lost time cases per 1m hours</span>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-red)' }}>
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ borderLeft: '3px solid var(--accent-gold)' }}>
          <div className="kpi-details">
            <h3>High-Potential (HIPO)</h3>
            <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>{hipoCount}</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Major & Critical potential risks</span>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', color: 'var(--accent-gold)' }}>
            <AlertTriangle size={20} style={{ color: 'var(--accent-gold)' }} />
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ borderLeft: '3px solid var(--accent-green)' }}>
          <div className="kpi-details">
            <h3>Environmental Events</h3>
            <div className="kpi-value" style={{ color: 'var(--accent-green)' }}>{environmentalCount}</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Spills & wildlife incidents</span>
          </div>
          <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)' }}>
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* Chart Layout Grids */}
      <div className="grid-cols-2" style={{ gap: '28px', marginBottom: '28px' }}>
        
        {/* Trend line */}
        <div className="glass-panel" style={{ padding: '24px', height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h4 className="h2-title" style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Incident & Near Miss Trends (YTD)</h4>
          <div style={{ flex: 1, width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-red)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent-red)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNear" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Incidents" stroke="var(--accent-red)" fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="Near Misses" stroke="var(--accent-cyan)" fillOpacity={1} fill="url(#colorNear)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Site comparison */}
        <div className="glass-panel" style={{ padding: '24px', height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h4 className="h2-title" style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Site Comparison Analytics</h4>
          <div style={{ flex: 1, width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={siteData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
                <Bar dataKey="Incidents" fill="var(--accent-red)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Near Misses" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid-cols-2" style={{ gap: '28px' }}>
        
        {/* Category breakdown (Pie chart) */}
        <div className="glass-panel" style={{ padding: '24px', height: '340px', display: 'flex', flexDirection: 'column' }}>
          <h4 className="h2-title" style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Incident Split by Category</h4>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {categoryData.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>No data available.</p>
            ) : (
              <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-around' }}>
                <div style={{ width: '60%', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem', width: '40%' }}>
                  {categoryData.map((cat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: COLORS[idx % COLORS.length] }}></div>
                      <span style={{ color: 'var(--text-secondary)' }}>{cat.name}: <strong>{cat.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contractor vs Employee breakdown */}
        <div className="glass-panel" style={{ padding: '24px', height: '340px', display: 'flex', flexDirection: 'column' }}>
          <h4 className="h2-title" style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Contractor Involvement Split</h4>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {reporterData.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>No contractor stats available.</p>
            ) : (
              <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-around' }}>
                <div style={{ width: '60%', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reporterData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={80}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="var(--accent-purple)" />
                        <Cell fill="var(--accent-green)" />
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem', width: '40%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-purple)' }}></div>
                    <span style={{ color: 'var(--text-secondary)' }}>Contractor: <strong>{contractorCount}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-green)' }}></div>
                    <span style={{ color: 'var(--text-secondary)' }}>Internal Employee: <strong>{employeeCount}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardScreen;
