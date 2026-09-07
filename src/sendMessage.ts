/**
 * Delivery for the mail composer.
 *
 * The site is a static bundle on GitHub Pages, so it cannot hold a secret. It
 * POSTs to a small relay (see relay/) that holds the GitHub token server-side
 * and files the message as an issue in a private repo.
 *
 * With no relay configured the composer still works: it hands the drafted
 * message to the visitor's own mail client instead of failing.
 */
import { ownerEmail } from './data/profile';

export const LIMITS = {
  email: 254,
  subject: 120,
  message: 4000
} as const;

export type Draft = {
  email: string;
  subject: string;
  message: string;
};

export type SendResult =
  | { status: 'sent' }
  /** No relay configured, so the visitor's mail client was opened instead. */
  | { status: 'handoff' }
  | { status: 'error'; message: string };

export const emptyDraft: Draft = { email: '', subject: '', message: '' };

const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT?.trim();

/** Deliberately loose. Real validation is the reply landing or bouncing. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns a message to show the visitor, or null when the draft is good. */
export const validateDraft = (draft: Draft): string | null => {
  const email = draft.email.trim();
  const subject = draft.subject.trim();
  const message = draft.message.trim();

  if (!email) return 'Please enter your email address so I have somewhere to reply.';
  if (!EMAIL_PATTERN.test(email) || email.length > LIMITS.email) {
    return 'That email address does not look right. Please check it and try again.';
  }
  if (!subject) return 'Please enter a subject for your message.';
  if (subject.length > LIMITS.subject) {
    return `Subjects are limited to ${LIMITS.subject} characters.`;
  }
  if (!message) return 'Your message is empty. Write something first.';
  if (message.length > LIMITS.message) {
    return `Messages are limited to ${LIMITS.message} characters.`;
  }

  return null;
};

const openMailClient = (draft: Draft) => {
  const body = `${draft.message.trim()}\n\n---\nSent from basitfaisal.dev by ${draft.email.trim()}`;
  const query = `subject=${encodeURIComponent(draft.subject.trim())}&body=${encodeURIComponent(body)}`;
  window.location.href = `mailto:${ownerEmail}?${query}`;
};

/**
 * @param honeypot Hidden field no human fills in. A value means a bot, which
 *   is reported as success so it has nothing to retry against.
 */
export const sendMessage = async (draft: Draft, honeypot: string): Promise<SendResult> => {
  if (honeypot.trim()) return { status: 'sent' };

  if (!endpoint) {
    openMailClient(draft);
    return { status: 'handoff' };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: draft.email.trim(),
        subject: draft.subject.trim(),
        message: draft.message.trim(),
        website: honeypot
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (response.status === 429) {
      return {
        status: 'error',
        message: 'Too many messages have been sent from here recently. Please try again in a minute.'
      };
    }

    if (!response.ok) {
      return {
        status: 'error',
        message: `The mail server rejected the message (error ${response.status}). Please try the links in the Contact window instead.`
      };
    }

    return { status: 'sent' };
  } catch {
    return {
      status: 'error',
      message:
        'Could not reach the mail server. Check your connection, or try the links in the Contact window instead.'
    };
  }
};

// --- draft persistence -------------------------------------------------------
// Closing the window unmounts the composer, and minimise is wired to close, so
// an unsaved draft would otherwise vanish on a stray click.

const DRAFT_KEY = 'retro-mail-draft';

export const loadDraft = (): Draft => {
  try {
    const stored = window.sessionStorage.getItem(DRAFT_KEY);
    if (!stored) return emptyDraft;
    const parsed = JSON.parse(stored) as Partial<Draft>;
    return {
      email: typeof parsed.email === 'string' ? parsed.email : '',
      subject: typeof parsed.subject === 'string' ? parsed.subject : '',
      message: typeof parsed.message === 'string' ? parsed.message : ''
    };
  } catch {
    return emptyDraft;
  }
};

export const saveDraft = (draft: Draft) => {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Private browsing can refuse writes; losing the draft beats crashing.
  }
};

export const clearDraft = () => {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // As above.
  }
};
