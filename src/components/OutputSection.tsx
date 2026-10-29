import React, { useState } from 'react';
import {
  FileText,
  Mail,
  FileSearch,
  ShieldCheck,
  Building,
  Briefcase,
  Copy,
  Check,
  Printer,
} from 'lucide-react';
import { TailorResponse } from '../types/tailor';
import { A4CvViewer } from './A4CvViewer';
import { MotivationalLetterViewer } from './MotivationalLetterViewer';
import { ReviewNoteViewer } from './ReviewNoteViewer';
import { FactualAuditViewer } from './FactualAuditViewer';

interface OutputSectionProps {
  result: TailorResponse;
  candidateName: string;
}

export const OutputSection: React.FC<OutputSectionProps> = ({ result, candidateName }) => {
  const [activeTab, setActiveTab] = useState<'cv' | 'letter' | 'review' | 'audit'>('cv');
  const [copiedAll, setCopiedAll] = useState(false);

  const employer = result.identifiedEmployer || 'Target Employer';
  const role = result.identifiedPosition || 'Target Position';
  const name = result.tailoredCv.name || candidateName || 'Candidate';

  const copyAllDocuments = async () => {
    try {
      const allText = `==============================
DOCUMENT 1: TAILORED CV
==============================
${result.tailoredCv.rawText}

==============================
DOCUMENT 2: MOTIVATIONAL LETTER
==============================
${result.motivationalLetter.rawText || result.motivationalLetter.bodyParagraphs.join('\n\n')}

==============================
DOCUMENT 3: APPLICATION REVIEW NOTE
==============================
Target: ${role} at ${employer}

ADJUSTMENTS:
- Emphasized: ${result.reviewNote.adjustments.emphasized.join(', ')}
- Shortened: ${result.reviewNote.adjustments.shortened.join(', ')}
- Deprioritized: ${result.reviewNote.adjustments.removedOrDeprioritized.join(', ')}

CONFIRMED QUALIFICATION GAPS (Absent from CV):
${result.reviewNote.evidenceMatrix.confirmedGaps.map((g) => `- [${g.severity}] ${g.jobRequirement}: ${g.gapExplanation}`).join('\n')}

OUTSTANDING CLARIFICATIONS:
${result.reviewNote.outstandingClarifications.map((c) => `- ${c}`).join('\n')}
`;
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2200);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 md:p-6 transition-all my-6">
      {/* Target Role & Employer Summary Banner */}
      <div className="mb-6 p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
            Target Opportunity Identified
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              {role}
            </h2>
            <span className="text-slate-400 text-sm flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" />
              {employer}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={copyAllDocuments}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>All 3 Documents Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy All 3 Documents</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs for the 3 Separate Documents + Audit */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('cv')}
            className={`py-3 px-3.5 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 rounded-t-lg flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'cv'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Tailored CV</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
              1-Page A4
            </span>
          </button>

          <button
            onClick={() => setActiveTab('letter')}
            className={`py-3 px-3.5 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 rounded-t-lg flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'letter'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>2. Motivational Letter</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-normal ${
                result.motivationalLetter.wordCountCompliant
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {result.motivationalLetter.wordCount}w
            </span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`py-3 px-3.5 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 rounded-t-lg flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'review'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>3. Application Review Note</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-normal">
              {result.reviewNote.evidenceMatrix.confirmedGaps.length} Gaps Flagged
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3.5 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 rounded-t-lg flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Factual Audit & Verification</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-normal">
              Verified
            </span>
          </button>
        </nav>
      </div>

      {/* Active Tab Views */}
      <div>
        {activeTab === 'cv' && (
          <A4CvViewer cvData={result.tailoredCv} employer={employer} role={role} />
        )}

        {activeTab === 'letter' && (
          <MotivationalLetterViewer
            letterData={result.motivationalLetter}
            employer={employer}
            role={role}
            candidateName={name}
          />
        )}

        {activeTab === 'review' && (
          <ReviewNoteViewer reviewData={result.reviewNote} employer={employer} role={role} />
        )}

        {activeTab === 'audit' && (
          <FactualAuditViewer
            reviewNote={result.reviewNote}
            a4FitVerified={result.tailoredCv.a4PageFitVerified}
            a4FitNotes={result.tailoredCv.a4FitNotes}
            wordCount={result.motivationalLetter.wordCount}
            wordCountCompliant={result.motivationalLetter.wordCountCompliant}
          />
        )}
      </div>
    </div>
  );
};
