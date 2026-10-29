import React, { useState, useEffect } from 'react';
import { Copy, Check, CheckCircle2, AlertTriangle, Printer, Mail, Eye, Code } from 'lucide-react';
import { TailorResponse } from '../types/tailor';

interface MotivationalLetterViewerProps {
  letterData: TailorResponse['motivationalLetter'];
  employer: string;
  role: string;
  candidateName: string;
}

export const MotivationalLetterViewer: React.FC<MotivationalLetterViewerProps> = ({
  letterData,
  employer,
  role,
  candidateName,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');

  // Handle Ctrl+P / browser print shortcut synchronization
  useEffect(() => {
    const handleBeforePrint = () => {
      if (!document.body.classList.contains('print-cv-mode')) {
        document.body.classList.add('print-letter-mode');
      }
    };
    const handleAfterPrint = () => {
      document.body.classList.remove('print-letter-mode');
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const copyToClipboard = async () => {
    try {
      const fullLetter = `${letterData.recipient}
Re: Application for ${letterData.roleApplied} at ${employer}

${letterData.opening}

${letterData.bodyParagraphs.join('\n\n')}

${letterData.closing}

${letterData.signOff}
${candidateName}`;

      await navigator.clipboard.writeText(letterData.rawText || fullLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    if (viewMode !== 'rendered') {
      setViewMode('rendered');
    }

    document.body.classList.add('print-letter-mode');
    document.body.classList.remove('print-cv-mode');

    const originalTitle = document.title;
    document.title = `${candidateName} - Motivational Letter (${role} at ${employer})`;

    setTimeout(() => {
      try {
        window.focus();
        window.print();
      } catch (err) {
        console.error('Print dialog failed to open:', err);
      } finally {
        setTimeout(() => {
          document.title = originalTitle;
          document.body.classList.remove('print-letter-mode');
        }, 1500);
      }
    }, 100);
  };

  const isCompliant = letterData.wordCount >= 400 && letterData.wordCount <= 700;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Bar with Word Count & Compliance Badges */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Word Count Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${
              isCompliant
                ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800'
                : 'bg-amber-100/70 border-amber-300 text-amber-800'
            }`}
          >
            {isCompliant ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>
              {letterData.wordCount} words {isCompliant ? '(Target 400–700 Met)' : '(Out of 400–700 range)'}
            </span>
          </div>

          <span className="text-xs text-slate-500 hidden sm:inline">
            Evidence-based paragraphs • Zero unsubstantiated fluff
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="bg-white border border-slate-200 rounded-lg p-0.5 flex items-center text-xs">
            <button
              onClick={() => setViewMode('rendered')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition ${
                viewMode === 'rendered'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Letter Format</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition ${
                viewMode === 'raw'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Plain Text</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied Letter!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Letter</span>
              </>
            )}
          </button>

          <button
            id="print-letter-button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Rendered Letter view */}
      {viewMode === 'rendered' ? (
        <div className="flex justify-center bg-slate-100/70 p-3 sm:p-6 rounded-2xl border border-slate-200/80">
          <div
            id="motivational-letter-printable"
            className="w-full max-w-2xl bg-white p-8 sm:p-12 rounded-xl border border-slate-200 shadow-sm text-slate-800 font-sans leading-relaxed text-sm"
          >
            {/* Header / Recipient */}
            <div className="mb-6 pb-4 border-b border-slate-100 text-xs text-slate-500 space-y-1">
              <div className="font-semibold text-slate-800 text-sm">{letterData.recipient}</div>
              <div>{employer}</div>
              <div className="text-indigo-600 font-medium">Re: Position of {role || letterData.roleApplied}</div>
            </div>

            {/* Opening Paragraph */}
            <div className="mb-4 text-slate-800 font-normal leading-relaxed">
              {letterData.opening}
            </div>

            {/* Body Paragraphs */}
            <div className="space-y-4 mb-5 text-slate-700 leading-relaxed">
              {letterData.bodyParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Closing */}
            <div className="mb-6 text-slate-800 leading-relaxed">
              {letterData.closing}
            </div>

            {/* Sign off */}
            <div className="pt-2 text-slate-900">
              <div className="font-medium">{letterData.signOff}</div>
              <div className="font-bold mt-1 text-slate-800">{candidateName}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <textarea
            readOnly
            value={
              letterData.rawText ||
              `${letterData.recipient}\nRe: ${letterData.roleApplied} at ${employer}\n\n${letterData.opening}\n\n${letterData.bodyParagraphs.join(
                '\n\n'
              )}\n\n${letterData.closing}\n\n${letterData.signOff}\n${candidateName}`
            }
            rows={18}
            className="w-full p-4 font-mono text-xs sm:text-sm bg-slate-900 text-blue-300 rounded-xl border border-slate-800 focus:outline-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
