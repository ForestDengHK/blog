// Common spam patterns and keywords
const SPAM_PATTERNS = [
  /\b(viagra|cialis|casino|poker|lottery|prize|winner|buy now|click here|free offer)\b/i,
  /\b(earn money|make money|work from home|get rich|income opportunity)\b/i,
  /\b(enlargement|weight loss|diet pill|miracle cure|amazing results)\b/i,
  /(https?:\/\/[^\s]+){3,}/g, // More than 2 URLs in the content
  /\$\d+[kK]/g, // Dollar amounts with k (e.g., $5k, $10K)
  /[A-Z\s]{20,}/g, // Long strings of capital letters
];

// Suspicious patterns that might indicate spam
const SUSPICIOUS_PATTERNS = [
  /\b(limited time|act now|don't wait|hurry|special offer)\b/i,
  /[!?]{2,}/g, // Multiple exclamation or question marks
  /\b(guarantee|proven|results|testimonial)\b/i,
  /(https?:\/\/[^\s]+){2}/g, // 2 URLs in the content
];

export function detectSpam(content: string): number {
  let spamScore = 0;

  // Check for spam patterns (higher weight)
  SPAM_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      spamScore += matches.length * 0.3;
    }
  });

  // Check for suspicious patterns (lower weight)
  SUSPICIOUS_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      spamScore += matches.length * 0.15;
    }
  });

  // Check for excessive capitalization
  const capitalRatio = (content.match(/[A-Z]/g)?.length || 0) / content.length;
  if (capitalRatio > 0.3) {
    spamScore += 0.2;
  }

  // Check for repetitive characters
  if (/(.)\1{4,}/g.test(content)) {
    spamScore += 0.2;
  }

  // Normalize score to be between 0 and 1
  return Math.min(Math.max(spamScore, 0), 1);
} 