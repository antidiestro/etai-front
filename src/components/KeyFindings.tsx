import { useAppContext } from "../contexts/AppContext";
import preventWidows from "../scripts/preventWidows";
import { Finding } from "../interfaces";
import FormattedMarkdown from "./FormattedMarkdown";
import appendPeriod from "../scripts/appendPeriod";

export default function KeyFindings() {
  const { summary, toggleFinding, visibleFindings } = useAppContext();

  return (
    <div>
      <h2>Key Findings</h2>
      <div className="-mt-2 mb-5">
        These are the most important takeaways from the relevant literature.
      </div>
      {summary!.key_findings.map((finding: Finding) => (
        <div key={finding.title} className="bg-[#F5F3EE] mb-3 py-4 rounded-md">
          <div
            className="flex px-5 text-black cursor-pointer hover:opacity-70"
            onClick={() => toggleFinding(finding.title)}
          >
            <div className="font-medium pr-5 flex-1">
              {preventWidows(appendPeriod(finding.title))}
            </div>
            <div
              className={`with-transition relative top-0.5 h-[16px] aspect-square ${
                visibleFindings.includes(finding.title) &&
                "rotate-90 translate-y-1"
              }`}
            >
              <span className={`material-symbols-sharp text-[16px]`}>
                arrow_forward_ios
              </span>
            </div>
          </div>
          <FormattedMarkdown
            content={finding.summary}
            className={`with-transition overflow-hidden px-5 mt-2 ${
              !visibleFindings.includes(finding.title) && "hidden"
            }`}
          />
        </div>
      ))}
    </div>
  );
}
