import React from 'react';
import { ShieldAlert, ArrowUpRight, HelpCircle } from 'lucide-react';

interface ValidationBannerProps {
  message: string;
  missingField?: 'cv' | 'jd' | 'both';
  onFocusField?: (field: 'cv' | 'jd') => void;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({
  message,
  missingField,
  onFocusField,
}) => {
  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 md:p-6 shadow-sm my-6 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-amber-950">
              Required Source Document Missing
            </h3>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
              Decline & Ask Mode
            </span>
          </div>

          <p className="text-sm text-amber-900 mt-1.5 leading-relaxed font-semibold">
            {message}
          </p>

          <div className="mt-4 p-3 bg-white/90 rounded-xl border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Strict Rule:</strong> Application Tailor operates exclusively on supplied documents and will never fabricate candidate details, employers, or qualifications.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {(missingField === 'cv' || missingField === 'both') && onFocusField && (
                <button
                  type="button"
                  onClick={() => onFocusField('cv')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
                >
                  <span>Paste Candidate CV</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}

              {(missingField === 'jd' || missingField === 'both') && onFocusField && (
                <button
                  type="button"
                  onClick={() => onFocusField('jd')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
                >
                  <span>Paste Job Description</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
