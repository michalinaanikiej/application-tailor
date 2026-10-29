import React from 'react';
import { ShieldCheck, Sparkles, FileCheck, Layers } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-sm">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Application Tailor</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Factual Fidelity Guard
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Evidence-based CV tailoring, 400–700w motivational letters & ATS-verified gap analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium text-slate-700">3 Separate Outputs</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200/60 text-blue-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini 3.8 Flash</span>
          </div>
        </div>
      </div>
    </header>
  );
};
