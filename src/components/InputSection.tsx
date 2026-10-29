import React from 'react';
import { FileText, Briefcase, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface InputSectionProps {
  cv: string;
  setCv: (val: string) => void;
  jobDescription: string;
  setJobDescription: (val: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  cv,
  setCv,
  jobDescription,
  setJobDescription,
  onSubmit,
  isProcessing,
}) => {
  const cvWordCount = cv.trim() ? cv.trim().split(/\s+/).length : 0;
  const jdWordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 md:p-6 transition-all">
      {/* Two Required Text Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Candidate CV Panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="candidate-cv-input"
              className="text-sm font-semibold text-slate-800 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Candidate CV</span>
              <span className="text-[11px] font-normal text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                Required
              </span>
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {cvWordCount} words
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-2">
            Paste the candidate's existing CV or factual career notes. Application materials are drafted strictly from verified information here.
          </p>

          <div className="relative flex-1">
            <textarea
              id="candidate-cv-input"
              value={cv}
              onChange={(e) => setCv(e.target.value)}
              placeholder="Paste Candidate CV here... (e.g. contact details, employment history, employers, dates, metrics, education, and verified skills)"
              rows={12}
              className="w-full h-72 lg:h-80 p-3.5 text-xs sm:text-sm font-mono text-slate-800 bg-slate-50/60 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none leading-relaxed"
            />
            {cv && (
              <button
                type="button"
                onClick={() => setCv('')}
                className="absolute top-2.5 right-2.5 text-[11px] text-slate-400 hover:text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200/80 shadow-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Employer Job Description Panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="job-description-input"
              className="text-sm font-semibold text-slate-800 flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Job Description</span>
              <span className="text-[11px] font-normal text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                Required
              </span>
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {jdWordCount} words
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-2">
            Paste the employer's complete job vacancy text, target position title, key duties, and required/preferred qualifications.
          </p>

          <div className="relative flex-1">
            <textarea
              id="job-description-input"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste Job Description here... (e.g. hiring company, target position title, daily responsibilities, mandatory qualifications, and preferred tools)"
              rows={12}
              className="w-full h-72 lg:h-80 p-3.5 text-xs sm:text-sm font-mono text-slate-800 bg-slate-50/60 rounded-xl border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition resize-none leading-relaxed"
            />
            {jobDescription && (
              <button
                type="button"
                onClick={() => setJobDescription('')}
                className="absolute top-2.5 right-2.5 text-[11px] text-slate-400 hover:text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200/80 shadow-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Strict factual fidelity: Only supplied source documents will be used. Missing requirements are flagged as gaps, never fabricated.
          </span>
        </div>

        <button
          onClick={onSubmit}
          disabled={isProcessing}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isProcessing
              ? 'bg-indigo-400 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/20 active:scale-[0.98]'
          }`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Comparing Evidence & Tailoring...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Tailor Application Materials</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
