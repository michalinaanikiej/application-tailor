export interface TailorResponse {
  isValidInput: boolean;
  missingInformationReason?: string;
  identifiedEmployer: string;
  identifiedPosition: string;
  tailoredCv: {
    rawText: string;
    name: string;
    contactLine: string;
    summary: string;
    skills: string[];
    experience: Array<{
      role: string;
      company: string;
      dates: string;
      location?: string;
      bulletPoints: string[];
    }>;
    education: Array<{
      degree: string;
      institution: string;
      dates?: string;
      details?: string;
    }>;
    a4PageFitVerified: boolean;
    a4FitNotes: string;
  };
  motivationalLetter: {
    rawText: string;
    wordCount: number;
    wordCountCompliant: boolean;
    recipient: string;
    roleApplied: string;
    opening: string;
    bodyParagraphs: string[];
    closing: string;
    signOff: string;
  };
  reviewNote: {
    adjustments: {
      emphasized: string[];
      shortened: string[];
      removedOrDeprioritized: string[];
    };
    evidenceMatrix: {
      directEvidence: Array<{
        jobRequirement: string;
        cvEvidence: string;
      }>;
      transferableSkills: Array<{
        jobRequirement: string;
        candidateSkill: string;
        relevance: string;
      }>;
      confirmedGaps: Array<{
        jobRequirement: string;
        gapExplanation: string;
        severity: 'high' | 'medium' | 'low';
      }>;
      unevidencedQualifications: Array<{
        item: string;
        note: string;
      }>;
    };
    outstandingClarifications: string[];
    factualFidelityVerification: Array<{
      claimInDraft: string;
      sourceInOriginalCv: string;
      isExactMatch: boolean;
      verified: boolean;
    }>;
    isComprehensiveAudit: boolean;
    unverifiedOrAmbiguousItems: Array<{
      item: string;
      reason: string;
    }>;
  };
}
