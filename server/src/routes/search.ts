// =============================================================================
// SEARCH ROUTES
// Following CodeBakers pattern 03-api.md
// =============================================================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { SAMGovService } from '../services/samgov-service';
import { AISummarizationService } from '../services/ai-summarization-service';
import { AIScoringService } from '../services/ai-scoring-service';
import { db } from '../db';
import { companyProfile } from '../db/schema';

const router = Router();

// Advanced validation schema with all filters
const searchSchema = z.object({
  // Required dates
  postedFrom: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in MM/DD/YYYY format'),
  postedTo: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in MM/DD/YYYY format'),

  // Core filters
  naicsCode: z.string().regex(/^\d{1,6}$/, 'NAICS code must be 1-6 digits').optional(),
  procurementType: z.string().optional(), // o=solicitation, p=presolicitation

  // Advanced filters
  solicitationNumber: z.string().optional(),
  noticeId: z.string().optional(),
  state: z.string().length(2, 'State must be 2-letter code').optional(),
  zip: z.string().optional(),
  organizationName: z.string().optional(),
  setAside: z.string().optional(), // SBA, WOSB, SDVOSB, etc.
  classificationCode: z.string().optional(), // PSC code
  responseDeadlineFrom: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in MM/DD/YYYY format').optional(),
  responseDeadlineTo: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in MM/DD/YYYY format').optional(),
  keywords: z.string().optional(), // Full-text search

  // Pagination
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),

  // AI options
  withAI: z.boolean().optional(), // Include AI scoring and summarization
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

// POST /api/search - Advanced search with all filters and optional AI analysis
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const result = searchSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const {
      naicsCode,
      postedFrom,
      postedTo,
      procurementType,
      solicitationNumber,
      noticeId,
      state,
      zip,
      organizationName,
      setAside,
      classificationCode,
      responseDeadlineFrom,
      responseDeadlineTo,
      keywords,
      limit,
      offset,
      withAI,
    } = result.data;

    // Call SAM.gov API with all filters
    const searchResults = await SAMGovService.searchOpportunities({
      ncode: naicsCode,
      postedFrom,
      postedTo,
      ptype: procurementType,
      solicitationNumber,
      noticeId,
      state,
      zip,
      organizationName,
      setAside,
      classificationCode,
      responseDeadlineFrom,
      responseDeadlineTo,
      keywords,
      limit: limit || 20,
      offset: offset || 0,
    });

    // If AI analysis requested, add scoring and summarization
    if (withAI && searchResults.opportunitiesData.length > 0) {
      // Get company profile for scoring
      const profiles = await db.select().from(companyProfile).limit(1);
      const profile = profiles.length > 0 ? profiles[0] : null;

      // Score and summarize top opportunities
      const enhancedOpportunities = await Promise.all(
        searchResults.opportunitiesData.slice(0, 10).map(async (opp) => {
          try {
            const [score, summary] = await Promise.all([
              AIScoringService.scoreOpportunity(opp, profile),
              AISummarizationService.summarizeOpportunity(opp),
            ]);

            return {
              ...opp,
              aiScore: score,
              aiSummary: summary,
            };
          } catch (error) {
            console.error(`AI analysis failed for ${opp.noticeId}:`, error);
            return opp; // Return without AI data on error
          }
        })
      );

      return res.json({
        data: {
          ...searchResults,
          opportunitiesData: [
            ...enhancedOpportunities,
            ...searchResults.opportunitiesData.slice(10),
          ],
        },
        success: true,
        aiEnhanced: true,
      });
    }

    return res.json({
      data: searchResults,
      success: true,
      aiEnhanced: false,
    });

  } catch (error) {
    console.error('Search error:', error);

    if (error instanceof Error) {
      return errorResponse(
        res,
        error.message,
        'SEARCH_ERROR',
        500
      );
    }

    return errorResponse(
      res,
      'Internal server error',
      'INTERNAL_ERROR',
      500
    );
  }
});

// GET /api/search/recent - Get recent opportunities
router.get('/recent', async (req: Request, res: Response) => {
  try {
    const naicsCode = req.query.naicsCode as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const opportunities = await SAMGovService.getRecentOpportunities(naicsCode, limit);

    return res.json({
      data: opportunities,
      success: true,
    });

  } catch (error) {
    console.error('Recent search error:', error);

    if (error instanceof Error) {
      return errorResponse(
        res,
        error.message,
        'SEARCH_ERROR',
        500
      );
    }

    return errorResponse(
      res,
      'Internal server error',
      'INTERNAL_ERROR',
      500
    );
  }
});

export default router;
