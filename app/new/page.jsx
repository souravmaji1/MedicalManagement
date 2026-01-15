// app/roles-features/page.jsx
'use client';

import { useState } from 'react';
import {
  Users,
  Shield,
  Clock,
  FileText,
  AlertTriangle,
  Database,
  BarChart3,
  Settings,
  Lock,
  CheckCircle,
  XCircle,
  Eye,
  UserCheck,
  Download,
  Video,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';

export default function PlatformOverview() {
  const [activeRole, setActiveRole] = useState('pss');
  const [activeSection, setActiveSection] = useState('overview');

  const roles = {
    pss: {
      name: 'Peer Support Specialist (PSS)',
      icon: Users,
      color: 'bg-blue-500',
      permissions: {
        can: [
          'Start/stop session timer',
          'Draft notes',
          'Use AI assist for language refinement',
          'Submit notes for review',
          'Initiate 988 warm handoffs'
        ],
        cannot: [
          'Edit submitted notes',
          'Delete notes',
          'Override time or units',
          'View other peers\' clients',
          'Access billing exports'
        ]
      }
    },
    supervisor: {
      name: 'Supervisor / QA',
      icon: Shield,
      color: 'bg-green-500',
      permissions: {
        can: [
          'View all assigned peers\' notes',
          'Approve/reject notes',
          'Lock notes for billing',
          'Leave corrective feedback',
          'View productivity & risk flags'
        ],
        cannot: [
          'Edit peer-authored text',
          'Change time or units',
          'Submit notes on behalf of peers'
        ]
      }
    },
    admin: {
      name: 'Admin (Agency Owner)',
      icon: Settings,
      color: 'bg-purple-500',
      permissions: {
        can: [
          'Manage users & roles',
          'Configure MCP rules',
          'Set authorization limits',
          'Export audit packages',
          'Manage subscription & billing'
        ],
        cannot: []
      }
    }
  };

  const coreFeatures = [
    {
      id: 'session-timer',
      name: 'Session Timer & Unit Engine',
      icon: Clock,
      description: 'Real-time timer with automatic unit calculation',
      details: [
        'Timer must start before note entry',
        'No manual time entry allowed',
        '15-29 min = 1 unit, 30-44 min = 2 units, 45-59 min = 3 units',
        'Duration < 15 min → submission disabled'
      ]
    },
    {
      id: 'auth-enforcement',
      name: 'Authorization Engine',
      icon: Lock,
      description: 'Real-time verification against Medicaid authorizations',
      details: [
        'Blocks services outside auth dates',
        'Enforces monthly and total unit caps',
        'Warning thresholds: 75% (yellow), 90% (orange), 100% (red + lock)',
        'Real-time eligibility checks before submission'
      ]
    },
    {
      id: 'note-composition',
      name: 'Note Composition Engine',
      icon: FileText,
      description: 'Structured, compliant note creation',
      details: [
        'Required fields enforcement',
        'Clinical language firewall',
        'Peer-safe interventions checklist',
        'Goal alignment from recovery plan'
      ]
    },
    {
      id: 'ai-assist',
      name: 'AI Assist Module',
      icon: UserCheck,
      description: 'Safe mode AI for language refinement',
      details: [
        'Rewrites peer text to remove clinical language',
        'Checks for missing required elements',
        'Cannot: add time, services, or diagnoses',
        'All AI usage logged and user-confirmed'
      ]
    },
    {
      id: 'supervisor-qa',
      name: 'Supervisor QA Workflow',
      icon: Eye,
      description: 'Structured approval process',
      details: [
        'Time & units summary display',
        'Auth status verification',
        'Flagged language highlighting',
        'Locked notes are immutable'
      ]
    },
    {
      id: 'audit-export',
      name: 'Audit Export Engine',
      icon: Download,
      description: 'One-click compliance packages',
      details: [
        'Includes all notes, auth, units, credentials',
        'PDF and CSV formats',
        'Full audit trail with timestamps',
        'Ready for Medicaid audit review'
      ]
    },
    {
      id: 'tele-support',
      name: 'Tele-Support Module',
      icon: Video,
      description: 'Remote peer support compliance',
      details: [
        'Phone and video session support',
        'Same compliance rules as in-person',
        'Auto-timer start at connection',
        'Scope boundaries enforced'
      ]
    },
    {
      id: '988-coordination',
      name: '988 Coordination',
      icon: Phone,
      description: 'Crisis escalation management',
      details: [
        'Tiered escalation framework',
        'Warm handoffs to 988 Lifeline',
        'Consent documentation',
        'Coordination only - no crisis services'
      ]
    },
    {
      id: 'resource-db',
      name: 'Resource Navigator',
      icon: MapPin,
      description: 'Location-aware resource database',
      details: [
        'Verified, MCP-approved resources',
        'ZIP/county filtering',
        'Referral tracking with outcomes',
        'Integration with note documentation'
      ]
    },
    {
      id: 'analytics',
      name: 'MCO Dashboards',
      icon: BarChart3,
      description: 'Payer-grade analytics',
      details: [
        'Compliance & billing integrity',
        'Utilization management',
        'Crisis escalation analytics',
        'ER diversion reporting'
      ]
    }
  ];

  const nonNegotiablePrinciples = [
    { text: 'No manual time entry', icon: Clock },
    { text: 'No note submission without authorization', icon: Lock },
    { text: 'No clinical language allowed', icon: XCircle },
    { text: 'No unit overrides', icon: AlertTriangle },
    { text: 'No edits after supervisor lock', icon: FileText },
    { text: 'Full audit trail for every action', icon: Database }
  ];

  const NoteLifecycle = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Note Lifecycle Flow
      </h3>
      <div className="relative">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          {[
            { step: 1, title: 'Draft', desc: 'Peer creates note with timer running' },
            { step: 2, title: 'Submitted', desc: 'Peer submits for supervisor review' },
            { step: 3, title: 'Reviewed', desc: 'Supervisor approves/returns' },
            { step: 4, title: 'Locked', desc: 'Approved → immutable' },
            { step: 5, title: 'Billing Ready', desc: 'Available for billing export' },
            { step: 6, title: 'Audit Ready', desc: 'Full trail for 7-10 years' }
          ].map((stage, index) => (
            <div key={stage.step} className="flex flex-col items-center mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <span className="font-bold text-blue-600">{stage.step}</span>
              </div>
              <span className="font-medium">{stage.title}</span>
              <span className="text-sm text-gray-600 text-center">{stage.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Get the active role's icon component
  const ActiveRoleIcon = roles[activeRole].icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">PeerBridge Notes™ Platform</h1>
          <p className="text-gray-600 mt-2">NC Medicaid-Compliant Peer Support Note Engine</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-2 mb-8 border-b">
          {[
            { id: 'overview', label: 'Platform Overview' },
            { id: 'roles', label: 'User Roles' },
            { id: 'features', label: 'Core Features' },
            { id: 'compliance', label: 'Compliance Engine' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2 font-medium ${activeSection === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Product Overview</h2>
              <p className="text-gray-700 mb-4">
                Web + Mobile SaaS designed to make it technically impossible to submit a non-billable 
                or non-compliant NC Medicaid Peer Support note.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Target Buyers</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      NC Medicaid Peer Support Providers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      LME/MCO-contracted agencies
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Crisis diversion & HCBS programs
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">System Principles</h3>
                  <ul className="space-y-2">
                    {nonNegotiablePrinciples.map((principle, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <principle.icon className="w-4 h-4 text-red-500" />
                        {principle.text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Key Benefits</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Prevents audit findings
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Reduces recoupments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Faster billing cycles
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Safer peer practice
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <NoteLifecycle />

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Core Data Models</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'User', fields: ['id', 'role', 'credentials'] },
                  { name: 'Client', fields: ['name', 'Medicaid ID', 'MCP', 'auth dates', 'units'] },
                  { name: 'Session', fields: ['timer', 'duration', 'units', 'location', 'status'] },
                  { name: 'Note', fields: ['goal', 'interventions', 'progress', 'next steps'] },
                  { name: 'Authorization', fields: ['units authorized', 'units used', 'warnings'] },
                  { name: 'Audit Log', fields: ['entity', 'action', 'user', 'timestamp'] },
                  { name: 'Resource', fields: ['category', 'location', 'MCP approved', 'verification'] },
                  { name: 'Escalation', fields: ['tier', 'consent', '988 handoff', 'outcome'] }
                ].map((model, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold mb-2">{model.name}</h3>
                    <ul className="text-sm text-gray-600">
                      {model.fields.map((field, idx) => (
                        <li key={idx} className="truncate">• {field}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Roles Section */}
        {activeSection === 'roles' && (
          <div className="space-y-8">
            <div className="flex flex-wrap gap-4 mb-6">
              {Object.entries(roles).map(([key, role]) => {
                const Icon = role.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveRole(key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeRole === key
                        ? `${role.color} text-white`
                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{role.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-full ${roles[activeRole].color} text-white`}>
                  <ActiveRoleIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">{roles[activeRole].name}</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Can Do
                  </h3>
                  <ul className="space-y-3">
                    {roles[activeRole].permissions.can.map((permission, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {roles[activeRole].permissions.cannot.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      Cannot Do
                    </h3>
                    <ul className="space-y-3">
                      {roles[activeRole].permissions.cannot.map((permission, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>{permission}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {activeSection === 'features' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActiveSection('compliance')}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold">{feature.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.details.slice(0, 3).map((detail, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Compliance Section */}
        {activeSection === 'compliance' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">NC Medicaid Compliance Engine</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Enforcement Points
                  </h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Time & Units', checks: ['No manual entry', '15-min minimum', 'Auto-calculation', 'No overrides'] },
                      { title: 'Authorization', checks: ['Date range validation', 'Unit cap enforcement', 'Real-time checks', 'Warning thresholds'] },
                      { title: 'Documentation', checks: ['Required fields', 'Clinical language blocking', 'Goal alignment', 'Supervisor review'] },
                      { title: 'Scope of Practice', checks: ['Peer-only language', 'No clinical terms', 'No diagnosis/treatment', 'Supervision required'] }
                    ].map((category, idx) => (
                      <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h4 className="font-semibold mb-2">{category.title}</h4>
                        <ul className="space-y-1">
                          {category.checks.map((check, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              {check}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    Audit Defense Metrics
                  </h3>
                  <div className="space-y-4">
                    {[
                      { metric: 'Non-Compliant Service Prevention', target: '≥99% blocked' },
                      { metric: 'Supervisor Approval Rate', target: '≥98% approved' },
                      { metric: 'Authorization Adherence', target: '≥99% within auth' },
                      { metric: 'Clinical Language Prevention', target: '100% blocked' },
                      { metric: 'Timely Documentation', target: '100% real-time' },
                      { metric: 'Audit Export Completeness', target: '100% fields included' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span>{item.metric}</span>
                        <span className="font-semibold text-green-600">{item.target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">AI Safeguards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-green-600 mb-3">AI CAN:</h4>
                  <ul className="space-y-2">
                    {[
                      'Rewrite peer text for clarity',
                      'Remove clinical language',
                      'Check for missing fields',
                      'Suggest peer-safe alternatives'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-red-600 mb-3">AI CANNOT:</h4>
                  <ul className="space-y-2">
                    {[
                      'Add time or services',
                      'Add diagnoses or symptoms',
                      'Change meaning of content',
                      'Make clinical recommendations'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p className="font-semibold">PeerBridge Notes™ — NC Medicaid-Compliant Peer Support Note Engine</p>
            <p className="text-sm mt-2">Designed for HIPAA compliance • SOC 2 ready • State procurement safe</p>
          </div>
        </div>
      </footer>
    </div>
  );
}