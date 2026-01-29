// =============================================================================
// AI SCORING SERVICE
// Following CodeBakers pattern 14-ai.md
// Scores opportunities based on company profile fit
// =============================================================================

import { getOpenAIClient, AI_MODELS, isAIAvailable } from '../lib/ai-client';
import type { Opportunity } from '../types/samgov';
import type { CompanyProfile } from '../db/schema';

export interface OpportunityScore {
  score: number; // 0-100
  reasoning: string;
  matchFactors: {
    naicsMatch: boolean;
    certificationMatch: boolean;
    sizeMatch: boolean;
    capabilityMatch: boolean;
  };
  extractedRequirements?: {
    technicalRequirements: string[];
    certifications: string[];
    experience: string[];
    deliverables: string[];
  };
}

export class AIScoringService {
  /**
   * Score an opportunity based on company profile
   * @param opportunity - Opportunity to score
   * @param companyProfile - User's company profile
   * @param openaiApiKey - Optional user's OpenAI API key (falls back to platform key)
   */
  static async scoreOpportunity(
    opportunity: Opportunity,
    companyProfile: CompanyProfile | null,
    openaiApiKey?: string
  ): Promise<OpportunityScore> {
    // If no AI available, return basic rule-based scoring
    if (!isAIAvailable() || !companyProfile) {
      return this.ruleBasedScoring(opportunity, companyProfile);
    }

    try {
      const client = getOpenAIClient(openaiApiKey);

      const prompt = this.buildScoringPrompt(opportunity, companyProfile);

      const response = await client.chat.completions.create({
        model: AI_MODELS.GPT35, // Using 3.5-turbo for speed and cost
        messages: [
          {
            role: 'system',
            content: 'You are an expert at evaluating government contracting opportunities. Analyze the opportunity and provide a fit score based on the company profile.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for consistent scoring
        max_tokens: 500,
      });

      const result = response.choices[0]?.message?.content || '';
      return this.parseAIResponse(result, opportunity, companyProfile);

    } catch (error) {
      console.error('AI scoring error:', error);
      // Fallback to rule-based scoring
      return this.ruleBasedScoring(opportunity, companyProfile);
    }
  }

  /**
   * Build prompt for AI scoring
   */
  private static buildScoringPrompt(
    opportunity: Opportunity,
    companyProfile: CompanyProfile
  ): string {
    return `
Evaluate this government contracting opportunity for fit:

OPPORTUNITY:
- Title: ${opportunity.title}
- NAICS Code: ${opportunity.naicsCode || 'N/A'}
- Department: ${opportunity.department || 'N/A'}
- Set-Aside: ${opportunity.typeOfSetAsideDescription || 'N/A'}
- Description: ${opportunity.description?.substring(0, 500) || 'N/A'}

COMPANY PROFILE:
- Name: ${companyProfile.companyName}
- NAICS Codes: ${companyProfile.naicsCodes.join(', ')}
- Certifications: ${companyProfile.certifications?.join(', ') || 'None'}
- Capabilities: ${companyProfile.capabilities || 'N/A'}

Provide a JSON response with:
{
  "score": <0-100 number>,
  "reasoning": "<brief explanation of fit>",
  "naicsMatch": <boolean>,
  "certificationMatch": <boolean>
}

Score based on:
- NAICS code match (40 points)
- Set-aside certifications match (30 points)
- Capability/experience fit (30 points)
`.trim();
  }

  /**
   * Parse AI response into structured score
   */
  private static parseAIResponse(
    response: string,
    opportunity: Opportunity,
    companyProfile: CompanyProfile | null
  ): OpportunityScore {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.min(100, Math.max(0, parsed.score || 0)),
          reasoning: parsed.reasoning || 'AI analysis completed',
          matchFactors: {
            naicsMatch: parsed.naicsMatch || false,
            certificationMatch: parsed.certificationMatch || false,
            sizeMatch: true, // Placeholder
            capabilityMatch: true, // Placeholder
          },
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }

    // Fallback to rule-based
    return this.ruleBasedScoring(opportunity, companyProfile);
  }

  /**
   * Rule-based scoring fallback (no AI required)
   */
  private static ruleBasedScoring(
    opportunity: Opportunity,
    companyProfile: CompanyProfile | null
  ): OpportunityScore {
    let score = 0;
    const matchFactors = {
      naicsMatch: false,
      certificationMatch: false,
      sizeMatch: false,
      capabilityMatch: false,
    };

    if (!companyProfile) {
      return {
        score: 50, // Default neutral score
        reasoning: 'No company profile available. Create a profile for accurate scoring.',
        matchFactors,
      };
    }

    // Check NAICS match (40 points)
    if (
      opportunity.naicsCode &&
      companyProfile.naicsCodes.includes(opportunity.naicsCode)
    ) {
      score += 40;
      matchFactors.naicsMatch = true;
    }

    // Check certification match (30 points)
    if (opportunity.typeOfSetAside && companyProfile.certifications) {
      const setAside = opportunity.typeOfSetAside.toLowerCase();
      const hasCert = companyProfile.certifications.some((cert) =>
        setAside.includes(cert.toLowerCase())
      );
      if (hasCert) {
        score += 30;
        matchFactors.certificationMatch = true;
      }
    }

    // Basic capability match (30 points) - always true for now
    score += 30;
    matchFactors.capabilityMatch = true;

    let reasoning = 'Rule-based scoring: ';
    if (matchFactors.naicsMatch) reasoning += 'NAICS match ✓ ';
    if (matchFactors.certificationMatch) reasoning += 'Certification match ✓ ';
    if (!matchFactors.naicsMatch && !matchFactors.certificationMatch) {
      reasoning += 'No direct matches found';
    }

    return {
      score,
      reasoning: reasoning.trim(),
      matchFactors,
    };
  }

  /**
   * Batch score multiple opportunities
   * @param opportunities - Opportunities to score
   * @param companyProfile - User's company profile
   * @param openaiApiKey - Optional user's OpenAI API key (falls back to platform key)
   */
  static async scoreOpportunities(
    opportunities: Opportunity[],
    companyProfile: CompanyProfile | null,
    openaiApiKey?: string
  ): Promise<Map<string, OpportunityScore>> {
    const scores = new Map<string, OpportunityScore>();

    for (const opportunity of opportunities) {
      try {
        const score = await this.scoreOpportunity(opportunity, companyProfile, openaiApiKey);
        scores.set(opportunity.noticeId, score);
      } catch (error) {
        console.error(`Error scoring opportunity ${opportunity.noticeId}:`, error);
        // Continue with next opportunity
      }
    }

    return scores;
  }

  /**
   * Extract requirements from opportunity description using AI
   * @param opportunity - Opportunity to extract requirements from
   * @param openaiApiKey - Optional user's OpenAI API key (falls back to platform key)
   */
  static async extractRequirements(
    opportunity: Opportunity,
    openaiApiKey?: string
  ): Promise<{
    technicalRequirements: string[];
    certifications: string[];
    experience: string[];
    deliverables: string[];
  }> {
    if (!isAIAvailable()) {
      return this.ruleBasedRequirementExtraction(opportunity);
    }

    try {
      const client = getOpenAIClient(openaiApiKey);

      const prompt = `
Extract key requirements from this government contracting opportunity:

TITLE: ${opportunity.title}
DESCRIPTION: ${opportunity.description || 'N/A'}

Extract and categorize requirements into JSON format:
{
  "technicalRequirements": ["list of technical skills/technologies needed"],
  "certifications": ["list of required certifications (e.g., ISO, CMMI, Security clearances)"],
  "experience": ["list of required experience levels or past performance"],
  "deliverables": ["list of expected deliverables or outputs"]
}

Be concise. Extract only explicit requirements mentioned in the description.
`.trim();

      const response = await client.chat.completions.create({
        model: AI_MODELS.GPT35,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing government contract requirements and extracting structured information.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 600,
      });

      const result = response.choices[0]?.message?.content || '';
      return this.parseRequirementResponse(result);

    } catch (error) {
      console.error('Requirement extraction error:', error);
      return this.ruleBasedRequirementExtraction(opportunity);
    }
  }

  /**
   * Parse AI response for requirements
   */
  private static parseRequirementResponse(response: string): {
    technicalRequirements: string[];
    certifications: string[];
    experience: string[];
    deliverables: string[];
  } {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          technicalRequirements: Array.isArray(parsed.technicalRequirements) ? parsed.technicalRequirements : [],
          certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
          experience: Array.isArray(parsed.experience) ? parsed.experience : [],
          deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [],
        };
      }
    } catch (error) {
      console.error('Error parsing requirement response:', error);
    }

    return {
      technicalRequirements: [],
      certifications: [],
      experience: [],
      deliverables: [],
    };
  }

  /**
   * Rule-based requirement extraction (fallback)
   */
  private static ruleBasedRequirementExtraction(opportunity: Opportunity): {
    technicalRequirements: string[];
    certifications: string[];
    experience: string[];
    deliverables: string[];
  } {
    const description = (opportunity.description || '').toLowerCase();
    const requirements = {
      technicalRequirements: [] as string[],
      certifications: [] as string[],
      experience: [] as string[],
      deliverables: [] as string[],
    };

    // Common technical keywords
    const techKeywords = ['software', 'hardware', 'cloud', 'aws', 'azure', 'programming', 'development', 'database', 'network', 'security'];
    techKeywords.forEach(keyword => {
      if (description.includes(keyword)) {
        requirements.technicalRequirements.push(`${keyword.charAt(0).toUpperCase() + keyword.slice(1)} experience required`);
      }
    });

    // Common certifications
    if (description.includes('clearance') || description.includes('security clearance')) {
      requirements.certifications.push('Security clearance may be required');
    }
    if (description.includes('iso')) {
      requirements.certifications.push('ISO certification may be beneficial');
    }

    // Experience indicators
    if (description.includes('years')) {
      requirements.experience.push('Relevant years of experience required');
    }
    if (description.includes('past performance')) {
      requirements.experience.push('Past performance references required');
    }

    return requirements;
  }
}
