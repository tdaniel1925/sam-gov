// =============================================================================
// SAM.GOV IMPORT ROUTES
// Following CodeBakers pattern 03-api.md
// One of the 3 priority features: "Integration with SAM.gov for direct opportunity import"
// =============================================================================

import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { proposals, proposalRequirements } from '../db/schema';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { SAMGovService } from '../services/samgov-service';

const router = Router();

// Validation schema
const importOpportunitySchema = z.object({
  opportunityId: z.string().min(1, 'Opportunity ID is required'),
  noticeId: z.string().optional(), // SAM.gov notice ID
});

// Standardized error response
function errorResponse(
  res: Response,
  message: string,
  code: string,
  status: number,
  details?: Record<string, string[]>
) {
  return res.status(status).json({
    error: message,
    code,
    details,
  });
}

// Helper function to extract requirements from description
function extractRequirements(description: string): Array<{
  text: string;
  type: 'mandatory' | 'desired' | 'optional';
}> {
  const requirements: Array<{ text: string; type: 'mandatory' | 'desired' | 'optional' }> = [];

  // Common requirement patterns
  const mandatoryPatterns = [
    /must\s+(.+?)(?:\.|;|$)/gi,
    /shall\s+(.+?)(?:\.|;|$)/gi,
    /required\s+to\s+(.+?)(?:\.|;|$)/gi,
    /mandatory:\s*(.+?)(?:\.|;|$)/gi,
  ];

  const desiredPatterns = [
    /should\s+(.+?)(?:\.|;|$)/gi,
    /desired:\s*(.+?)(?:\.|;|$)/gi,
    /preferred:\s*(.+?)(?:\.|;|$)/gi,
  ];

  // Extract mandatory requirements
  mandatoryPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(description)) !== null) {
      const text = match[0].trim();
      if (text.length > 10 && text.length < 500) {
        requirements.push({ text, type: 'mandatory' });
      }
    }
  });

  // Extract desired requirements
  desiredPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(description)) !== null) {
      const text = match[0].trim();
      if (text.length > 10 && text.length < 500) {
        requirements.push({ text, type: 'desired' });
      }
    }
  });

  return requirements;
}

// POST /api/samgov-import/opportunity - Import opportunity from SAM.gov
router.post('/opportunity', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    // Validate request body
    const result = importOpportunitySchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { opportunityId, noticeId } = result.data;

    // Fetch opportunity details from SAM.gov
    let opportunityData;
    try {
      // Get dates for search (last 365 days)
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setDate(today.getDate() - 365);

      const formatDate = (date: Date): string => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };

      if (noticeId) {
        // Search by notice ID
        const searchResult = await SAMGovService.searchOpportunities({
          noticeId: noticeId,
          postedFrom: formatDate(oneYearAgo),
          postedTo: formatDate(today),
          limit: 1,
        });

        if (searchResult.opportunitiesData && searchResult.opportunitiesData.length > 0) {
          opportunityData = searchResult.opportunitiesData[0];
        } else {
          return errorResponse(
            res,
            'Opportunity not found in SAM.gov',
            'NOT_FOUND',
            404
          );
        }
      } else {
        // Search by solicitation number or keyword
        const searchResult = await SAMGovService.searchOpportunities({
          solicitationNumber: opportunityId,
          postedFrom: formatDate(oneYearAgo),
          postedTo: formatDate(today),
          limit: 1,
        });

        if (searchResult.opportunitiesData && searchResult.opportunitiesData.length > 0) {
          opportunityData = searchResult.opportunitiesData[0];
        } else {
          return errorResponse(
            res,
            'Opportunity not found in SAM.gov',
            'NOT_FOUND',
            404
          );
        }
      }
    } catch (error) {
      console.error('SAM.gov API error:', error);
      return errorResponse(
        res,
        'Failed to fetch opportunity from SAM.gov',
        'SAMGOV_ERROR',
        500
      );
    }

    // Extract key information
    const title = opportunityData.title || 'Untitled Opportunity';
    const solicitationNumber = opportunityData.solicitationNumber || opportunityData.noticeId;
    const agencyName = opportunityData.fullParentPathName || opportunityData.department;
    const dueDate = opportunityData.responseDeadLine;
    const description = opportunityData.description || '';

    // Create proposal
    const [newProposal] = await db
      .insert(proposals)
      .values({
        userId: req.user.id,
        opportunityId: opportunityId,
        title: title,
        solicitationNumber: solicitationNumber,
        agencyName: agencyName,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: 'draft',
        metadata: {
          importedFrom: 'samgov',
          noticeId: noticeId || opportunityData.noticeId,
          naicsCode: opportunityData.naicsCode,
          setAside: opportunityData.typeOfSetAside,
          placeOfPerformance: opportunityData.placeOfPerformance?.city?.name,
          importedAt: new Date().toISOString(),
        },
      })
      .returning();

    // Extract and save requirements
    const extractedReqs = extractRequirements(description);

    if (extractedReqs.length > 0) {
      const requirementsToInsert = extractedReqs.map(req => ({
        proposalId: newProposal.id,
        requirementText: req.text,
        requirementType: req.type,
        complianceStatus: 'missing' as const,
      }));

      await db.insert(proposalRequirements).values(requirementsToInsert);
    }

    // Get the complete proposal with requirements
    const requirements = await db
      .select()
      .from(proposalRequirements)
      .where(proposalRequirements.proposalId === newProposal.id);

    return res.status(201).json({
      data: {
        ...newProposal,
        requirements,
        extractedRequirementsCount: requirements.length,
      },
      success: true,
      message: `Proposal created successfully from SAM.gov opportunity. ${requirements.length} requirements extracted.`,
    });

  } catch (error) {
    console.error('Import opportunity error:', error);
    return errorResponse(
      res,
      'Failed to import opportunity',
      'IMPORT_ERROR',
      500
    );
  }
});

// GET /api/samgov-import/preview/:noticeId - Preview what would be imported
router.get('/preview/:noticeId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const { noticeId } = req.params;

    // Fetch opportunity details
    let opportunityData;
    try {
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setDate(today.getDate() - 365);

      const formatDate = (date: Date): string => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };

      const searchResult = await SAMGovService.searchOpportunities({
        noticeId: noticeId,
        postedFrom: formatDate(oneYearAgo),
        postedTo: formatDate(today),
        limit: 1,
      });

      if (searchResult.opportunitiesData && searchResult.opportunitiesData.length > 0) {
        opportunityData = searchResult.opportunitiesData[0];
      } else {
        return errorResponse(
          res,
          'Opportunity not found in SAM.gov',
          'NOT_FOUND',
          404
        );
      }
    } catch (error) {
      console.error('SAM.gov API error:', error);
      return errorResponse(
        res,
        'Failed to fetch opportunity from SAM.gov',
        'SAMGOV_ERROR',
        500
      );
    }

    // Extract requirements preview
    const description = opportunityData.description || '';
    const extractedReqs = extractRequirements(description);

    return res.json({
      data: {
        title: opportunityData.title,
        solicitationNumber: opportunityData.solicitationNumber,
        agencyName: opportunityData.fullParentPathName || opportunityData.department,
        dueDate: opportunityData.responseDeadLine,
        naicsCode: opportunityData.naicsCode,
        setAside: opportunityData.typeOfSetAside,
        extractedRequirementsCount: extractedReqs.length,
        requirements: extractedReqs.slice(0, 10), // Preview first 10
      },
      success: true,
    });

  } catch (error) {
    console.error('Preview opportunity error:', error);
    return errorResponse(
      res,
      'Failed to preview opportunity',
      'PREVIEW_ERROR',
      500
    );
  }
});

export default router;
