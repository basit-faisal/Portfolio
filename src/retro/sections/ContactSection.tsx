import { ExternalLink, Github, Linkedin, Mail, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { socials } from '../../data/profile';

const iconMap: Record<string, LucideIcon> = {
  mail: Mail,
  github: Github,
  linkedin: Linkedin,
  external: ExternalLink
};

const ContactSection = () => (
  <div className="space-y-4 text-[13px]">
    <div className="flex items-start gap-3">
      <Mail size={32} aria-hidden="true" className="mt-1 shrink-0 text-win-title" />
      <div>
        <h1 className="text-[17px] font-bold">Contact Me</h1>
        <p className="mt-1 leading-relaxed">
          Feel free to reach out for collaborations, opportunities, or just to say hello.
        </p>
      </div>
    </div>

    <Link
      to="/compose"
      className="inline-flex items-center gap-2 bg-win-face bevel-out active:bevel-in px-3 py-2 font-bold focus-dotted"
    >
      <Send size={15} aria-hidden="true" className="text-win-title" />
      Write a message here
    </Link>

    <fieldset className="group-box p-3">
      <legend className="px-1 font-bold">Available Channels</legend>
      <ul className="grid gap-2 sm:grid-cols-2">
        {socials.map((social) => {
          const Icon = iconMap[social.icon] ?? ExternalLink;

          return (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-win-face bevel-out active:bevel-in px-3 py-2 focus-dotted"
              >
                <Icon size={15} aria-hidden="true" className="text-win-title" />
                <span className="font-bold">{social.label}</span>
                <ExternalLink size={11} aria-hidden="true" className="ml-auto text-win-shadow" />
              </a>
            </li>
          );
        })}
      </ul>
    </fieldset>
  </div>
);

export default ContactSection;
