// =============================================================================
// WIN RATE DASHBOARD API
// Track proposal submission and win rate analytics
// =============================================================================

import { Router, Response } from 'express';
import { db } from '../db';
import { proposals } from '../db/schema';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

const router = Router();

// =============================================================================
// GET /api/win-rate/stats
// Get overall win rate statistics
// =============================================================================
router.get('/stats', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    // Build where clause
    const whereConditions = [eq(proposals.userId, userId)];

    if (startDate) {
      whereConditions.push(gte(proposals.createdAt, new Date(startDate as string)));
    }

    if (endDate) {
      whereConditions.push(lte(proposals.createdAt, new Date(endDate as string)));
    }

    // Get all proposals
    const allProposals = await db
      .select()
      .from(proposals)
      .where(and(...whereConditions));

    // Calculate statistics
    const totalProposals = allProposals.length;
    const submitted = allProposals.filter(p =>
      ['submitted', 'won', 'lost'].includes(p.status)
    ).length;
    const won = allProposals.filter(p => p.status === 'won').length;
    const lost = allProposals.filter(p => p.status === 'lost').length;
    const inProgress = allProposals.filter(p =>
      ['draft', 'in_progress', 'under_review'].includes(p.status)
    ).length;
    const withdrawn = allProposals.filter(p => p.status === 'withdrawn').length;

    // Calculate win rate (only for decided proposals)
    const decidedProposals = won + lost;
    const winRate = decidedProposals > 0 ? (won / decidedProposals) * 100 : 0;

    // Calculate total value
    const totalValue = allProposals.reduce((sum, p) => {
      const value = p.estimatedValue ? parseFloat(p.estimatedValue.toString()) : 0;
      return sum + value;
    }, 0);

    const wonValue = allProposals
      .filter(p => p.status === 'won')
      .reduce((sum, p) => {
        const value = p.estimatedValue ? parseFloat(p.estimatedValue.toString()) : 0;
        return sum + value;
      }, 0);

    // Average win probability
    const proposalsWithWinProb = allProposals.filter(p => p.winProbability !== null);
    const avgWinProbability = proposalsWithWinProb.length > 0
      ? proposalsWithWinProb.reduce((sum, p) => sum + (p.winProbability || 0), 0) / proposalsWithWinProb.length
      : 0;

    res.json({
      success: true,
      data: {
        totalProposals,
        submitted,
        won,
        lost,
        inProgress,
        withdrawn,
        decidedProposals,
        winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal
        totalValue: Math.round(totalValue),
        wonValue: Math.round(wonValue),
        avgWinProbability: Math.round(avgWinProbability),
      },
    });
  } catch (error) {
    console.error('Get win rate stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get win rate statistics',
    });
  }
});

// =============================================================================
// GET /api/win-rate/trends
// Get win rate trends over time (monthly)
// =============================================================================
router.get('/trends', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { months = 12 } = req.query;

    // Get proposals from last N months
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months as string));

    const allProposals = await db
      .select()
      .from(proposals)
      .where(
        and(
          eq(proposals.userId, userId),
          gte(proposals.createdAt, monthsAgo)
        )
      )
      .orderBy(proposals.createdAt);

    // Group by month
    const monthlyData = new Map<string, {
      month: string;
      total: number;
      won: number;
      lost: number;
      submitted: number;
      winRate: number;
    }>();

    allProposals.forEach(proposal => {
      const monthKey = proposal.createdAt.toISOString().substring(0, 7); // YYYY-MM

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          total: 0,
          won: 0,
          lost: 0,
          submitted: 0,
          winRate: 0,
        });
      }

      const data = monthlyData.get(monthKey)!;
      data.total++;

      if (proposal.status === 'won') data.won++;
      if (proposal.status === 'lost') data.lost++;
      if (['submitted', 'won', 'lost'].includes(proposal.status)) data.submitted++;
    });

    // Calculate win rates
    const trends = Array.from(monthlyData.values()).map(data => ({
      ...data,
      winRate: (data.won + data.lost) > 0
        ? Math.round((data.won / (data.won + data.lost)) * 100 * 10) / 10
        : 0,
    }));

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error('Get win rate trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get win rate trends',
    });
  }
});

// =============================================================================
// GET /api/win-rate/by-agency
// Get win rate breakdown by agency
// =============================================================================
router.get('/by-agency', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const allProposals = await db
      .select()
      .from(proposals)
      .where(eq(proposals.userId, userId));

    // Group by agency
    const agencyData = new Map<string, {
      agency: string;
      total: number;
      won: number;
      lost: number;
      winRate: number;
      totalValue: number;
    }>();

    allProposals.forEach(proposal => {
      const agency = proposal.agencyName || 'Unknown';

      if (!agencyData.has(agency)) {
        agencyData.set(agency, {
          agency,
          total: 0,
          won: 0,
          lost: 0,
          winRate: 0,
          totalValue: 0,
        });
      }

      const data = agencyData.get(agency)!;
      data.total++;

      if (proposal.status === 'won') data.won++;
      if (proposal.status === 'lost') data.lost++;

      const value = proposal.estimatedValue ? parseFloat(proposal.estimatedValue.toString()) : 0;
      data.totalValue += value;
    });

    // Calculate win rates and sort by total proposals
    const byAgency = Array.from(agencyData.values())
      .map(data => ({
        ...data,
        winRate: (data.won + data.lost) > 0
          ? Math.round((data.won / (data.won + data.lost)) * 100 * 10) / 10
          : 0,
        totalValue: Math.round(data.totalValue),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 agencies

    res.json({
      success: true,
      data: byAgency,
    });
  } catch (error) {
    console.error('Get win rate by agency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get win rate by agency',
    });
  }
});

// =============================================================================
// GET /api/win-rate/recent-decisions
// Get recent proposal decisions
// =============================================================================
router.get('/recent-decisions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { limit = 10 } = req.query;

    const recentDecisions = await db
      .select()
      .from(proposals)
      .where(
        and(
          eq(proposals.userId, userId),
          sql`${proposals.status} IN ('won', 'lost', 'submitted')`
        )
      )
      .orderBy(desc(proposals.updatedAt))
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      data: recentDecisions.map(p => ({
        id: p.id,
        title: p.title,
        solicitationNumber: p.solicitationNumber,
        agencyName: p.agencyName,
        status: p.status,
        estimatedValue: p.estimatedValue ? parseFloat(p.estimatedValue.toString()) : null,
        winProbability: p.winProbability,
        dueDate: p.dueDate,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get recent decisions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent decisions',
    });
  }
});

export default router;
