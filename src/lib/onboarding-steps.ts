export interface OnboardingStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export const ONBOARDING_CONTENT: Record<string, OnboardingStep[]> = {
  FOUNDER: [
    {
      target: '#nav-team',
      title: 'Command Your Team',
      content: 'Invite and manage your officers, videographers, and content creators from this central hub.',
      position: 'right'
    },
    {
      target: '#nav-audit',
      title: 'Cryptographic Integrity',
      content: 'Every action on the platform is hashed and signed. View the tamper-proof ledger here.',
      position: 'right'
    }
  ],
  VIDEOGRAPHER: [
    {
      target: '#nav-media',
      title: 'Media Vault',
      content: 'Upload raw b-roll and evidence here. Use the multipart uploader for high-speed transfers.',
      position: 'right'
    },
    {
      target: '#upload-button',
      title: 'Start Uploading',
      content: 'Click here to initiate a new media upload to the Cloudflare R2 vault.',
      position: 'bottom'
    }
  ],
  CONTENT_CREATOR: [
    {
      target: '#nav-media',
      title: 'Asset Library',
      content: 'Access raw footage and images to begin your creative edits and marketing campaigns.',
      position: 'right'
    }
  ]
};
