/**
 * Sanitizes transcript to prevent data leakage
 * Removes founder names, startup names, YC references, etc.
 */

const FOUNDER_NAME_PATTERNS = [
  /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // First Last names
]

const YC_PATTERNS = [
  /\bY\s*Combinator\b/gi,
  /\bYC\b/gi,
  /\by\s*combinator\b/gi,
]

const BATCH_PATTERNS = [
  /\b[WS]\d{2}\b/g, // W24, S23, etc.
  /\bWinter\s+\d{4}\b/gi,
  /\bSummer\s+\d{4}\b/gi,
]

const PARTNER_NAMES = [
  'Garry Tan',
  'Paul Graham',
  'Jessica Livingston',
  'Sam Altman',
  'Geoff Ralston',
  'Michael Seibel',
  'Dalton Caldwell',
  'Jared Friedman',
  'Kat Manalac',
  'Carolynn Levy',
]

export function sanitizeTranscript(transcript: string): string {
  let sanitized = transcript

  // Replace YC references
  YC_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[ACCELERATOR]')
  })

  // Replace batch identifiers
  BATCH_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[BATCH]')
  })

  // Replace known partner names
  PARTNER_NAMES.forEach(name => {
    const regex = new RegExp(name.replace(/\s+/g, '\\s+'), 'gi')
    sanitized = sanitized.replace(regex, '[INTERVIEWER]')
  })

  // Replace common founder name patterns (conservative approach)
  // This is a simple heuristic - could be improved with NER
  sanitized = sanitized.replace(/\b(I|We|My co-founder|My partner)\s+am\s+([A-Z][a-z]+)\b/gi, '$1 am [FOUNDER]')
  sanitized = sanitized.replace(/\bMy\s+name\s+is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/gi, 'My name is [FOUNDER]')
  
  // Replace startup/company names (common patterns)
  sanitized = sanitized.replace(/\b(Our|My|The)\s+(company|startup|company name|startup name)\s+(is\s+)?([A-Z][a-zA-Z0-9]+)\b/gi, '$1 $2 is [STARTUP]')
  sanitized = sanitized.replace(/\b([A-Z][a-zA-Z0-9]+)\s+(is|was)\s+(our|my)\s+(company|startup)\b/gi, '[STARTUP] $2 $3 $4')

  return sanitized
}

