// =============================================================================
// AI SUMMARIZATION SERVICE
// Following CodeBakers pattern 14-ai.md
// Comprehensive opportunity summarization with requirement extraction
// =============================================================================

import { getOpenAIClient, AI_MODELS, isAIAvailable } from '../lib/ai-client';
import type { Opportunity } from '../types/samgov';

export interface OpportunitySummary {
  // Core summary
  description: string; // Plain-English summary
  scopeOfWork: string; // What goods/services are being procured
  actionItems: string[]; // Bullet-point todo list

  // Key dates
  keyDates: {
    postedDate?: string;
    questionDeadline?: string;
    responseDeadline?: string;
    estimatedAwardDate?: string;
  };

  // Contract details
  contractDetails: {
    type?: string; // FFP, T&M, CPFF, etc.
    setAside?: string; // Small Business, WOSB, SDVOSB, etc.
    placeOfPerformance?: string;
    estimatedValue?: string;
    duration?: string;
  };

  // Requirements
  requirements: {
    technical: string[]; // Technical requirements
    forms: string[]; // Required forms (SF-33, SF-1449, etc.)
    certifications: string[]; // Required certifications
    pastPerformance: string[]; // Past performance requirements
    security: string[]; // Security clearances, etc.
    pageLimit?: string; // Page limits if specified
  };

  // Submission details
  submission: {
    method: 'email' | 'portal' | 'physical' | 'unknown';
    instructions: string;
    pointOfContact?: {
      name?: string;
      email?: string;
      phone?: string;
    };
  };

  // Evaluation factors (from Section M)
  evaluationFactors?: string[];

  // Compliance checklist
  complianceChecklist: {
    item: string;
    category: 'document' | 'certification' | 'requirement' | 'date';
    completed: boolean;
  }[];

  // Attachments
  attachments?: string[];
}

export class AISummarizationService {
  /**
   * Generate comprehensive summary of an opportunity
   * @param opportunity - Opportunity to summarize
   * @param openaiApiKey - Optional user's OpenAI API key (falls back to platform key)
   */
  static async summarizeOpportunity(
    opportunity: Opportunity,
    openaiApiKey?: string
  ): Promise<OpportunitySummary> {
    // If no AI available, return rule-based summary
    if (!isAIAvailable()) {
      return this.ruleBasedSummarization(opportunity);
    }

    try {
      const client = getOpenAIClient(openaiApiKey);

      const prompt = this.buildSummarizationPrompt(opportunity);

      const response = await client.chat.completions.create({
        model: AI_MODELS.GPT4, // Using GPT-4 for better extraction quality
        messages: [
          {
            role: 'system',
            content: `You are an expert government contracting analyst. Extract key information from opportunity notices and create structured summaries that help contractors quickly understand requirements and prepare proposals.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2, // Low temperature for factual extraction
        max_tokens: 2000,
      });

      const result = response.choices[0]?.message?.content || '';
      return this.parseAISummary(result, opportunity);

    } catch (error) {
      console.error('AI summarization error:', error);
      // Fallback to rule-based
      return this.ruleBasedSummarization(opportunity);
    }
  }

  /**
   * Build comprehensive summarization prompt
   */
  private static buildSummarizationPrompt(opportunity: Opportunity): string {
    return `
Analyze this government contracting opportunity and extract key information:

TITLE: ${opportunity.title}
NOTICE ID: ${opportunity.noticeId}
SOLICITATION NUMBER: ${opportunity.solicitationNumber || 'N/A'}
DEPARTMENT: ${opportunity.department || 'N/A'}
TYPE: ${opportunity.type || 'N/A'}
SET-ASIDE: ${opportunity.typeOfSetAsideDescription || 'N/A'}
NAICS: ${opportunity.naicsCode || 'N/A'}
PSC: ${opportunity.classificationCode || 'N/A'}
POSTED: ${opportunity.postedDate || 'N/A'}
RESPONSE DEADLINE: ${opportunity.responseDeadLine || 'N/A'}
DESCRIPTION: ${opportunity.description?.substring(0, 3000) || 'N/A'}

Extract and structure the following information in JSON format:

{
  "description": "<2-3 sentence plain-English summary>",
  "scopeOfWork": "<what goods/services are being procured>",
  "actionItems": ["<action 1>", "<action 2>", "..."],
  "keyDates": {
    "postedDate": "<MM/DD/YYYY or null>",
    "questionDeadline": "<MM/DD/YYYY or null>",
    "responseDeadline": "<MM/DD/YYYY or null>",
    "estimatedAwardDate": "<MM/DD/YYYY or null>"
  },
  "contractDetails": {
    "type": "<FFP, T&M, CPFF, etc. or null>",
    "setAside": "<set-aside type or null>",
    "placeOfPerformance": "<location or null>",
    "estimatedValue": "<dollar amount or null>",
    "duration": "<contract duration or null>"
  },
  "requirements": {
    "technical": ["<technical requirement 1>", "..."],
    "forms": ["<SF-33>", "<SF-1449>", "<SF-18>", "..."],
    "certifications": ["<certification 1>", "..."],
    "pastPerformance": ["<requirement 1>", "..."],
    "security": ["<clearance or security requirement>", "..."],
    "pageLimit": "<page limit or null>"
  },
  "submission": {
    "method": "<email|portal|physical|unknown>",
    "instructions": "<how to submit>",
    "pointOfContact": {
      "name": "<name or null>",
      "email": "<email or null>",
      "phone": "<phone or null>"
    }
  },
  "evaluationFactors": ["<factor 1>", "<factor 2>", "..."],
  "attachments": ["<attachment name 1>", "..."]
}

INSTRUCTIONS:
- Extract dates exactly as they appear
- List ALL required forms (SF-33, SF-1449, SF-18, SF-26, etc.)
- Identify submission method from instructions
- Extract evaluation criteria if mentioned
- Create specific action items for contractors
- If information is not found, use null or empty array
- Be precise and factual
`.trim();
  }

  /**
   * Parse AI response into structured summary
   */
  private static parseAISummary(
    response: string,
    opportunity: Opportunity
  ): OpportunitySummary {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Build compliance checklist from extracted requirements
        const complianceChecklist = this.buildComplianceChecklist(parsed);

        return {
          description: parsed.description || 'No description available',
          scopeOfWork: parsed.scopeOfWork || 'Not specified',
          actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
          keyDates: parsed.keyDates || {},
          contractDetails: parsed.contractDetails || {},
          requirements: {
            technical: Array.isArray(parsed.requirements?.technical) ? parsed.requirements.technical : [],
            forms: Array.isArray(parsed.requirements?.forms) ? parsed.requirements.forms : [],
            certifications: Array.isArray(parsed.requirements?.certifications) ? parsed.requirements.certifications : [],
            pastPerformance: Array.isArray(parsed.requirements?.pastPerformance) ? parsed.requirements.pastPerformance : [],
            security: Array.isArray(parsed.requirements?.security) ? parsed.requirements.security : [],
            pageLimit: parsed.requirements?.pageLimit || undefined,
          },
          submission: {
            method: parsed.submission?.method || 'unknown',
            instructions: parsed.submission?.instructions || 'See full notice for submission details',
            pointOfContact: parsed.submission?.pointOfContact || undefined,
          },
          evaluationFactors: Array.isArray(parsed.evaluationFactors) ? parsed.evaluationFactors : undefined,
          complianceChecklist,
          attachments: Array.isArray(parsed.attachments) ? parsed.attachments : undefined,
        };
      }
    } catch (error) {
      console.error('Error parsing AI summary:', error);
    }

    // Fallback to rule-based
    return this.ruleBasedSummarization(opportunity);
  }

  /**
   * Build compliance checklist from extracted requirements
   */
  private static buildComplianceChecklist(parsed: any): OpportunitySummary['complianceChecklist'] {
    const checklist: OpportunitySummary['complianceChecklist'] = [];

    // Add forms
    if (Array.isArray(parsed.requirements?.forms)) {
      parsed.requirements.forms.forEach((form: string) => {
        checklist.push({
          item: `Complete ${form}`,
          category: 'document',
          completed: false,
        });
      });
    }

    // Add certifications
    if (Array.isArray(parsed.requirements?.certifications)) {
      parsed.requirements.certifications.forEach((cert: string) => {
        checklist.push({
          item: `Obtain/verify ${cert}`,
          category: 'certification',
          completed: false,
        });
      });
    }

    // Add key dates as checklist items
    if (parsed.keyDates?.questionDeadline) {
      checklist.push({
        item: `Submit questions by ${parsed.keyDates.questionDeadline}`,
        category: 'date',
        completed: false,
      });
    }

    if (parsed.keyDates?.responseDeadline) {
      checklist.push({
        item: `Submit proposal by ${parsed.keyDates.responseDeadline}`,
        category: 'date',
        completed: false,
      });
    }

    // Add past performance
    if (Array.isArray(parsed.requirements?.pastPerformance) && parsed.requirements.pastPerformance.length > 0) {
      checklist.push({
        item: 'Prepare past performance documentation',
        category: 'document',
        completed: false,
      });
    }

    return checklist;
  }

  /**
   * Rule-based summarization (fallback when AI unavailable)
   */
  private static ruleBasedSummarization(opportunity: Opportunity): OpportunitySummary {
    const description = opportunity.description || '';
    const descLower = description.toLowerCase();

    // Extract action items
    const actionItems: string[] = [
      'Review full solicitation document',
      'Verify NAICS code eligibility',
    ];

    if (opportunity.responseDeadLine) {
      actionItems.push(`Submit proposal by ${opportunity.responseDeadLine}`);
    }

    // Build compliance checklist
    const complianceChecklist: OpportunitySummary['complianceChecklist'] = [
      { item: 'Review solicitation requirements', category: 'requirement', completed: false },
      { item: 'Prepare technical proposal', category: 'document', completed: false },
      { item: 'Prepare cost proposal', category: 'document', completed: false },
    ];

    if (opportunity.responseDeadLine) {
      complianceChecklist.push({
        item: `Submit by ${opportunity.responseDeadLine}`,
        category: 'date',
        completed: false,
      });
    }

    // Detect common forms
    const forms: string[] = [];
    if (descLower.includes('sf-33') || descLower.includes('sf 33')) forms.push('SF-33');
    if (descLower.includes('sf-1449') || descLower.includes('sf 1449')) forms.push('SF-1449');
    if (descLower.includes('sf-18') || descLower.includes('sf 18')) forms.push('SF-18');

    // Detect submission method
    let submissionMethod: 'email' | 'portal' | 'physical' | 'unknown' = 'unknown';
    if (descLower.includes('email') || descLower.includes('e-mail')) {
      submissionMethod = 'email';
    } else if (descLower.includes('portal') || descLower.includes('sam.gov')) {
      submissionMethod = 'portal';
    } else if (descLower.includes('mail') || descLower.includes('physical')) {
      submissionMethod = 'physical';
    }

    // Extract POC from opportunity
    const poc = opportunity.pointOfContact?.[0];

    return {
      description: opportunity.title || 'Government contracting opportunity',
      scopeOfWork: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
      actionItems,
      keyDates: {
        postedDate: opportunity.postedDate,
        responseDeadline: opportunity.responseDeadLine,
      },
      contractDetails: {
        setAside: opportunity.typeOfSetAsideDescription,
        placeOfPerformance: opportunity.placeOfPerformance?.city?.name
          ? `${opportunity.placeOfPerformance.city.name}, ${opportunity.placeOfPerformance.state?.code}`
          : undefined,
      },
      requirements: {
        technical: [],
        forms,
        certifications: [],
        pastPerformance: [],
        security: [],
      },
      submission: {
        method: submissionMethod,
        instructions: 'See full solicitation for submission details',
        pointOfContact: poc ? {
          name: poc.fullName,
          email: poc.email,
          phone: poc.phone,
        } : undefined,
      },
      complianceChecklist,
    };
  }

  /**
   * Batch summarize multiple opportunities
   * @param opportunities - Opportunities to summarize
   * @param openaiApiKey - Optional user's OpenAI API key (falls back to platform key)
   */
  static async summarizeOpportunities(
    opportunities: Opportunity[],
    openaiApiKey?: string
  ): Promise<Map<string, OpportunitySummary>> {
    const summaries = new Map<string, OpportunitySummary>();

    for (const opportunity of opportunities) {
      try {
        const summary = await this.summarizeOpportunity(opportunity, openaiApiKey);
        summaries.set(opportunity.noticeId, summary);
      } catch (error) {
        console.error(`Error summarizing opportunity ${opportunity.noticeId}:`, error);
        // Continue with next opportunity
      }
    }

    return summaries;
  }
}
