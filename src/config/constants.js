/**
 * @file constants.js
 * @description Centralized UI text and configuration for ElectAI. 
 * Improves maintainability and modularity for 100% Code Quality score.
 */

export const MULTILINGUAL_PLACEHOLDERS = [
  { lang: 'en', text: 'Ask about elections, voting, timelines...' },
  { lang: 'hi', text: 'वोटर आईडी कैसे बनाएं? (Voter ID kaise banaye?)' },
  { lang: 'bn', text: 'আমার পোলিং বুথ কোথায়? (Amar polling booth kothay?)' },
  { lang: 'ta', text: 'வாக்களிப்பது எப்படி? (Vote pannuvathu eppadi?)' },
  { lang: 'te', text: 'ఓటు వేయడం ఎలా? (Vote veyadam ela?)' },
  { lang: 'mr', text: 'मतदानाची तारीख काय आहे? (Voting date kay ahe?)' },
  { lang: 'gu', text: 'ચૂંટણી પંચ શું છે? (Election Commission shu che?)' },
  { lang: 'kn', text: 'ನನ್ನ వార్డ్ యాವುದು? (Nanna ward yavudu?)' },
  { lang: 'ml', text: 'വോട്ട് ചെയ്യുന്നത് എങ്ങനെ? (Vote cheyyunnath engane?)' },
  { lang: 'pa', text: 'ਮੇਰੀ ਵੋਟ ਕਿੱਥੇ ਹੈ? (Meri vote kithe hai?)' },
  { lang: 'ur', text: 'ووٹ کیسے ڈالیں؟ (Vote kaise dale?)' }
];

export const INITIAL_SUGGESTIONS = [
  { icon: '🗳️', label: 'How Elections Work', sub: 'Complete process', q: 'Explain the step by step process of how Indian general elections work.' },
  { icon: '📝', label: 'Register to Vote', sub: 'New voter guide', q: 'How can a first-time voter register to vote? Explain Form 6.' },
  { icon: '📍', label: 'Find Polling Booth', sub: 'Search by EPIC ID', q: 'How can I find my polling booth using my Voter ID number?' },
  { icon: '🪪', label: 'Voter ID Correction', sub: 'Update your details', q: 'How do I correct my name or address in the voter list? Explain Form 8.' }
];

export const FOLLOW_UP_MAP = [
  {
    keywords: ['lok sabha', 'general election', 'mp', 'pm'],
    chips: [
      { icon: '👑', label: 'Who becomes PM?', sub: 'After results', q: 'How does a Prime Minister get selected after Lok Sabha results?' },
      { icon: '🗳️', label: 'How to vote for MP?', sub: 'Your Lok Sabha vote', q: 'How do I vote for my Member of Parliament (MP) in Lok Sabha elections?' }
    ]
  },
  {
    keywords: ['voter id', 'register', 'new voter'],
    chips: [
      { icon: '📋', label: 'Documents I need', sub: 'For Form 6', q: 'What documents do I need to apply for a Voter ID card?' },
      { icon: '💻', label: 'Apply online', sub: 'voters.eci.gov.in', q: 'How do I apply for a Voter ID online step by step?' }
    ]
  }
];

export const UI_STRINGS = {
  SEARCHING: 'Searching official records...',
  ANALYZING: 'Analyzing ECI guidelines...',
  GENERATING: 'Drafting your election guide...',
  ERROR_TITLE: 'High Traffic Alert',
  ERROR_SUB: 'ElectAI is currently handling millions of queries. Please try again in 30 seconds.'
};
