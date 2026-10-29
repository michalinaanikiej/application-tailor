import React, { useState } from 'react';
import {
  Copy,
  Check,
  AlertOctagon,
  HelpCircle,
  TrendingUp,
  Scissors,
  CheckCircle2,
  Briefcase,
  FileSearch,
} from 'lucide-react';
import { TailorResponse } from '../types/tailor';

interface ReviewNoteViewerProps {
  reviewData: TailorResponse['reviewNote'];
  employer: string;
  role: string;
}

export const ReviewNoteViewer: React.FC<ReviewNoteViewerProps> = ({
  reviewData,
  employer,
  role,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      const formatted = `APPLICATION REVIEW NOTE
Target Role: ${role} | Employer: ${employer}

1. TAILORING ADJUSTMENTS
• Emphasized:
${reviewData.adjustments.emphasized.map((e) => `  - ${e}`).join('\n')}
• Shortened / Condensed:
${reviewData.adjustments.shortened.map((s) => `  - ${s}`).join('\n')}
• Removed or Deprioritized:
${reviewData.adjustments.removedOrDeprioritized.map((r) => `  - ${r}`).join('\n')}

2. EVIDENCE MAPPING
• Direct Evidence:
${reviewData.evidenceMatrix.directEvidence.map((d) => `  - Requirement: ${d.jobRequirement} | Evidence: ${d.cvEvidence}`).join('\n')}
• Transferable Skills:
${reviewData.evidenceMatrix.transferableSkills.map((t) => `  - Requirement: ${t.jobRequirement} | Candidate Skill: ${t.candidateSkill} | Relevance: ${t.relevance}`).join('\n')}

3. QUALIFICATION GAPS & UNEVIDENCED ITEMS
• Confirmed Gaps (Absent from CV):
${reviewData.evidenceMatrix.confirmedGaps.map((g) => `  - [${g.severity.toUpperCase()}] ${g.jobRequirement}: ${g.gapExplanation}`).join('\n')}
• Unevidenced Qualifications / Missing Context:
${reviewData.evidenceMatrix.unevidencedQualifications.map((u) => `  - ${u.item}: ${u.note}`).join('\n')}

4. OUTSTANDING CLARIFICATIONS
${reviewData.outstandingClarifications.map((c) => `  - ${c}`).join('\n')}
`;

      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top action bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500 text-white">
            <FileSearch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              Internal Applicant Review & Gap Analysis
            </h3>
            <p className="text-[11px] text-slate-500">
              Target: <span className="font-semibold text-slate-700">{role}</span> at{' '}
              <span className="font-semibold text-slate-700">{employer}</span>
            </p>
          </div>
        </div>

        <button
          onClick={copyToClipboard}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Copied Review Note!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Review Note</span>
            </>
          )}
        </button>
      </div>

      {/* Adjustments Section: Emphasized, Shortened, Removed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Emphasized */}
        <div className="bg-white rounded-xl p-4 border border-emerald-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold text-xs">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Emphasized Material</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2">
            {reviewData.adjustments.emphasized.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Shortened */}
        <div className="bg-white rounded-xl p-4 border border-blue-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-xs">
            <Scissors className="w-4 h-4 text-blue-600" />
            <span>Shortened / Condensed</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2">
            {reviewData.adjustments.shortened.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Removed or Deprioritized */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-xs">
            <FileSearch className="w-4 h-4 text-slate-500" />
            <span>Deprioritized / Removed</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2">
            {reviewData.adjustments.removedOrDeprioritized.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Confirmed Gaps & Unevidenced Qualifications */}
      <div className="bg-white rounded-xl border border-rose-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-3 border-b border-rose-100 pb-2">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <span>Significant Qualification Gaps (Preserved Honestly)</span>
          </div>
          <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            Internal Note Only • Never Fabricated
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          The following required or preferred qualifications in the employer's Job Description are absent from the candidate's CV. In accordance with strict factual rules, they were not added to the CV or letter:
        </p>

        <div className="space-y-3">
          {reviewData.evidenceMatrix.confirmedGaps.map((gap, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-rose-50/50 border border-rose-100 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
            >
              <div>
                <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {gap.jobRequirement}
                </div>
                <div className="text-xs text-rose-900/80 mt-1">
                  {gap.gapExplanation}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 self-start ${
                  gap.severity === 'high'
                    ? 'bg-rose-600 text-white'
                    : gap.severity === 'medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {gap.severity} impact
              </span>
            </div>
          ))}

          {reviewData.evidenceMatrix.unevidencedQualifications &&
            reviewData.evidenceMatrix.unevidencedQualifications.length > 0 && (
              <div className="mt-4 pt-3 border-t border-rose-100">
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  Additional Unevidenced Qualifications / Context Needed:
                </div>
                <div className="space-y-1.5">
                  {reviewData.evidenceMatrix.unevidencedQualifications.map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">{item.item}:</strong> {item.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Evidence Mapping: Direct Evidence & Transferable Skills */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2 text-slate-900 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          <span>Evidence Mapping Matrix</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 text-emerald-800">
              Direct Evidence in CV
            </h4>
            <div className="space-y-2">
              {reviewData.evidenceMatrix.directEvidence.map((d, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs">
                  <div className="font-semibold text-emerald-950">JD: {d.jobRequirement}</div>
                  <div className="text-emerald-800 mt-0.5 font-mono text-[11px]">
                    CV Proof: {d.cvEvidence}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 text-blue-800">
              Transferable Skills
            </h4>
            <div className="space-y-2">
              {reviewData.evidenceMatrix.transferableSkills.map((t, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 text-xs">
                  <div className="font-semibold text-blue-950">JD: {t.jobRequirement}</div>
                  <div className="text-blue-800 mt-0.5">
                    <strong>Skill:</strong> {t.candidateSkill}
                  </div>
                  <div className="text-blue-700/80 text-[11px] mt-0.5">{t.relevance}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Outstanding Clarifications */}
      {reviewData.outstandingClarifications && reviewData.outstandingClarifications.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 shadow-xs p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Outstanding Clarifications to Confirm with Candidate</span>
          </div>
          <ul className="text-xs text-amber-950 space-y-1.5 pl-1">
            {reviewData.outstandingClarifications.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
