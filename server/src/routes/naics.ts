// =============================================================================
// NAICS LOOKUP API
// Provide NAICS code search, autocomplete, and hierarchy browsing
// =============================================================================

import { Router, Request, Response } from 'express';
import {
  NAICS_DATABASE,
  searchNAICS,
  getNAICSByCode,
  getPopularNAICS,
  getNAICSChildren,
  getNAICSHierarchy,
} from '../data/naics-codes';

const router = Router();

// GET /api/naics/search?q=engineering
// Search NAICS codes by keyword, title, or code
router.get('/search', (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query must be at least 2 characters',
      });
    }

    const results = searchNAICS(query);

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('NAICS search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search NAICS codes',
    });
  }
});

// GET /api/naics/popular
// Get commonly used NAICS codes in government contracting
router.get('/popular', (req: Request, res: Response) => {
  try {
    const popular = getPopularNAICS();

    res.json({
      success: true,
      data: popular,
      count: popular.length,
    });
  } catch (error) {
    console.error('Get popular NAICS error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular NAICS codes',
    });
  }
});

// GET /api/naics/code/:code
// Get details for a specific NAICS code
router.get('/code/:code', (req: Request, res: Response) => {
  try {
    const code = req.params.code;

    if (!/^\d{1,6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid NAICS code format',
      });
    }

    const naics = getNAICSByCode(code);

    if (!naics) {
      return res.status(404).json({
        success: false,
        error: 'NAICS code not found',
      });
    }

    res.json({
      success: true,
      data: naics,
    });
  } catch (error) {
    console.error('Get NAICS code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NAICS code',
    });
  }
});

// GET /api/naics/hierarchy/:code
// Get full hierarchy path for a NAICS code
router.get('/hierarchy/:code', (req: Request, res: Response) => {
  try {
    const code = req.params.code;

    if (!/^\d{1,6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid NAICS code format',
      });
    }

    const hierarchy = getNAICSHierarchy(code);

    if (hierarchy.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'NAICS code not found',
      });
    }

    res.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    console.error('Get NAICS hierarchy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NAICS hierarchy',
    });
  }
});

// GET /api/naics/children/:code
// Get child codes for a parent NAICS code
router.get('/children/:code', (req: Request, res: Response) => {
  try {
    const code = req.params.code;

    if (!/^\d{1,6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid NAICS code format',
      });
    }

    const children = getNAICSChildren(code);

    res.json({
      success: true,
      data: children,
      count: children.length,
    });
  } catch (error) {
    console.error('Get NAICS children error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NAICS children',
    });
  }
});

// GET /api/naics/all
// Get all NAICS codes (use with caution - large dataset)
router.get('/all', (req: Request, res: Response) => {
  try {
    const level = req.query.level ? parseInt(req.query.level as string) : undefined;

    let data = NAICS_DATABASE;

    if (level) {
      data = data.filter(n => n.level === level);
    }

    res.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error('Get all NAICS error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NAICS codes',
    });
  }
});

export default router;
