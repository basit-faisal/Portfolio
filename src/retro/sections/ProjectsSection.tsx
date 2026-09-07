import { useState } from 'react';
import { FileCode2 } from 'lucide-react';
import { projects } from '../../data/projects';

/** Explorer "Details" view: selectable rows with Name / Type / Description columns. */
const ProjectsSection = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-2 text-[13px]">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            {['Name', 'Type', 'Description'].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="bevel-out bg-win-face px-2 py-[3px] font-normal"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const isSelected = selected === project.title;

            return (
              <tr
                key={project.title}
                onClick={() => setSelected(project.title)}
                className={`cursor-default align-top ${
                  isSelected ? 'bg-win-title text-white' : 'hover:bg-win-light'
                }`}
              >
                <td className="whitespace-nowrap px-2 py-[3px]">
                  <span className="flex items-center gap-[6px]">
                    <FileCode2
                      size={13}
                      aria-hidden="true"
                      className={isSelected ? 'text-white' : 'text-win-title'}
                    />
                    {project.title}
                  </span>
                </td>
                <td className="whitespace-nowrap px-2 py-[3px]">{project.kind}</td>
                <td className="px-2 py-[3px]">{project.description}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="text-win-shadow">
        {projects.length} object(s). Want details on any of these? Open Contact Me and reach out.
      </p>
    </div>
  );
};

export default ProjectsSection;
