import { Download } from 'lucide-react';
import { credits } from '../../data/credits';
import { profile } from '../../data/profile';
import { skillGroups } from '../../data/skills';
import PixelIcon from '../PixelIcon';
import RetroButton from '../RetroButton';

const AboutSection = () => {
  // BASE_URL keeps this correct under the /Portfolio/ base on GitHub Pages.
  const resumeUrl = `${import.meta.env.BASE_URL}${profile.resumeFile}`;

  return (
    <div className="space-y-4 text-[13px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[17px] font-bold">{profile.name}</h1>
          <p className="text-win-shadow">{profile.headline}</p>
          <p className="text-win-shadow">{profile.location}</p>
        </div>
        <a href={resumeUrl} download className="focus-dotted">
          <RetroButton className="flex items-center gap-2" tabIndex={-1}>
            <Download size={13} aria-hidden="true" />
            Download Resume
          </RetroButton>
        </a>
      </div>

      <fieldset className="group-box p-3">
        <legend className="px-1 font-bold">Read Me</legend>
        <div className="space-y-2 leading-relaxed">
          {profile.bio.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </fieldset>

      <fieldset className="group-box p-3">
        <legend className="px-1 font-bold">Skills</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {skillGroups.map(({ category, items }) => (
            <div key={category}>
              <h2 className="mb-[6px] font-bold uppercase tracking-wide text-win-title">
                {category}
              </h2>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.name} className="flex items-center gap-2">
                    <PixelIcon name={item.icon} size={16} />
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="group-box p-3">
        <legend className="px-1 font-bold">Credits</legend>
        <ul className="space-y-1 text-win-shadow">
          {credits.map((credit) => (
            <li key={credit.sourceUrl}>
              <a
                href={credit.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline focus-dotted"
              >
                {credit.title}
              </a>{' '}
              by {credit.author}, licensed{' '}
              <a
                href={credit.licenceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline focus-dotted"
              >
                {credit.licence}
              </a>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  );
};

export default AboutSection;
