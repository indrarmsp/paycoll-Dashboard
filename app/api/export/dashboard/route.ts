import { NextRequest, NextResponse } from 'next/server';
import { Workbook } from 'exceljs';

type ExportRequest = {
  filename: string;
  sheetName: string;
  data: Record<string, string | number>[];
};

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();

    if (!body.data || !Array.isArray(body.data)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    if (!body.filename || !body.sheetName) {
      return NextResponse.json(
        { error: 'Filename and sheet name are required' },
        { status: 400 }
      );
    }

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(body.sheetName);

    if (body.data.length > 0) {
      const headers = Object.keys(body.data[0]);
      worksheet.columns = headers.map((header) => ({
        header,
        key: header
      }));

      body.data.forEach((row) => {
        worksheet.addRow(row);
      });

      const colWidths: Record<string, number> = {};
      headers.forEach((header) => {
        colWidths[header] = header.length;
      });

      const sampleLimit = Math.min(body.data.length, 1000);
      for (let i = 0; i < sampleLimit; i += 1) {
        const row = body.data[i];
        for (const header of headers) {
          const val = row[header];
          if (val != null) {
            const len = String(val).length;
            if (len > colWidths[header]) {
              colWidths[header] = len;
            }
          }
        }
      }

      worksheet.columns?.forEach((column) => {
        const key = column.key as string;
        const maxLen = colWidths[key] || 10;
        column.width = Math.min(Math.max(maxLen + 3, 12), 50);
      });

      worksheet.views = [{ state: 'frozen', ySplit: 1 }];

      const headerRow = worksheet.getRow(1);
      headerRow.height = 28;
      headerRow.eachCell((cell) => {
        cell.font = {
          name: 'Calibri',
          size: 11,
          bold: true,
          color: { argb: 'FFFFFFFF' }
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0D8ABC' }
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left'
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF085E80' } },
          left: { style: 'thin', color: { argb: 'FF085E80' } },
          bottom: { style: 'medium', color: { argb: 'FF085E80' } },
          right: { style: 'thin', color: { argb: 'FF085E80' } }
        };
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.height = 20;
          row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle' };
            if (rowNumber % 2 === 0) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF8FAFC' }
              };
            }
            cell.border = {
              bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
          });
        }
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${body.filename}"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        error: 'Export failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
