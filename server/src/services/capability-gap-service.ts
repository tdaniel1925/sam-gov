// =============================================================================
// CAPABILITY GAP ANALYSIS SERVICE
// Following CodeBakers pattern 14-ai.md
// One of the 3 priority features: "Team capability gap analysis"
// =============================================================================

import { AIClient } from '../lib/ai-client';
import { db } from '../db';
import { proposals, proposalRequirements, proposalTeamMembers, capabilityGaps } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface CapabilityGap {
  requiredSkill: string;
  criticality: 'high' | 'medium' | 'low';
  currentCoverage: boolean;
  gapDescription: string;
  recommendedAction: string;
  estimatedCost: number | null;
  timeToFill: number | null; // days
  notes: string;
}

export interface CapabilityAnalysis {
  overallReadiness: number; // 0-100
  criticalGaps: CapabilityGap[];
  mediumGaps: CapabilityGap[];
  lowGaps: CapabilityGap[];
  strengths: string[];
  recommendations: string[];
  estimatedTotalCost: number;
  estimatedTimeToReady: number; // days
  summary: string;
}

export class CapabilityGapService {
  /**
   * Analyze capability gaps for a proposal
   */
  static async analyzeCapabilityGaps(
    userId: string,
    proposalId: string
  ): Promise<CapabilityAnalysis> {
    // Get proposal with requirements
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(and(
        eq(proposals.id, proposalId),
        eq(proposals.userId, userId)
      ))
      .limit(1);

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Get requirements
    const requirements = await db
      .select()
      .from(proposalRequirements)
      .where(eq(proposalRequirements.proposalId, proposalId));

    // Get team members
    const teamMembers = await db
      .select()
      .from(proposalTeamMembers)
      .where(eq(proposalTeamMembers.userId, userId));

    // Build AI analysis prompt
    const prompt = this.buildAnalysisPrompt(proposal, requirements, teamMembers);

    // Get AI analysis
    const aiClient = new AIClient();
    const aiResponse = await aiClient.generateText(prompt, {
      temperature: 0.3,
      maxTokens: 2500,
    });

    // Parse AI response
    const analysis = this.parseAIResponse(aiResponse);

    // Save gaps to database
    const allGaps = [
      ...analysis.criticalGaps,
      ...analysis.mediumGaps,
      ...analysis.lowGaps,
    ];

    if (allGaps.length > 0) {
      // Delete existing gaps for this proposal
      await db
        .delete(capabilityGaps)
        .where(eq(capabilityGaps.proposalId, proposalId));

      // Insert new gaps
      const gapsToInsert = allGaps.map(gap => ({
        proposalId: proposalId,
        requiredSkill: gap.requiredSkill,
        criticality: gap.criticality,
        currentCoverage: gap.currentCoverage,
        gapDescription: gap.gapDescription,
        recommendedAction: gap.recommendedAction,
        estimatedCost: gap.estimatedCost?.toString() || null,
        timeToFill: gap.timeToFill,
        notes: gap.notes,
      }));

      await db.insert(capabilityGaps).values(gapsToInsert);
    }

    return analysis;
  }

  /**
   * Build the AI analysis prompt
   */
  private static buildAnalysisPrompt(
    proposal: any,
    requirements: any[],
    teamMembers: any[]
  ): string {
    const opportunityContext = `
OPPORTUNITY DETAILS:
- Title: ${proposal.title}
- Agency: ${proposal.agencyName || 'Unknown'}
- Solicitation: ${proposal.solicitationNumber || 'Unknown'}
- Description: ${JSON.stringify(proposal.metadata || {})}
`;

    const requirementsContext = requirements.length > 0
      ? `
IDENTIFIED REQUIREMENTS:
${requirements.map((req, idx) => `
${idx + 1}. [${req.requirementType.toUpperCase()}] ${req.requirementText}
`).join('\n')}
`
      : 'REQUIREMENTS: No specific requirements extracted yet.';

    const teamContext = teamMembers.length > 0
      ? `
CURRENT TEAM CAPABILITIES:
${teamMembers.map((member, idx) => `
${idx + 1}. ${member.name} - ${member.title || 'N/A'}
   - Skills: ${Array.isArray(member.skills) ? member.skills.join(', ') : 'N/A'}
   - Certifications: ${Array.isArray(member.certifications) ? member.certifications.join(', ') : 'N/A'}
   - Clearance: ${member.clearanceLevel || 'None'}
   - Available: ${member.availability ? 'Yes' : 'No'}
   - Rate: ${member.hourlyRate ? `$${member.hourlyRate}/hr` : 'N/A'}
`).join('\n')}
`
      : 'CURRENT TEAM: No team members on file.';

    return `You are an expert in government contracting and team capability assessment. Analyze this opportunity against the current team capabilities and identify all capability gaps.

${opportunityContext}

${requirementsContext}

${teamContext}

Provide your analysis in the following JSON format:
{
  "overallReadiness": <0-100>,
  "criticalGaps": [
    {
      "requiredSkill": "skill name",
      "criticality": "high",
      "currentCoverage": false,
      "gapDescription": "detailed gap description",
      "recommendedAction": "hire | train | partner | subcontract",
      "estimatedCost": <number or null>,
      "timeToFill": <days or null>,
      "notes": "additional notes"
    }
  ],
  "mediumGaps": [ /* same structure */ ],
  "lowGaps": [ /* same structure */ ],
  "strengths": ["strength 1", "strength 2", ...],
  "recommendations": ["action 1", "action 2", ...],
  "estimatedTotalCost": <number>,
  "estimatedTimeToReady": <days>,
  "summary": "Overall capability gap analysis summary"
}

Analysis criteria:
1. Match team skills/certs/clearances against requirements
2. Identify missing critical skills (high priority)
3. Identify missing nice-to-have skills (medium/low priority)
4. Consider team availability and capacity
5. Estimate costs to fill gaps (hiring, training, subcontracting)
6. Estimate time needed to acquire missing capabilities

Criticality levels:
- HIGH: Required for contract award, mandatory requirements
- MEDIUM: Highly desired, improves competitive position
- LOW: Nice to have, minor improvement

Recommended actions:
- hire: Bring on new full-time staff
- train: Train existing staff
- partner: Form teaming agreement
- subcontract: Hire subcontractor for specific work

Be specific and actionable in your recommendations.`;
  }

  /**
   * Parse AI response into structured analysis
   */
  private static parseAIResponse(aiResponse: string): CapabilityAnalysis {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          overallReadiness: parsed.overallReadiness || 50,
          criticalGaps: parsed.criticalGaps || [],
          mediumGaps: parsed.mediumGaps || [],
          lowGaps: parsed.lowGaps || [],
          strengths: parsed.strengths || [],
          recommendations: parsed.recommendations || [],
          estimatedTotalCost: parsed.estimatedTotalCost || 0,
          estimatedTimeToReady: parsed.estimatedTimeToReady || 0,
          summary: parsed.summary || 'Capability analysis completed.',
        };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    // Fallback response if parsing fails
    return {
      overallReadiness: 50,
      criticalGaps: [],
      mediumGaps: [{
        requiredSkill: 'Complete team profile',
        criticality: 'medium',
        currentCoverage: false,
        gapDescription: 'Unable to complete automated analysis due to incomplete data.',
        recommendedAction: 'Add team members and their skills to enable accurate gap analysis.',
        estimatedCost: null,
        timeToFill: null,
        notes: 'Manual review recommended.',
      }],
      lowGaps: [],
      strengths: [],
      recommendations: ['Add team member profiles with skills and certifications', 'Extract more detailed requirements from the RFP'],
      estimatedTotalCost: 0,
      estimatedTimeToReady: 0,
      summary: 'Insufficient data for complete capability gap analysis. Please add team members and requirements.',
    };
  }

  /**
   * Get existing capability gaps for a proposal
   */
  static async getCapabilityGaps(proposalId: string): Promise<CapabilityGap[]> {
    const gaps = await db
      .select()
      .from(capabilityGaps)
      .where(eq(capabilityGaps.proposalId, proposalId));

    return gaps.map(gap => ({
      requiredSkill: gap.requiredSkill,
      criticality: gap.criticality as 'high' | 'medium' | 'low',
      currentCoverage: gap.currentCoverage,
      gapDescription: gap.gapDescription || '',
      recommendedAction: gap.recommendedAction || '',
      estimatedCost: gap.estimatedCost ? parseFloat(gap.estimatedCost) : null,
      timeToFill: gap.timeToFill,
      notes: gap.notes || '',
    }));
  }
}
