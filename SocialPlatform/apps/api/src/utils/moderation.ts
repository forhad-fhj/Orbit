const PROFANITY_LIST = [
  'badword1', 'badword2', 'slur1', 'slur2',
  'spam', 'freemoney', 'clickhere',
];

const SPAM_PATTERNS = [
  /(.)\1{5,}/i,
  /https?:\/\/\S+/gi,
  /buy now|click here|free money|act now|limited time/gi,
];

export function checkContent(text: string): { isClean: boolean; flaggedWords: string[]; reason?: string } {
  if (!text || text.trim().length === 0) {
    return { isClean: true, flaggedWords: [] };
  }

  const lower = text.toLowerCase();
  const flaggedWords: string[] = [];

  for (const word of PROFANITY_LIST) {
    if (lower.includes(word)) {
      flaggedWords.push(word);
    }
  }

  if (flaggedWords.length > 0) {
    return { isClean: false, flaggedWords, reason: 'Content contains prohibited words' };
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      pattern.lastIndex = 0;
      return { isClean: false, flaggedWords: [], reason: 'Content flagged as potential spam' };
    }
  }

  return { isClean: true, flaggedWords: [] };
}
