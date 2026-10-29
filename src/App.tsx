import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { ValidationBanner } from './components/ValidationBanner';
import { TailorResponse } from './types/tailor';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // App must start with two empty text fields
  const [cv, setCv] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [missingField, setMissingField] = useState<'cv' | 'jd' | 'both' | undefined>(undefined);
  const [serverError, setServerError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFocusField = (field: 'cv' | 'jd') => {
    if (field === 'cv') {
      const el = document.getElementById('candidate-cv-input');
      el?.focus();
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const el = document.getElementById('job-description-input');
      el?.focus();
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleTailor = async () => {
    setValidationError(null);
    setServerError(null);
    setMissingField(undefined);

    const hasCv = cv.trim().length > 0;
    const hasJd = jobDescription.trim().length > 0;

    // Rule: If either input is missing, display clear request and do not generate application materials
    if (!hasCv && !hasJd) {
      setMissingField('both');
      setValidationError(
        'Both "Candidate CV" and "Job Description" are missing. Please paste the candidate\'s existing CV and the employer\'s job description into the fields above to proceed.'
      );
      setResult(null);
      return;
    }

    if (!hasCv) {
      setMissingField('cv');
      setValidationError(
        'The "Candidate CV" document is missing. In accordance with strict factual fidelity rules, application materials cannot be fabricated without verified candidate information. Please paste the candidate\'s existing CV to proceed.'
      );
      setResult(null);
      return;
    }

    if (!hasJd) {
      setMissingField('jd');
      setValidationError(
        'The "Job Description" document is missing. Please paste the employer\'s complete job description so requirements can be identified and verified against candidate experience.'
      );
      setResult(null);
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/tailor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cv: cv.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data: TailorResponse = await response.json();

      if (!data.isValidInput) {
        setValidationError(
          data.missingInformationReason ||
            'Required source document is missing or contradictory. Please check your inputs.'
        );
        setResult(null);
      } else {
        setResult(data);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (err: any) {
      console.error(err);
      setServerError(
        err.message || 'An error occurred while communicating with the Application Tailor engine.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 font-sans antialiased flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Rules & Fidelity Guarantee Strip */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800">Strict Factual Fidelity:</span>
              <p className="text-slate-500">Only supplied facts used; never hallucinates skills or outside info.</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800">1-Page A4 ATS CV:</span>
              <p className="text-slate-500">Readable single page layout with plain ASCII hyphens (-) for bullets.</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800">400–700w Motivational Letter:</span>
              <p className="text-slate-500">Evidence-linked body paragraphs connecting real CV facts to JD duties.</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800">Separated Gap Analysis:</span>
              <p className="text-slate-500">Flags missing JD criteria as gaps in a review note, never in employer docs.</p>
            </div>
          </div>
        </div>

        {/* Two Empty Input Fields: Candidate CV and Job Description */}
        <InputSection
          cv={cv}
          setCv={setCv}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          onSubmit={handleTailor}
          isProcessing={isProcessing}
        />

        {/* Clear Request When Either Input is Missing */}
        {validationError && (
          <ValidationBanner
            message={validationError}
            missingField={missingField}
            onFocusField={handleFocusField}
          />
        )}

        {/* Server Error Alert */}
        {serverError && (
          <div className="my-6 p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs shadow-sm transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-950">
                    Temporary Generation Issue
                  </h4>
                  <p className="text-xs text-rose-900 mt-0.5 leading-relaxed font-medium">
                    {serverError}
                  </p>
                  <p className="text-[11px] text-rose-700/80 mt-1">
                    Both of your input fields ("Candidate CV" and "Job Description") have been safely preserved.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTailor}
                disabled={isProcessing}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-semibold text-xs shadow-sm transition cursor-pointer shrink-0 self-start sm:self-center"
              >
                <span>Retry Generation</span>
              </button>
            </div>
          </div>
        )}

        {/* Output Section with 3 Separate Documents + Audit Matrix */}
        <div ref={resultsRef}>
          {result && result.isValidInput && (
            <OutputSection
              result={result}
              candidateName={result.tailoredCv?.name || ''}
            />
          )}
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Application Tailor • Verified Career Document Drafting System</span>
          <span className="font-mono text-[11px] text-slate-400">
            Source-Constrained • 1-Page A4 • 400-700w Letter • ASCII Hyphen Lists • No Hallucinations
          </span>
        </div>
      </footer>
    </div>
  );
}
