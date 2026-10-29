import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Printer, CheckCircle2, AlertTriangle, Code, Eye, Sliders } from 'lucide-react';
import { TailorResponse } from '../types/tailor';

interface A4CvViewerProps {
  cvData: TailorResponse['tailoredCv'];
  employer: string;
  role: string;
}

export const A4CvViewer: React.FC<A4CvViewerProps> = ({ cvData, employer, role }) => {
  const [copiedFormat, setCopiedFormat] = useState<'text' | 'markdown' | null>(null);
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [spacingDensity, setSpacingDensity] = useState<'balanced' | 'spacious' | 'compact'>('balanced');
  const [fitsOnSinglePage, setFitsOnSinglePage] = useState<boolean>(true);
  const [measuredHeight, setMeasuredHeight] = useState<number>(0);

  const printableContainerRef = useRef<HTMLDivElement>(null);

  // Monitor and measure actual layout height against A4 single-page budget
  useEffect(() => {
    const evaluateA4Fit = () => {
      if (!printableContainerRef.current) return;
      // In standard CSS at 96 DPI: A4 is 794px width x 1123px height.
      // With padding/margins, content height must remain <= 1123px to avoid creating page 2.
      const scrollH = printableContainerRef.current.scrollHeight;
      setMeasuredHeight(scrollH);

      // If content scrollHeight exceeds 1125px or AI marked fit as false, do not claim verified
      const doesFit = scrollH <= 1125 && cvData.a4PageFitVerified !== false;
      setFitsOnSinglePage(doesFit);
    };

    evaluateA4Fit();
    const timer = setTimeout(evaluateA4Fit, 120);
    window.addEventListener('resize', evaluateA4Fit);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', evaluateA4Fit);
    };
  }, [cvData, spacingDensity, viewMode]);

  // Handle Ctrl+P / browser print shortcut synchronization
  useEffect(() => {
    const handleBeforePrint = () => {
      if (!document.body.classList.contains('print-letter-mode')) {
        document.body.classList.add('print-cv-mode');
      }
    };
    const handleAfterPrint = () => {
      document.body.classList.remove('print-cv-mode');
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const copyToClipboard = async (text: string, format: 'text' | 'markdown') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2200);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    // If currently in raw text mode, switch to rendered mode so A4 container is present
    if (viewMode !== 'rendered') {
      setViewMode('rendered');
    }

    // Set dedicated print class for CV
    document.body.classList.add('print-cv-mode');
    document.body.classList.remove('print-letter-mode');

    const originalTitle = document.title;
    document.title = `${cvData.name} - Tailored CV (${role})`;

    // Allow any DOM state to settle before invoking browser print dialog
    setTimeout(() => {
      try {
        window.focus();
        window.print();
      } catch (err) {
        console.error('Print dialog failed to open:', err);
      } finally {
        setTimeout(() => {
          document.title = originalTitle;
          document.body.classList.remove('print-cv-mode');
        }, 1500);
      }
    }, 100);
  };

  // Generate markdown representation with ASCII hyphens
  const markdownText = `# ${cvData.name}
${cvData.contactLine}

## PROFESSIONAL SUMMARY
${cvData.summary}

## CORE SKILLS & COMPETENCIES
${cvData.skills.map((s) => `- ${s}`).join('\n')}

## PROFESSIONAL EXPERIENCE
${cvData.experience
  .map(
    (exp) => `### ${exp.role} — ${exp.company}
*${exp.dates}${exp.location ? ` | ${exp.location}` : ''}*
${exp.bulletPoints.map((b) => `- ${b.replace(/^[•\-\*]\s*/, '')}`).join('\n')}`
  )
  .join('\n\n')}

## EDUCATION
${cvData.education
  .map(
    (edu) => `### ${edu.degree} — ${edu.institution}
*${edu.dates || ''}*
${edu.details ? `${edu.details}` : ''}`
  )
  .join('\n\n')}
`;

  // Spacing configurations: ensures both on-screen view and print layout respect density selection
  const densityStyles = {
    balanced: {
      padding: 'p-8 sm:p-11 print:p-8',
      sectionGap: 'mb-4 print:mb-3.5',
      bulletGap: 'space-y-1.5 print:space-y-1',
      jobGap: 'space-y-3.5 print:space-y-3',
      bodyText: 'text-[12px] print:text-[11px] leading-relaxed print:leading-snug',
      label: 'Balanced',
    },
    spacious: {
      padding: 'p-10 sm:p-13 print:p-10',
      sectionGap: 'mb-5 print:mb-4.5',
      bulletGap: 'space-y-2.5 print:space-y-2',
      jobGap: 'space-y-5 print:space-y-4',
      bodyText: 'text-[12.5px] print:text-[11.5px] leading-relaxed',
      label: 'Spacious',
    },
    compact: {
      padding: 'p-6 sm:p-8 print:p-5',
      sectionGap: 'mb-2.5 print:mb-2',
      bulletGap: 'space-y-1 print:space-y-0.5',
      jobGap: 'space-y-2.5 print:space-y-2',
      bodyText: 'text-[11px] print:text-[10px] leading-normal print:leading-tight',
      label: 'Compact',
    },
  };

  const currentDensity = densityStyles[spacingDensity];

  return (
    <div className="flex flex-col gap-4">
      {/* Document Top Bar Controls */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2.5">
          {/* Truthful 1-Page Verification Status Badge */}
          {fitsOnSinglePage ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Page A4 Layout Verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100/90 border border-amber-300 text-amber-800 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Layout Exceeds 1 A4 Page ({spacingDensity}) — Switch to Compact spacing</span>
            </div>
          )}

          <span className="text-xs text-slate-500 hidden md:inline">
            A4 (210 × 297 mm) • ASCII hyphens (-) for ATS
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Spacing Density Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs text-slate-600">
            <span className="px-1.5 text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Sliders className="w-3 h-3" /> Spacing:
            </span>
            <button
              onClick={() => setSpacingDensity('balanced')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                spacingDensity === 'balanced'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Balanced
            </button>
            <button
              onClick={() => setSpacingDensity('spacious')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                spacingDensity === 'spacious'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Spacious
            </button>
            <button
              onClick={() => setSpacingDensity('compact')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                spacingDensity === 'compact'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Compact
            </button>
          </div>

          {/* Mode toggle */}
          <div className="bg-white border border-slate-200 rounded-lg p-0.5 flex items-center text-xs">
            <button
              onClick={() => setViewMode('rendered')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'rendered'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>A4 Document</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'raw'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Plain ATS Text</span>
            </button>
          </div>

          {/* Copy Plain Text */}
          <button
            onClick={() => copyToClipboard(cvData.rawText || markdownText, 'text')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Copy plain ASCII text directly into Word or ATS forms"
          >
            {copiedFormat === 'text' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy ATS Text</span>
              </>
            )}
          </button>

          {/* Print / PDF */}
          <button
            id="print-cv-button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* A4 Document Viewport Container */}
      {viewMode === 'rendered' ? (
        <div className="flex justify-center bg-slate-100/70 p-3 sm:p-6 rounded-2xl border border-slate-200/80 overflow-x-auto">
          {/* Authentic A4 Page Simulation: 210mm x 297mm proportion, constrained to single page */}
          <div
            id="a4-cv-printable"
            ref={printableContainerRef}
            className={`w-full max-w-[794px] min-h-[1080px] bg-white text-slate-900 ${currentDensity.padding} shadow-md rounded-sm border border-slate-300/80 font-sans flex flex-col justify-between`}
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            <div>
              {/* Header: Candidate Name & Contact Details */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
                  {cvData.name}
                </h1>
                <div className="text-xs text-slate-600 mt-2 font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
                  {cvData.contactLine}
                </div>
              </div>

              {/* Professional Summary */}
              {cvData.summary && (
                <div className={currentDensity.sectionGap}>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2.5 flex items-center justify-between">
                    <span>Professional Profile</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase tracking-normal">target: {role}</span>
                  </h2>
                  <p className={`${currentDensity.bodyText} text-slate-700 font-normal`}>
                    {cvData.summary}
                  </p>
                </div>
              )}

              {/* Core Competencies / Skills */}
              {cvData.skills && cvData.skills.length > 0 && (
                <div className={currentDensity.sectionGap}>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2.5">
                    Core Skills & Qualifications
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-800">
                    {cvData.skills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0 select-none" />
                        <span className="font-medium text-slate-800 text-[12px]">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Experience */}
              {cvData.experience && cvData.experience.length > 0 && (
                <div className={currentDensity.sectionGap}>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">
                    Professional Experience
                  </h2>
                  <div className={currentDensity.jobGap}>
                    {cvData.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs pb-0.5">
                          <div className="font-bold text-slate-950 text-[13.5px]">
                            {exp.role} <span className="font-semibold text-slate-700">| {exp.company}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {exp.dates} {exp.location ? `• ${exp.location}` : ''}
                          </div>
                        </div>

                        {/* List items with strict ASCII hyphens (-) */}
                        <ul className={`list-none ${currentDensity.bulletGap} pl-0.5`}>
                          {exp.bulletPoints.map((bp, bIdx) => {
                            const cleanText = bp.replace(/^[•\-\*]\s*/, '');
                            return (
                              <li key={bIdx} className={`flex items-start gap-2 ${currentDensity.bodyText} text-slate-700`}>
                                <span className="text-slate-500 font-mono font-bold select-none shrink-0">-</span>
                                <span>{cleanText}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {cvData.education && cvData.education.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2.5">
                    Education & Credentials
                  </h2>
                  <div className="space-y-2">
                    {cvData.education.map((edu, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 text-[13px]">{edu.degree}</span>
                          <span className="text-slate-700 font-medium"> — {edu.institution}</span>
                          {edu.details && <span className="text-slate-500 text-[11px]"> ({edu.details})</span>}
                        </div>
                        {edu.dates && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            {edu.dates}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* A4 Footer Verification Badge */}
            <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-400 flex items-center justify-between font-mono mt-6">
              <span>Target Role: {role} • {employer}</span>
              <span>
                {fitsOnSinglePage
                  ? '1 Page A4 Verified • ASCII Hyphen Lists (-)'
                  : 'Spacing Adjustment Required to Fit 1 Page • ASCII Hyphen Lists (-)'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Plain Text View (Perfect for pasting into ATS portals or Word) */
        <div className="relative">
          <textarea
            readOnly
            value={cvData.rawText || markdownText}
            rows={22}
            className="w-full p-4 font-mono text-xs sm:text-sm bg-slate-900 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none leading-relaxed"
          />
        </div>
      )}

      {/* A4 Verification Notes Bar */}
      {cvData.a4FitNotes && (
        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">A4 Page-Fit Distribution:</span>
            <span>{cvData.a4FitNotes}</span>
          </div>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
              fitsOnSinglePage
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-amber-800 bg-amber-50 border-amber-200'
            }`}
          >
            {fitsOnSinglePage ? 'A4 1-Page Enforced' : 'Exceeds 1-Page A4'}
          </span>
        </div>
      )}
    </div>
  );
};

