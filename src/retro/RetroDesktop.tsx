import { useEffect, useState, type ComponentType } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, FileText, FolderOpen, Mail, Power, Send, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { profile } from '../data/profile';
import { sectionByPath, sections, type SectionId } from '../data/sections';
import CRTOverlay from './CRTOverlay';
import DesktopIcon from './DesktopIcon';
import RetroWindow from './Window';
import Taskbar from './Taskbar';
import AboutSection from './sections/AboutSection';
import ComposeSection from './sections/ComposeSection';
import ContactSection from './sections/ContactSection';
import ProjectsSection from './sections/ProjectsSection';
import WorkHistorySection from './sections/WorkHistorySection';

const sectionIcons: Record<SectionId, LucideIcon> = {
  about: User,
  projects: FolderOpen,
  'work-history': Briefcase,
  contact: Mail,
  compose: Send
};

const sectionContent: Record<SectionId, ComponentType> = {
  about: AboutSection,
  projects: ProjectsSection,
  'work-history': WorkHistorySection,
  contact: ContactSection,
  compose: ComposeSection
};

/** Cycles the role titles, carried over from the previous site's hero. */
const RotatingRole = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % profile.roles.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    // Height is in em and the slide uses percentages, so the clip window always
    // matches the current font size instead of a hardcoded pixel height.
    <span className="relative inline-flex h-[1.25em] items-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={profile.roles[index]}
          initial={{ y: '105%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-105%', opacity: 0 }}
          transition={{ duration: 0.32, ease: 'easeInOut' }}
          className="whitespace-nowrap font-bold"
        >
          {profile.roles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

type RetroDesktopProps = {
  /** Powers the machine back down to the 3D scene. Absent without WebGL. */
  onShutDown?: () => void;
};

const RetroDesktop = ({ onShutDown }: RetroDesktopProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);

  const activeSection = sectionByPath(location.pathname);
  const resumeUrl = `${import.meta.env.BASE_URL}${profile.resumeFile}`;

  // Escape closes whatever is on top: the Start menu first, then the window.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (startOpen) setStartOpen(false);
      else if (activeSection) navigate('/');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [startOpen, activeSection, navigate]);

  const ActiveContent = activeSection ? sectionContent[activeSection.id] : null;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-win-desktop">
      {/* Desktop surface: click empty space to deselect and dismiss the menu. */}
      <div
        className="absolute inset-0"
        onClick={() => {
          setSelectedIcon(null);
          setStartOpen(false);
        }}
      >
        <div className="flex flex-col items-start gap-1 p-3">
          {sections.map((section) => (
            <DesktopIcon
              key={section.id}
              label={section.label}
              icon={sectionIcons[section.id]}
              selected={selectedIcon === section.id}
              onSelect={() => setSelectedIcon(section.id)}
              onOpen={() => navigate(section.path)}
            />
          ))}
        </div>

        {/* Nameplate, the desktop's stand-in for the old hero section. Capped
            in width and scaled down on small screens so it cannot collide
            with the icon column on the left. */}
        <div className="pointer-events-none absolute right-3 top-4 max-w-[62%] text-right text-white sm:right-6 sm:top-6 sm:max-w-none">
          <p
            className="text-[19px] font-bold leading-tight sm:text-[26px]"
            style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.6)' }}
          >
            {profile.name}
          </p>
          {/* Flex row keeps the static and rotating words on one baseline. */}
          <p
            className="mt-1 flex items-center justify-end gap-[6px] text-[13px] sm:text-[16px]"
            style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.6)' }}
          >
            <span>I'm a</span>
            <RotatingRole />
          </p>
          <p
            className="mt-3 hidden text-[13px] opacity-80 sm:block"
            style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.6)' }}
          >
            Double-click an icon to begin
          </p>
          {/* Touch has no double click, so the hint differs by input type. */}
          <p
            className="mt-2 text-[12px] opacity-80 sm:hidden"
            style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.6)' }}
          >
            Tap an icon to begin
          </p>
        </div>
      </div>

      {/* Windows */}
      <AnimatePresence mode="wait">
        {activeSection && ActiveContent && (
          <RetroWindow
            key={activeSection.id}
            title={activeSection.windowTitle}
            status={activeSection.status}
            onClose={() => navigate('/')}
          >
            <ActiveContent />
          </RetroWindow>
        )}
      </AnimatePresence>

      {/* Start menu */}
      <AnimatePresence>
        {startOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute bottom-[32px] left-[3px] z-40 w-[210px] bg-win-face bevel-out p-[3px]"
          >
            <ul className="text-[13px]">
              {sections.map((section) => {
                const Icon = sectionIcons[section.id];

                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(section.path);
                        setStartOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-2 py-[6px] text-left hover:bg-win-title hover:text-white focus-dotted"
                    >
                      <Icon size={16} aria-hidden="true" />
                      {section.label}
                    </button>
                  </li>
                );
              })}
              <li className="my-[3px] h-[2px] bevel-group" aria-hidden="true" />
              <li>
                <a
                  href={resumeUrl}
                  download
                  onClick={() => setStartOpen(false)}
                  className="flex w-full items-center gap-2 px-2 py-[6px] hover:bg-win-title hover:text-white focus-dotted"
                >
                  <FileText size={16} aria-hidden="true" />
                  Resume.pdf
                </a>
              </li>
              {onShutDown && (
                <>
                  <li className="my-[3px] h-[2px] bevel-group" aria-hidden="true" />
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setStartOpen(false);
                        onShutDown();
                      }}
                      className="flex w-full items-center gap-2 px-2 py-[6px] text-left hover:bg-win-title hover:text-white focus-dotted"
                    >
                      <Power size={16} aria-hidden="true" />
                      Shut Down...
                    </button>
                  </li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <Taskbar
        openSection={activeSection}
        onStart={() => setStartOpen((open) => !open)}
        onTaskClick={() => navigate(activeSection ? '/' : '/about')}
      />

      <CRTOverlay />
    </div>
  );
};

export default RetroDesktop;
