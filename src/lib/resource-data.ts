import { Cpu, Users, FileText, Radio, Shield, Globe } from 'lucide-react'

export const RESOURCE_CATEGORIES: Record<string, any> = {
  'hardware-ops': {
    title: 'Hardware Ops',
    icon: Cpu,
    desc: 'Deep-dive schematics and maintenance actions for Guardian Node clusters.',
    fullContent: `
      ### Guardian Node Infrastructure (V6.2)
      Guardian Nodes are the backbone of the Havenly offline-first mesh network. 
      
      #### Current Priorities:
      - **Satellite Uplink Calibration**: Required monthly to maintain drift within <2ms.
      - **Mesh Topology Optimization**: Ensuring nodes maintain a minimum of 3 peer connections for redundancy.
      - **Power Management**: New firmware includes optimized battery cycling for nodes in low-sun regions.

      #### Technical Schematics:
      1. GN-400 Core Module Assembly
      2. RF Antenna Array Calibration Guide
      3. Auxiliary Power Unit (APU) Troubleshooting
    `,
    stats: { count: '19 Documents', type: 'Schematics' }
  },
  'chief-training': {
    title: 'Chief Training',
    icon: Users,
    desc: 'Expert-led video modules covering tactical decision making under pressure.',
    fullContent: `
      ### Tactical Decision Framework
      Training for Chief Officers focused on leadership during high-stress community incidents.

      #### Modules:
      - **Incident Command Hierarchy**: Defining roles during multi-zone SOS alerts.
      - **Risk Assessment Protocols**: Rapid evaluation of physical vs. digital threats.
      - **Community De-escalation**: Strategies for managing large-scale civic gatherings.

      #### Strategic Roadmap (2026-2028):
      - **Phase 1**: Provincial deployment and trust-building.
      - **Phase 2**: NGO tier launch and municipal contract negotiation.
      - **Phase 3**: National safety infrastructure conversion.
    `,
    stats: { count: '8 Modules', type: 'Training' }
  },
  'sop-frameworks': {
    title: 'SOP Frameworks',
    icon: FileText,
    desc: 'Legal guidelines and Standard Operating Procedures for force and civilian evacuation.',
    fullContent: `
      ### Standard Operating Procedures
      Standardized protocols ensuring consistent safety responses nationwide.

      #### Key Frameworks:
      - **GBV Response Framework**: Priority handling for gender-based violence alerts, ensuring immediate responder dispatch and legal evidence capture.
      - **Evacuation SOP**: Structured coordination for natural disasters or high-threat zone clearances.
      - **Evidence Integrity**: Maintaining the chain of custody for digital evidence vault logs.

      #### Ethical Principles:
      - **Safety First**: The primary SOS panic button is never paywalled.
      - **Trust by Design**: User privacy (POPIA) is non-negotiable.
    `,
    stats: { count: '35 Policies', type: 'Legal' }
  },
  'comms-linkage': {
    title: 'Comms Linkage',
    icon: Radio,
    desc: 'Technical data on encrypted satellite-uplink and radio frequency management protocols.',
    fullContent: `
      ### Communication Infrastructure
      Ensuring "Always On" connectivity regardless of standard cellular network availability.

      #### Network Layers:
      - **Primary**: Encrypted 4G/5G encrypted tunnels.
      - **Secondary**: SMS-based fallback for low-signal environments.
      - **Tertiary**: LEO Satellite uplink for total cellular blackout scenarios.

      #### Protocols:
      - **Offline-First Logic**: Local caching of SOS triggers with automatic sync upon reconnection.
      - **RF Management**: Dynamic frequency switching to avoid interference in high-density urban areas.
    `,
    stats: { count: '12 Schematics', type: 'Comms' }
  },
  'cyber-defense': {
    title: 'Cyber Defense',
    icon: Shield,
    desc: 'Best practices for terminal security, biometric access control, and digital counter-measures.',
    fullContent: `
      ### System Hardening & Security
      Protecting the integrity of the Havenly network and user evidence vaults.

      #### Security Standards:
      - **Encryption**: AES-256-GCM for all data at rest and in transit.
      - **Access Control**: Multi-factor biometric authentication for administrative terminals.
      - **Evidence Vault**: WORM (Write Once, Read Many) storage protocols for legal admissibility.

      #### Compliance:
      - **POPIA-First Architecture**: Built-in data residency and user consent management.
      - **SAPS API Readiness**: Structured data formats for direct government system integration.
    `,
    stats: { count: '24 Guides', type: 'Security' }
  },
  'civic-liaison': {
    title: 'Civic Liaison',
    icon: Globe,
    desc: 'Templates for community outreach, emergency town hall coordination, and civilian liaison training.',
    fullContent: `
      ### Community Engagement
      Bridging the gap between technology and community trust.

      #### Outreach Strategies:
      - **Town Hall Templates**: Standardized agendas for community safety briefings.
      - **NGO Partnership Models**: Integration guides for localized safety organizations.
      - **Volunteer Management**: Training manuals for "Sentinel" community responders.

      #### Vision:
      Havenly becomes the default community safety infrastructure, ensuring every school, NGO, and municipality operates on a single, trusted platform.
    `,
    stats: { count: '16 Templates', type: 'Civic' }
  }
}
