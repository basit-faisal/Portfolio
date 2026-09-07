import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { profile } from '../../data/profile';
import {
  clearDraft,
  emptyDraft,
  LIMITS,
  loadDraft,
  saveDraft,
  sendMessage,
  validateDraft,
  type Draft
} from '../../sendMessage';
import MessageBox from '../MessageBox';
import RetroButton from '../RetroButton';
import { RetroInput, RetroTextarea } from '../RetroField';

type Dialog = {
  title: string;
  message: string;
  variant: 'info' | 'error';
};

const HeaderRow = ({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) => (
  <>
    <label htmlFor={htmlFor} className="pt-[4px] font-bold sm:w-[64px]">
      {label}
    </label>
    {children}
  </>
);

const ComposeSection = () => {
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [dialog, setDialog] = useState<Dialog | null>(null);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  const update = (field: keyof Draft, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;

    const problem = validateDraft(draft);
    if (problem) {
      setDialog({ title: 'New Message', message: problem, variant: 'error' });
      return;
    }

    setSending(true);
    const result = await sendMessage(draft, honeypot);
    setSending(false);

    if (result.status === 'sent') {
      clearDraft();
      setDraft(emptyDraft);
      setDialog({
        title: 'Message Sent',
        message: `Thanks for reaching out. Your message is on its way to ${profile.name}, who will reply to ${draft.email.trim()}.`,
        variant: 'info'
      });
      return;
    }

    if (result.status === 'handoff') {
      setDialog({
        title: 'Handing Off To Mail Client',
        message: 'Your default mail program is opening with this message ready to send. Press Send there to deliver it.',
        variant: 'info'
      });
      return;
    }

    setDialog({ title: 'Message Not Sent', message: result.message, variant: 'error' });
  };

  const discard = () => {
    setDraft(emptyDraft);
    clearDraft();
  };

  const remaining = LIMITS.message - draft.message.length;

  return (
    // noValidate: the browser's own validation bubbles would break the
    // illusion, and validateDraft reports through the Win95 message box instead.
    <form noValidate onSubmit={onSubmit} className="flex min-h-full flex-col gap-3 text-[13px]">
      <div className="flex items-start gap-3">
        <Send size={30} aria-hidden="true" className="mt-1 shrink-0 text-win-title" />
        <div>
          <h1 className="text-[17px] font-bold">New Message</h1>
          <p className="mt-1 leading-relaxed">
            Write to me without leaving the desktop. Drafts are kept if you close this window.
          </p>
        </div>
      </div>

      {/* Toolbar, in the manner of the era's mail clients. */}
      <div className="flex items-center gap-2 border-b border-win-shadow/40 pb-2">
        <RetroButton type="submit" disabled={sending}>
          <span className="flex items-center gap-[6px]">
            <Send size={13} aria-hidden="true" />
            {sending ? 'Sending...' : 'Send'}
          </span>
        </RetroButton>
        <RetroButton onClick={discard} disabled={sending}>
          <span className="flex items-center gap-[6px]">
            <Trash2 size={13} aria-hidden="true" />
            Discard
          </span>
        </RetroButton>
        <span className={`ml-auto ${remaining < 0 ? 'text-[#800000]' : 'text-win-shadow'}`}>
          {remaining} characters left
        </span>
      </div>

      <div className="grid gap-x-3 gap-y-2 sm:grid-cols-[auto_1fr]">
        <HeaderRow label="To:" htmlFor="mail-to">
          <RetroInput
            id="mail-to"
            value={profile.name}
            readOnly
            tabIndex={-1}
            aria-label="Recipient"
          />
        </HeaderRow>

        <HeaderRow label="From:" htmlFor="mail-from">
          <RetroInput
            id="mail-from"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            maxLength={LIMITS.email}
            required
            disabled={sending}
            value={draft.email}
            onChange={(event) => update('email', event.target.value)}
          />
        </HeaderRow>

        <HeaderRow label="Subject:" htmlFor="mail-subject">
          <RetroInput
            id="mail-subject"
            placeholder="What is this about?"
            maxLength={LIMITS.subject}
            required
            disabled={sending}
            value={draft.subject}
            onChange={(event) => update('subject', event.target.value)}
          />
        </HeaderRow>
      </div>

      <RetroTextarea
        aria-label="Message"
        placeholder="Type your message here..."
        maxLength={LIMITS.message}
        required
        disabled={sending}
        value={draft.message}
        onChange={(event) => update('message', event.target.value)}
        className="min-h-[180px] flex-1"
      />

      {/* Honeypot: positioned away rather than display:none, which bots skip. */}
      <div className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      {dialog && (
        <MessageBox
          title={dialog.title}
          message={dialog.message}
          variant={dialog.variant}
          onClose={() => setDialog(null)}
        />
      )}
    </form>
  );
};

export default ComposeSection;
