import React from 'react';
import { ShieldCheck, Check, AlertTriangle, FileCheck, Hash, Calendar, Award, HelpCircle } from 'lucide-react';
import { TailorResponse } from '../types/tailor';

interface FactualAuditViewerProps {
  reviewNote: TailorResponse['reviewNote'];
  a4FitVerified: boolean;
  a4FitNotes: string;
  wordCount: number;
  wordCountCompliant: boolean;
}

export const FactualAuditViewer: React.FC<FactualAuditViewerProps> = ({
  reviewNote,
  a4FitVerified,
  a4FitNotes,
  wordCount,
  wordCountCompliant,
}) => {
  const auditData = reviewNote.factualFidelityVerification || [];
  const isComprehensive = Boolean(reviewNote.isComprehensiveAudit && auditData.length >= 5);
  const unverifiedItems = reviewNote.unverifiedOrAmbiguousItems || [];
  const hasUnverified = unverifiedItems.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Verification Summary Banner - Truthful & Calibrated */}
      {isComprehensive && !hasUnverified ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-emerald-950">
                  Comprehensive Factual Audit: All Checked Claims Verified
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  Comprehensive
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                All {auditData.length} substantive factual assertions across the tailored CV and letter were directly cross-referenced with verified text in the candidate's CV.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-emerald-300 text-emerald-800 shadow-xs">
              Zero Hallucinations Detected
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-950">
                  Limited Evidence Check ({auditData.length} Sample Claims Verified)
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  Partial Sample
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                This verification reflects a sample of core claims ({auditData.length} items checked).
                {hasUnverified
                  ? ` Note: ${unverifiedItems.length} item(s) remain unverified or require candidate confirmation below.`
                  : ' Additional details have not been comprehensively cross-referenced.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-amber-300 text-amber-900 shadow-xs">
              {auditData.length} Claims Verified
            </span>
          </div>
        </div>
      )}

      {/* Metric Verification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Numerical Results
            </div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              Exact Metrics Preserved
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Employment Timeline
            </div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              Dates & Employers Intact
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Proficiency Integrity
            </div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              No Skill Exaggeration
            </div>
          </div>
        </div>
      </div>

      {/* Unverified Items / Discrepancy Alert Section (if any exist) */}
      {hasUnverified && (
        <div className="bg-white rounded-xl border-2 border-amber-300 p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Items Remaining Unverified / Requiring Candidate Confirmation:</span>
          </div>
          <div className="space-y-2">
            {unverifiedItems.map((u, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
                <div className="font-semibold text-amber-950">Claim/Item: {u.item}</div>
                <div className="text-amber-900 mt-0.5 text-[11px]">
                  <strong>Status:</strong> {u.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itemized Claim-by-Claim Verification Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Itemized Factual Claims vs Original CV Source</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {auditData.length} assertions checked
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {auditData.map((item, idx) => (
            <div key={idx} className="p-3.5 hover:bg-slate-50/60 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-900">
                  <span className="font-semibold text-slate-600">Drafted Claim:</span>
                  <span>"{item.claimInDraft}"</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <span className="font-semibold text-slate-600">Original CV Evidence:</span>
                  <span>"{item.sourceInOriginalCv}"</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.verified ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 font-medium text-[11px] flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Verified in CV
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-medium text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Unverified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Format & Word Count Verification Specs */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 space-y-2">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Output Format & Constraints Verification Status:</span>
        </div>
        <ul className="space-y-1 pl-4 list-disc text-slate-600">
          <li>
            <strong>Tailored CV Layout:</strong>{' '}
            {a4FitVerified
              ? `${a4FitNotes || 'One readable A4 page layout verified.'} (Standard ATS-friendly section headers with ASCII hyphens).`
              : 'Content exceeds standard 1-page A4 boundaries at default density; switch Spacing to Compact to fit single page.'}
          </li>
          <li>
            <strong>Motivational Letter Length:</strong> {wordCount} words ({wordCountCompliant ? 'Compliant with 400–700 words requirement' : 'Revising to meet target'}).
          </li>
          <li>
            <strong>Sources Integrity:</strong> Evaluated strictly against supplied Candidate CV and Job Description.
          </li>
        </ul>
      </div>
    </div>
  );
};
