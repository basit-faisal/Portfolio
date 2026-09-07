/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Absolute URL of the mail relay that files a message as a GitHub issue.
   * Unset is a supported state: the composer falls back to a mailto handoff.
   */
  readonly VITE_CONTACT_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
