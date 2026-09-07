import { experiences } from '../../data/experience';

const WorkHistorySection = () => (
  <div className="space-y-4 text-[13px]">
    {experiences.map((experience) => {
      const promoted = experience.roles.length > 1;

      return (
        <fieldset key={experience.company} className="group-box p-3">
          <legend className="px-1 font-bold">
            {experience.company} — {experience.period}
          </legend>

          <div className="space-y-4">
            {experience.roles.map((role, roleIndex) => (
              <div key={role.position}>
                <div className="mb-1 flex flex-wrap items-baseline gap-2">
                  <h2 className="font-bold text-win-title">{role.position}</h2>
                  {promoted && roleIndex === 0 && (
                    <span className="bevel-out bg-win-face px-[5px] py-[1px] text-[9px] uppercase tracking-wide">
                      Promoted
                    </span>
                  )}
                  <span className="ml-auto text-win-shadow">{role.period}</span>
                </div>

                <ul className="space-y-1 leading-relaxed">
                  {role.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span aria-hidden="true" className="text-win-title">
                        ▪
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex flex-wrap gap-[3px] pt-1">
              {experience.technologies.map((tech) => (
                <span key={tech} className="bevel-out bg-win-face px-2 py-[1px]">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </fieldset>
      );
    })}
  </div>
);

export default WorkHistorySection;
