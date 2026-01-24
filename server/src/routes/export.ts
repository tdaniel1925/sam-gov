// =============================================================================
// EXPORT ROUTES
// Following CodeBakers pattern 06e-documents.md + 02-auth.md
// Protected with authentication middleware
// =============================================================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import type { Opportunity } from '../types/samgov';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Validation schema
const exportSchema = z.object({
  format: z.enum(['csv', 'excel']),
  opportunities: z.array(z.record(z.any())).min(1),
});

// Standardized error response
function errorResponse(
  res: Response,
  message: string,
  code: string,
  status: number
) {
  return res.status(status).json({
    error: message,
    code,
  });
}

// POST /api/export - Export opportunities
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const result = exportSchema.safeParse(req.body);

    if (!result.success) {
      return errorResponse(
        res,
        'Validation failed',
        'VALIDATION_ERROR',
        400
      );
    }

    const { format, opportunities } = result.data;

    if (format === 'csv') {
      return exportToCSV(opportunities, res);
    } else if (format === 'excel') {
      return exportToExcel(opportunities, res);
    }

  } catch (error) {
    console.error('Export error:', error);
    return errorResponse(
      res,
      'Failed to export data',
      'EXPORT_ERROR',
      500
    );
  }
});

// Export to CSV
function exportToCSV(opportunities: any[], res: Response) {
  try {
    // Define fields to include in CSV
    const fields = [
      { label: 'Notice ID', value: 'noticeId' },
      { label: 'Title', value: 'title' },
      { label: 'Solicitation Number', value: 'solicitationNumber' },
      { label: 'Department', value: 'department' },
      { label: 'Posted Date', value: 'postedDate' },
      { label: 'Response Deadline', value: 'responseDeadLine' },
      { label: 'NAICS Code', value: 'naicsCode' },
      { label: 'Type', value: 'type' },
      { label: 'Contact Email', value: (row: any) => row.pointOfContact?.[0]?.email || '' },
      { label: 'Link', value: 'uiLink' },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(opportunities);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=opportunities.csv');
    return res.send(csv);

  } catch (error) {
    console.error('CSV export error:', error);
    return errorResponse(
      res,
      'Failed to generate CSV',
      'CSV_ERROR',
      500
    );
  }
}

// Export to Excel
async function exportToExcel(opportunities: any[], res: Response) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Opportunities');

    // Define columns
    worksheet.columns = [
      { header: 'Notice ID', key: 'noticeId', width: 25 },
      { header: 'Title', key: 'title', width: 40 },
      { header: 'Solicitation Number', key: 'solicitationNumber', width: 20 },
      { header: 'Department', key: 'department', width: 30 },
      { header: 'Posted Date', key: 'postedDate', width: 15 },
      { header: 'Response Deadline', key: 'responseDeadLine', width: 20 },
      { header: 'NAICS Code', key: 'naicsCode', width: 12 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Contact Email', key: 'contactEmail', width: 30 },
      { header: 'Link', key: 'uiLink', width: 40 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    opportunities.forEach((opp: any) => {
      worksheet.addRow({
        noticeId: opp.noticeId,
        title: opp.title,
        solicitationNumber: opp.solicitationNumber,
        department: opp.department,
        postedDate: opp.postedDate,
        responseDeadLine: opp.responseDeadLine,
        naicsCode: opp.naicsCode,
        type: opp.type,
        contactEmail: opp.pointOfContact?.[0]?.email || '',
        uiLink: opp.uiLink,
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=opportunities.xlsx');
    return res.send(buffer);

  } catch (error) {
    console.error('Excel export error:', error);
    return errorResponse(
      res,
      'Failed to generate Excel file',
      'EXCEL_ERROR',
      500
    );
  }
}

export default router;
