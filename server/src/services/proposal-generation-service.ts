// =============================================================================
// PROPOSAL GENERATION SERVICE
// Following CodeBakers pattern 14-ai.md
// Generates proposal outlines, compliance matrices, and content from opportunities
// =============================================================================

import { getOpenAIClient, AI_MODELS, isAIAvailable } from '../lib/ai-client';
import type { Opportunity } from '../types/samgov';
import type { CompanyProfile } from '../db/schema';
import type { OpportunitySummary } from './ai-summarization-service';

export interface ProposalOutline {
  // Proposal metadata
  opportunityTitle: string;
  solicitationNumber?: string;
  noticeId: string;

  // Executive summary
  executiveSummary: {
    overview: string;
    valueProposition: string;
    whyUs: string[];
  };

  // Proposal sections
  sections: ProposalSection[];

  // Compliance matrix
  complianceMatrix: ComplianceMatrixItem[];

  // Appendices
  appendices: string[];

  // Metadata
  generatedAt: string;
  estimatedPageCount: number;
}

export interface ProposalSection {
  sectionNumber: string; // e.g., "1.0", "2.1"
  title: string;
  description: string;
  suggestedContent: string;
  requiredContent: string[]; // Must address these points
  pageLimit?: number;
  subsections?: ProposalSection[];
}

export interface ComplianceMatrixItem {
  requirement: string; // The requirement from Section L
  rfpSection: string; // Where it appears in RFP (e.g., "Section L.3.2")
  proposalSection: string; // Where addressed in proposal (e.g., "Section 2.1")
  evaluationCriteria?: string; // From Section M
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-addressed';
  notes?: string;
}

export interface ContentBlock {
  id: string;
  category: 'company-overview' | 'quality-control' | 'risk-management' | 'security' | 'past-performance' | 'team' | 'custom';
  title: string;
  content: string;
  lastUpdated: string;
  tags: string[];
}

export class ProposalGenerationService {
  /**
   * Generate complete proposal outline from opportunity
   */
  static async generateProposalOutline(
    opportunity: Opportunity,
    summary: OpportunitySummary,
    companyProfile: CompanyProfile
  ): Promise<ProposalOutline> {
    if (!isAIAvailable()) {
      return this.generateBasicOutline(opportunity, summary, companyProfile);
    }

    try {
      const client = getOpenAIClient();

      const prompt = this.buildProposalPrompt(opportunity, summary, companyProfile);

      const response = await client.chat.completions.create({
        model: AI_MODELS.GPT4,
        messages: [
          {
            role: 'system',
            content: `You are an expert government proposal writer with 20+ years of experience. Generate comprehensive proposal outlines that follow federal acquisition regulations and best practices.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      const result = response.choices[0]?.message?.content || '';
      return this.parseProposalOutline(result, opportunity, summary, companyProfile);

    } catch (error) {
      console.error('Proposal generation error:', error);
      return this.generateBasicOutline(opportunity, summary, companyProfile);
    }
  }

  /**
   * Build comprehensive proposal generation prompt
   */
  private static buildProposalPrompt(
    opportunity: Opportunity,
    summary: OpportunitySummary,
    companyProfile: CompanyProfile
  ): string {
    return `
Generate a comprehensive proposal outline for this government contracting opportunity:

OPPORTUNITY INFORMATION:
- Title: ${opportunity.title}
- Solicitation: ${opportunity.solicitationNumber || 'N/A'}
- Department: ${opportunity.department || 'N/A'}
- NAICS: ${opportunity.naicsCode || 'N/A'}
- Set-Aside: ${opportunity.typeOfSetAsideDescription || 'N/A'}
- Response Deadline: ${opportunity.responseDeadLine || 'N/A'}

SCOPE OF WORK:
${summary.scopeOfWork}

REQUIREMENTS:
- Technical: ${summary.requirements.technical.join(', ') || 'See description'}
- Forms: ${summary.requirements.forms.join(', ') || 'Standard forms'}
- Certifications: ${summary.requirements.certifications.join(', ') || 'None specified'}

COMPANY PROFILE:
- Name: ${companyProfile.companyName}
- NAICS: ${companyProfile.naicsCodes.join(', ')}
- Certifications: ${companyProfile.certifications?.join(', ') || 'None'}
- Capabilities: ${companyProfile.capabilities || 'See profile'}

EVALUATION FACTORS:
${summary.evaluationFactors?.join('\n- ') || 'Not specified in summary'}

Generate a proposal outline in JSON format:

{
  "executiveSummary": {
    "overview": "<1 paragraph overview of solution>",
    "valueProposition": "<1 paragraph unique value proposition>",
    "whyUs": ["<key differentiator 1>", "<key differentiator 2>", "<key differentiator 3>"]
  },
  "sections": [
    {
      "sectionNumber": "1.0",
      "title": "Technical Approach",
      "description": "<what this section covers>",
      "suggestedContent": "<detailed guidance on what to write>",
      "requiredContent": ["<must address point 1>", "<must address point 2>"],
      "pageLimit": <number or null>,
      "subsections": [
        {
          "sectionNumber": "1.1",
          "title": "<subsection title>",
          "description": "<subsection description>",
          "suggestedContent": "<guidance>",
          "requiredContent": ["<required point>"]
        }
      ]
    },
    {
      "sectionNumber": "2.0",
      "title": "Management Approach",
      "description": "<what this section covers>",
      "suggestedContent": "<guidance>",
      "requiredContent": ["<required point>"]
    },
    {
      "sectionNumber": "3.0",
      "title": "Past Performance",
      "description": "<what this section covers>",
      "suggestedContent": "<guidance>",
      "requiredContent": ["<required point>"]
    },
    {
      "sectionNumber": "4.0",
      "title": "Cost/Price Volume",
      "description": "<what this section covers>",
      "suggestedContent": "<guidance>",
      "requiredContent": ["<required point>"]
    }
  ],
  "appendices": ["<appendix A title>", "<appendix B title>", "..."]
}

INSTRUCTIONS:
- Structure follows standard federal proposal format
- Technical approach should address all technical requirements
- Management section should cover team, schedule, quality control
- Include past performance section if required
- Cost volume should reference required forms
- Appendices for resumes, certs, past performance details
- Suggest 3-5 main sections with logical subsections
- Provide specific, actionable content guidance
- Reference evaluation factors in suggested content
- Estimated page count: 15-30 pages for typical proposal
`.trim();
  }

  /**
   * Parse AI response into proposal outline
   */
  private static parseProposalOutline(
    response: string,
    opportunity: Opportunity,
    summary: OpportunitySummary,
    companyProfile: CompanyProfile
  ): ProposalOutline {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Generate compliance matrix from requirements and sections
        const complianceMatrix = this.generateComplianceMatrix(
          summary,
          parsed.sections || []
        );

        return {
          opportunityTitle: opportunity.title,
          solicitationNumber: opportunity.solicitationNumber,
          noticeId: opportunity.noticeId,
          executiveSummary: parsed.executiveSummary || {
            overview: 'Executive summary to be written',
            valueProposition: 'Value proposition to be defined',
            whyUs: [],
          },
          sections: Array.isArray(parsed.sections) ? parsed.sections : [],
          complianceMatrix,
          appendices: Array.isArray(parsed.appendices) ? parsed.appendices : [
            'Appendix A: Team Resumes',
            'Appendix B: Past Performance References',
            'Appendix C: Certifications',
          ],
          generatedAt: new Date().toISOString(),
          estimatedPageCount: this.estimatePageCount(parsed.sections || []),
        };
      }
    } catch (error) {
      console.error('Error parsing proposal outline:', error);
    }

    return this.generateBasicOutline(opportunity, summary, companyProfile);
  }

  /**
   * Generate compliance matrix from summary and proposal sections
   */
  private static generateComplianceMatrix(
    summary: OpportunitySummary,
    sections: ProposalSection[]
  ): ComplianceMatrixItem[] {
    const matrix: ComplianceMatrixItem[] = [];

    // Add requirements from summary
    summary.requirements.technical.forEach((req, idx) => {
      matrix.push({
        requirement: req,
        rfpSection: 'Section C (SOW)',
        proposalSection: sections[0]?.sectionNumber || '1.0',
        status: 'not-addressed',
        notes: 'Address in Technical Approach section',
      });
    });

    summary.requirements.forms.forEach((form) => {
      matrix.push({
        requirement: `Complete ${form}`,
        rfpSection: 'Section J (Forms)',
        proposalSection: 'Cost Volume',
        status: 'not-addressed',
        notes: 'Include completed form in submission package',
      });
    });

    summary.requirements.certifications.forEach((cert) => {
      matrix.push({
        requirement: cert,
        rfpSection: 'Section K (Reps & Certs)',
        proposalSection: 'Appendix C',
        status: 'not-addressed',
        notes: 'Include certification documentation',
      });
    });

    if (summary.requirements.pastPerformance.length > 0) {
      matrix.push({
        requirement: 'Past Performance References',
        rfpSection: 'Section M (Evaluation)',
        proposalSection: sections.find(s => s.title.includes('Past'))?.sectionNumber || '3.0',
        status: 'not-addressed',
        notes: 'Provide 3-5 relevant contract references',
      });
    }

    return matrix;
  }

  /**
   * Estimate page count from sections
   */
  private static estimatePageCount(sections: ProposalSection[]): number {
    let count = 2; // Executive summary

    sections.forEach((section) => {
      count += 3; // Base pages per section
      if (section.subsections) {
        count += section.subsections.length * 2;
      }
    });

    count += 5; // Appendices

    return count;
  }

  /**
   * Generate basic outline (fallback)
   */
  private static generateBasicOutline(
    opportunity: Opportunity,
    summary: OpportunitySummary,
    companyProfile: CompanyProfile
  ): ProposalOutline {
    const sections: ProposalSection[] = [
      {
        sectionNumber: '1.0',
        title: 'Technical Approach',
        description: 'Describe how you will meet the technical requirements',
        suggestedContent: 'Detail your methodology, tools, and approach to delivering the required services.',
        requiredContent: summary.requirements.technical,
      },
      {
        sectionNumber: '2.0',
        title: 'Management Approach',
        description: 'Describe your management structure and quality control',
        suggestedContent: 'Outline your project management approach, team structure, and quality assurance processes.',
        requiredContent: ['Project management plan', 'Team organization', 'Quality control procedures'],
      },
      {
        sectionNumber: '3.0',
        title: 'Past Performance',
        description: 'Demonstrate relevant experience',
        suggestedContent: 'Provide 3-5 relevant contract references with similar scope and complexity.',
        requiredContent: ['Contract references', 'Points of contact', 'Performance metrics'],
      },
      {
        sectionNumber: '4.0',
        title: 'Cost Volume',
        description: 'Provide pricing and cost breakdown',
        suggestedContent: 'Complete all required pricing forms and provide cost narrative.',
        requiredContent: summary.requirements.forms,
      },
    ];

    const complianceMatrix = this.generateComplianceMatrix(summary, sections);

    return {
      opportunityTitle: opportunity.title,
      solicitationNumber: opportunity.solicitationNumber,
      noticeId: opportunity.noticeId,
      executiveSummary: {
        overview: `${companyProfile.companyName} proposes to provide ${summary.scopeOfWork}`,
        valueProposition: `Our team brings proven experience and a commitment to excellence.`,
        whyUs: [
          `Certified ${companyProfile.certifications?.join(', ') || 'small business'}`,
          'Proven track record of successful contract performance',
          'Dedicated team with relevant expertise',
        ],
      },
      sections,
      complianceMatrix,
      appendices: [
        'Appendix A: Team Resumes',
        'Appendix B: Past Performance References',
        'Appendix C: Certifications and Licenses',
        'Appendix D: Facility Information',
      ],
      generatedAt: new Date().toISOString(),
      estimatedPageCount: 20,
    };
  }

  /**
   * Generate compliance matrix from Section L & M
   * This would parse actual RFP documents if available
   */
  static async generateDetailedComplianceMatrix(
    opportunityDescription: string
  ): Promise<ComplianceMatrixItem[]> {
    if (!isAIAvailable()) {
      return [];
    }

    try {
      const client = getOpenAIClient();

      const prompt = `
Extract ALL requirements from this RFP excerpt and create a compliance matrix:

${opportunityDescription.substring(0, 4000)}

For each requirement, provide JSON:
[
  {
    "requirement": "<exact requirement text>",
    "rfpSection": "<section reference (e.g., 'Section L.3.2')>",
    "proposalSection": "<suggested proposal section to address>",
    "evaluationCriteria": "<if mentioned in Section M>",
    "status": "not-addressed"
  }
]

Extract requirements from:
- Section L (Instructions to Offerors)
- Section M (Evaluation Criteria)
- Section C (Statement of Work)
- Any other numbered requirements

Be thorough and precise.
`.trim();

      const response = await client.chat.completions.create({
        model: AI_MODELS.GPT4,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at parsing RFP documents and extracting requirements.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const result = response.choices[0]?.message?.content || '';
      const jsonMatch = result.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : [];
      }

      return [];

    } catch (error) {
      console.error('Compliance matrix generation error:', error);
      return [];
    }
  }
}
