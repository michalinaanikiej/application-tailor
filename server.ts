import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { TailorResponse } from './src/types/tailor';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/tailor', async (req, res) => {
  try {
    const { cv, jobDescription } = req.body;

    const hasCv = cv && typeof cv === 'string' && cv.trim().length > 0;
    const hasJd =
      jobDescription && typeof jobDescription === 'string' && jobDescription.trim().length > 0;

    // Rule: Validate inputs. If either input is missing, display clear request and do not generate materials.
    if (!hasCv && !hasJd) {
      return res.json({
        isValidInput: false,
        missingField: 'both',
        missingInformationReason:
          'Both the Candidate CV and Job Description are missing. Please paste both source documents to generate tailored application materials.',
        identifiedEmployer: '',
        identifiedPosition: '',
      });
    }

    if (!hasCv) {
      return res.json({
        isValidInput: false,
        missingField: 'cv',
        missingInformationReason:
          "Candidate CV is missing. In accordance with strict factual fidelity rules, application materials cannot be fabricated without verified candidate information. Please provide the candidate's existing CV to tailor application materials.",
        identifiedEmployer: '',
        identifiedPosition: '',
      });
    }

    if (!hasJd) {
      return res.json({
        isValidInput: false,
        missingField: 'jd',
        missingInformationReason:
          'Job Description is missing. Please provide the complete employer job description so the application materials can be matched against verified requirements.',
        identifiedEmployer: '',
        identifiedPosition: '',
      });
    }

    const systemInstruction = `You are "Application Tailor", an expert career drafting and verification engine.
Your sole mission is to produce factually rigorous, ATS-friendly application materials (Tailored CV, Motivational Letter, Application Review Note) by comparing the candidate's verified CV against the employer's Job Description.

STRICT CONSTITUTIONAL RULES:
1. SOURCES: Use ONLY the explicitly supplied Candidate CV and Job Description. Never use outside knowledge, assumed skills, or imaginary career steps.
2. ZERO HALLUCINATION / ZERO EXAGGERATION:
   - Never invent or exaggerate qualifications, experience, proficiency, tools, or results.
   - Never infer candidate skills from job requirements (e.g. if the job asks for Asana, Jira, Salesforce, PPC, or leadership and it is not in the CV, do NOT include it in the CV or letter; flag it in the Review Note as a confirmed gap).
   - Preserve exact metrics, numbers, employers, dates, and proficiency levels (e.g., "45-supplier tracker", "1,800 subscribers with 32% open rate", "calendar for five staff", "basic Excel proficiency", "five workshops and approx 80 attendees"). Do not upgrade "basic Excel" to "intermediate" or "advanced".
3. TAILORED CV (EVEN A4 PAGE DISTRIBUTION):
   - Must fit within exactly one standard A4 page when rendered, utilizing the page vertically with balanced, professional distribution without spilling onto a second page.
   - Avoid generating an overly sparse document that only fills a fraction of the page.
   - For each work experience entry, provide 3 to 5 detailed, evidence-rich bullet points detailing verified day-to-day responsibilities, workflows, tracking systems, software tools, and deliverables directly from the CV so the page is filled evenly and professionally.
   - Use standard ATS-friendly section headers: PROFESSIONAL SUMMARY, CORE SKILLS & COMPETENCIES, PROFESSIONAL EXPERIENCE, EDUCATION & CREDENTIALS.
   - Use plain ASCII hyphens (-) for all bullet points in list items. Never use special bullet characters or fancy symbols.
   - Re-order and emphasize relevant accomplishments from the CV; condense less relevant information without deleting foundational facts.
4. MOTIVATIONAL LETTER (STRICT 400–700 WORDS):
   - Word count MUST be between 400 and 700 words (aim for 480–560 words).
   - Write at least 4 well-developed paragraphs: an introductory paragraph identifying the role and verified alignment, 2 to 3 detailed evidence-based body paragraphs connecting verified achievements and workflows to job requirements, and a professional closing paragraph.
   - Never write a short letter under 400 words!
   - Tone: Confident, direct, evidence-based. No fluffy filler, generic clichés, or unsupported claims about the employer.
5. APPLICATION REVIEW NOTE & COMPREHENSIVE FACTUAL AUDIT:
   - Detailed accounting of adjustments: What was emphasized, what was shortened, what was removed or deprioritized.
   - Evidence Matrix:
     * Direct Evidence: Exact JD requirements directly backed by verified CV facts.
     * Transferable Skills: Candidate abilities that apply to the role with clear rationale.
     * Confirmed Gaps: Explicit JD requirements that have NO support in the candidate's CV (flagged clearly so the candidate is aware).
     * Unevidenced Qualifications / Clarifications: Ambiguities or missing details that need candidate input.
   - Comprehensive Factual Audit: Perform an itemized check of substantive factual assertions made across the draft against the original CV (candidate name, all employers, employment dates, job titles, exact numerical metrics like 45-supplier tracker or 1,800 subscribers, exact proficiency levels like basic Excel, and degrees).
   - 'isComprehensiveAudit': Set to true ONLY if all substantive factual claims across the draft were checked against the CV.
   - 'unverifiedOrAmbiguousItems': Explicitly identify any claims, assumptions, or ambiguities in the draft that could NOT be verified directly from the provided CV. If everything is verified, return an empty array.`;

    const userPrompt = `Please analyze the candidate's CV and the employer's Job Description below, and generate the tailored application materials and factual verification report in JSON format.

--- CANDIDATE CV ---
${cv}

--- EMPLOYER JOB DESCRIPTION ---
${jobDescription}
`;

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let lastError: any = null;
    let parsedData: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isValidInput: { type: Type.BOOLEAN },
                missingInformationReason: { type: Type.STRING },
                identifiedEmployer: { type: Type.STRING },
                identifiedPosition: { type: Type.STRING },
                tailoredCv: {
                  type: Type.OBJECT,
                  properties: {
                    rawText: {
                      type: Type.STRING,
                      description:
                        'Full ATS plain text of the 1-page CV using ASCII hyphens (-) for bullet points',
                    },
                    name: { type: Type.STRING },
                    contactLine: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    skills: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    experience: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          role: { type: Type.STRING },
                          company: { type: Type.STRING },
                          dates: { type: Type.STRING },
                          location: { type: Type.STRING },
                          bulletPoints: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'Bullet points starting with ASCII hyphen (-)',
                          },
                        },
                        required: ['role', 'company', 'dates', 'bulletPoints'],
                      },
                    },
                    education: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          degree: { type: Type.STRING },
                          institution: { type: Type.STRING },
                          dates: { type: Type.STRING },
                          details: { type: Type.STRING },
                        },
                        required: ['degree', 'institution'],
                      },
                    },
                    a4PageFitVerified: { type: Type.BOOLEAN },
                    a4FitNotes: { type: Type.STRING },
                  },
                  required: [
                    'rawText',
                    'name',
                    'contactLine',
                    'summary',
                    'skills',
                    'experience',
                    'education',
                    'a4PageFitVerified',
                    'a4FitNotes',
                  ],
                },
                motivationalLetter: {
                  type: Type.OBJECT,
                  properties: {
                    rawText: {
                      type: Type.STRING,
                      description:
                        'Complete text of the formal motivational letter, including salutation, body paragraphs, and sign-off. Must be between 420 and 650 words in length.',
                    },
                    wordCount: { type: Type.INTEGER },
                    wordCountCompliant: {
                      type: Type.BOOLEAN,
                      description: 'True if word count is between 400 and 700 words',
                    },
                    recipient: { type: Type.STRING },
                    roleApplied: { type: Type.STRING },
                    opening: { type: Type.STRING },
                    bodyParagraphs: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description:
                        'At least 3 substantial, evidence-based body paragraphs connecting verified CV facts to specific job duties.',
                    },
                    closing: { type: Type.STRING },
                    signOff: { type: Type.STRING },
                  },
                  required: [
                    'rawText',
                    'wordCount',
                    'wordCountCompliant',
                    'recipient',
                    'roleApplied',
                    'opening',
                    'bodyParagraphs',
                    'closing',
                    'signOff',
                  ],
                },
                reviewNote: {
                  type: Type.OBJECT,
                  properties: {
                    adjustments: {
                      type: Type.OBJECT,
                      properties: {
                        emphasized: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        shortened: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        removedOrDeprioritized: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['emphasized', 'shortened', 'removedOrDeprioritized'],
                    },
                    evidenceMatrix: {
                      type: Type.OBJECT,
                      properties: {
                        directEvidence: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              jobRequirement: { type: Type.STRING },
                              cvEvidence: { type: Type.STRING },
                            },
                            required: ['jobRequirement', 'cvEvidence'],
                          },
                        },
                        transferableSkills: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              jobRequirement: { type: Type.STRING },
                              candidateSkill: { type: Type.STRING },
                              relevance: { type: Type.STRING },
                            },
                            required: ['jobRequirement', 'candidateSkill', 'relevance'],
                          },
                        },
                        confirmedGaps: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              jobRequirement: { type: Type.STRING },
                              gapExplanation: { type: Type.STRING },
                              severity: { type: Type.STRING },
                            },
                            required: ['jobRequirement', 'gapExplanation', 'severity'],
                          },
                        },
                        unevidencedQualifications: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              item: { type: Type.STRING },
                              note: { type: Type.STRING },
                            },
                            required: ['item', 'note'],
                          },
                        },
                      },
                      required: [
                        'directEvidence',
                        'transferableSkills',
                        'confirmedGaps',
                        'unevidencedQualifications',
                      ],
                    },
                    outstandingClarifications: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    factualFidelityVerification: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          claimInDraft: { type: Type.STRING },
                          sourceInOriginalCv: { type: Type.STRING },
                          isExactMatch: { type: Type.BOOLEAN },
                          verified: { type: Type.BOOLEAN },
                        },
                        required: ['claimInDraft', 'sourceInOriginalCv', 'isExactMatch', 'verified'],
                      },
                      description: 'Comprehensive itemized list of all substantive factual claims in draft checked against CV',
                    },
                    isComprehensiveAudit: {
                      type: Type.BOOLEAN,
                      description: 'True if all substantive factual assertions across draft were checked against the CV',
                    },
                    unverifiedOrAmbiguousItems: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          item: { type: Type.STRING },
                          reason: { type: Type.STRING },
                        },
                        required: ['item', 'reason'],
                      },
                      description: 'Any claims or assumptions that could not be verified directly from the CV',
                    },
                  },
                  required: [
                    'adjustments',
                    'evidenceMatrix',
                    'outstandingClarifications',
                    'factualFidelityVerification',
                    'isComprehensiveAudit',
                    'unverifiedOrAmbiguousItems',
                  ],
                },
              },
              required: [
                'isValidInput',
                'identifiedEmployer',
                'identifiedPosition',
                'tailoredCv',
                'motivationalLetter',
                'reviewNote',
              ],
            },
          },
        });

        parsedData = JSON.parse(response.text || '{}');
        if (parsedData) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, attempting next if available:`, err?.message);
      }
    }

    if (!parsedData) {
      throw lastError || new Error('Failed to generate tailored application documents.');
    }

    // Ensure complete text and calculate accurate word count
    if (parsedData.motivationalLetter) {
      const ml = parsedData.motivationalLetter;
      const assembledText = [
        ml.recipient,
        `Re: Application for ${ml.roleApplied || parsedData.identifiedPosition} at ${parsedData.identifiedEmployer}`,
        ml.opening,
        ...(ml.bodyParagraphs || []),
        ml.closing,
        `${ml.signOff || 'Sincerely,'}\n${parsedData.tailoredCv?.name || ''}`,
      ]
        .filter(Boolean)
        .join('\n\n');

      if (!ml.rawText || ml.rawText.length < assembledText.length * 0.7) {
        ml.rawText = assembledText;
      }

      let words = ml.rawText
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

      // AUTOMATIC REVISION LOOP:
      // If outside 400-700 words, automatically revise using ONLY verified CV information
      if (words < 400 || words > 700) {
        console.log(`Motivational letter has ${words} words (outside 400-700 target). Running automatic revision...`);
        for (let pass = 1; pass <= 2; pass++) {
          try {
            const revisionPrompt = `You are "Application Tailor". The motivational letter generated below currently contains ${words} words, which does NOT meet the strict requirement that the letter must be between 400 and 700 words.

MANDATORY TASK:
- Revise and expand this formal motivational letter so its total word count is strictly between 450 and 550 words.
- STRICT FACTUAL INTEGRITY: Use ONLY verified facts from the Candidate CV. NEVER add fabricated experience, unevidenced tools, or imaginary credentials.
- Add substantive, detailed paragraphs explaining the candidate's verified daily workflows, supplier tracking duties, resolution of discrepancies, cross-team collaboration, and exact tool proficiency (preserving exact metrics and basic proficiency levels).

--- CANDIDATE CV ---
${cv}

--- EMPLOYER JOB DESCRIPTION ---
${jobDescription}

--- CURRENT DRAFT (${words} words) ---
${ml.rawText}

Respond with a JSON object:
{
  "rawText": "Full text of the revised 450-550 word letter",
  "opening": "Opening paragraph",
  "bodyParagraphs": ["Detailed paragraph 1", "Detailed paragraph 2", "Detailed paragraph 3", "Detailed paragraph 4"],
  "closing": "Professional concluding paragraph",
  "signOff": "Sincerely,"
}`;

            const revisionResponse = await ai.models.generateContent({
              model: 'gemini-3.1-flash-lite',
              contents: revisionPrompt,
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    rawText: { type: Type.STRING },
                    opening: { type: Type.STRING },
                    bodyParagraphs: { type: Type.ARRAY, items: { type: Type.STRING } },
                    closing: { type: Type.STRING },
                    signOff: { type: Type.STRING },
                  },
                  required: ['rawText', 'opening', 'bodyParagraphs', 'closing', 'signOff'],
                },
              },
            });

            const revJson = JSON.parse(revisionResponse.text || '{}');
            if (revJson.rawText) {
              const revWords = revJson.rawText.trim().split(/\s+/).filter(Boolean).length;
              console.log(`Revision pass ${pass} produced ${revWords} words.`);
              ml.rawText = revJson.rawText;
              ml.opening = revJson.opening || ml.opening;
              ml.bodyParagraphs = revJson.bodyParagraphs || ml.bodyParagraphs;
              ml.closing = revJson.closing || ml.closing;
              ml.signOff = revJson.signOff || ml.signOff;
              words = revWords;
              if (words >= 400 && words <= 700) {
                break;
              }
            }
          } catch (revError: any) {
            console.warn('Letter revision pass failed:', revError?.message);
            break;
          }
        }
      }

      ml.wordCount = words;
      ml.wordCountCompliant = words >= 400 && words <= 700;
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Tailoring error:', error);
    const isOverloaded =
      error?.status === 503 ||
      error?.status === 429 ||
      error?.message?.includes('503') ||
      error?.message?.includes('429') ||
      error?.message?.includes('demand') ||
      error?.message?.includes('quota');

    const statusCode = isOverloaded ? 503 : 500;
    const errorMessage = isOverloaded
      ? 'The Gemini AI service is currently experiencing temporary high traffic. Please click Retry to regenerate.'
      : (error?.message || 'Failed to generate tailored application documents.');

    return res.status(statusCode).json({
      error: errorMessage,
      isRetryable: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Application Tailor server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
