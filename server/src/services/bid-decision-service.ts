// =============================================================================
// BID/NO-BID DECISION SERVICE
// Following CodeBakers pattern 14-ai.md
// One of the 3 priority features: "Automated bid/no-bid decision tool"
// =============================================================================

import { AIClient } from '../lib/ai-client';
import { db } from '../db';
import { proposals, bidDecisions, pastPerformanceProjects, proposalTeamMembers } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface BidDecisionAnalysis {
  recommendation: 'bid' | 'no_bid' | 'maybe';
  confidenceLevel: number; // 0-100
  winProbability: number; // 0-100
  scores: {
    pastPerformance: number; // 0-100
    technicalCapability: number; // 0-100
    resourceAvailability: number; // 0-100
    competitiveLandscape: number; // 0-100
  };
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  recommendations: string[];
  estimatedCompetitors: number;
  competitorNames: string[];
  reasoning: string;
}

export class BidDecisionService {
  /**
   * Analyze an opportunity and generate bid/no-bid recommendation
   */
  static async analyzeBidDecision(
    userId: string,
    proposalId: string
  ): Promise<BidDecisionAnalysis> {
    // Get proposal details
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, proposalId))
      .limit(1);

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Get user's past performance projects
    const pastProjects = await db
      .select()
      .from(pastPerformanceProjects)
      .where(eq(pastPerformanceProjects.userId, userId));

    // Get team members
    const teamMembers = await db
      .select()
      .from(proposalTeamMembers)
      .where(eq(proposalTeamMembers.userId, userId));

    // Build AI analysis prompt
    const prompt = this.buildAnalysisPrompt(proposal, pastProjects, teamMembers);

    // Get AI analysis
    const aiClient = new AIClient();
    const aiResponse = await aiClient.generateText(prompt, {
      temperature: 0.3, // Lower temperature for more consistent analysis
      maxTokens: 2000,
    });

    // Parse AI response
    const analysis = this.parseAIResponse(aiResponse);

    // Save decision to database
    await db.insert(bidDecisions).values({
      proposalId: proposalId,
      recommendation: analysis.recommendation,
      confidenceLevel: analysis.confidenceLevel,
      winProbability: analysis.winProbability,
      pastPerformanceScore: analysis.scores.pastPerformance,
      technicalCapabilityScore: analysis.scores.technicalCapability,
      resourceAvailabilityScore: analysis.scores.resourceAvailability,
      competitiveLandscapeScore: analysis.scores.competitiveLandscape,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      risks: analysis.risks,
      recommendations: analysis.recommendations,
      estimatedCompetitors: analysis.estimatedCompetitors,
      competitorNames: analysis.competitorNames,
    });

    // Update proposal with decision
    await db
      .update(proposals)
      .set({
        bidDecision: analysis.recommendation,
        bidDecisionReasoning: analysis.reasoning,
        winProbability: analysis.winProbability,
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, proposalId));

    return analysis;
  }

  /**
   * Build the AI analysis prompt
   */
  private static buildAnalysisPrompt(
    proposal: any,
    pastProjects: any[],
    teamMembers: any[]
  ): string {
    const opportunityContext = `
OPPORTUNITY DETAILS:
- Title: ${proposal.title}
- Agency: ${proposal.agencyName || 'Unknown'}
- Solicitation: ${proposal.solicitationNumber || 'Unknown'}
- Due Date: ${proposal.dueDate ? new Date(proposal.dueDate).toLocaleDateString() : 'Unknown'}
- Estimated Value: ${proposal.estimatedValue ? `$${proposal.estimatedValue}` : 'Unknown'}
- Description: ${JSON.stringify(proposal.metadata || {})}
`;

    const pastPerformanceContext = pastProjects.length > 0
      ? `
PAST PERFORMANCE:
${pastProjects.map((proj, idx) => `
${idx + 1}. ${proj.projectName}
   - Client: ${proj.clientName}
   - Value: $${proj.contractValue || 'Unknown'}
   - Period: ${proj.startDate ? new Date(proj.startDate).getFullYear() : 'N/A'} - ${proj.endDate ? new Date(proj.endDate).getFullYear() : 'Present'}
   - Description: ${proj.description || 'N/A'}
   - Outcomes: ${proj.outcomes || 'N/A'}
   - Rating: ${proj.performanceRating || 'N/A'}
`).join('\n')}
`
      : 'PAST PERFORMANCE: No past performance projects on file.';

    const teamContext = teamMembers.length > 0
      ? `
TEAM CAPABILITIES:
${teamMembers.map((member, idx) => `
${idx + 1}. ${member.name} - ${member.title || 'N/A'}
   - Skills: ${Array.isArray(member.skills) ? member.skills.join(', ') : 'N/A'}
   - Certifications: ${Array.isArray(member.certifications) ? member.certifications.join(', ') : 'N/A'}
   - Clearance: ${member.clearanceLevel || 'None'}
   - Available: ${member.availability ? 'Yes' : 'No'}
`).join('\n')}
`
      : 'TEAM CAPABILITIES: No team members on file.';

    return `You are an expert government contracting strategist. Analyze this opportunity and provide a detailed bid/no-bid recommendation.

${opportunityContext}

${pastPerformanceContext}

${teamContext}

Provide your analysis in the following JSON format:
{
  "recommendation": "bid" | "no_bid" | "maybe",
  "confidenceLevel": <0-100>,
  "winProbability": <0-100>,
  "scores": {
    "pastPerformance": <0-100>,
    "technicalCapability": <0-100>,
    "resourceAvailability": <0-100>,
    "competitiveLandscape": <0-100>
  },
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "risks": ["risk 1", "risk 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "estimatedCompetitors": <number>,
  "competitorNames": ["company 1", "company 2", ...],
  "reasoning": "Detailed explanation of the recommendation"
}

Analysis criteria:
1. Past Performance Score: Relevance of past projects to this opportunity
2. Technical Capability Score: Team's ability to deliver on requirements
3. Resource Availability Score: Team capacity and availability
4. Competitive Landscape Score: Likelihood of winning against competitors

Provide honest, data-driven analysis. Consider:
- Relevance of past performance
- Team capacity and skills
- Contract value vs. company capacity
- Agency relationships
- Competitive factors
- Risk factors`;
  }

  /**
   * Parse AI response into structured analysis
   */
  private static parseAIResponse(aiResponse: string): BidDecisionAnalysis {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          recommendation: parsed.recommendation || 'maybe',
          confidenceLevel: parsed.confidenceLevel || 50,
          winProbability: parsed.winProbability || 50,
          scores: parsed.scores || {
            pastPerformance: 50,
            technicalCapability: 50,
            resourceAvailability: 50,
            competitiveLandscape: 50,
          },
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          risks: parsed.risks || [],
          recommendations: parsed.recommendations || [],
          estimatedCompetitors: parsed.estimatedCompetitors || 5,
          competitorNames: parsed.competitorNames || [],
          reasoning: parsed.reasoning || 'Analysis completed.',
        };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    // Fallback response if parsing fails
    return {
      recommendation: 'maybe',
      confidenceLevel: 50,
      winProbability: 50,
      scores: {
        pastPerformance: 50,
        technicalCapability: 50,
        resourceAvailability: 50,
        competitiveLandscape: 50,
      },
      strengths: ['Insufficient data for complete analysis'],
      weaknesses: [],
      risks: ['Analysis incomplete - manual review recommended'],
      recommendations: ['Conduct manual review of opportunity'],
      estimatedCompetitors: 0,
      competitorNames: [],
      reasoning: 'Unable to complete automated analysis. Manual review recommended.',
    };
  }
}
