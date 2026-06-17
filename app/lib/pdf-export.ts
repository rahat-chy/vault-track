import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import type { Loan, LoanPayment, OneTimeInvestment, OneTimeInvestmentReturn, Stock } from './types';
import { LoanType } from './types';
import { formatCurrency, formatDate } from './format';
import { stockTotals } from './stocks';

interface ExportLoan extends Loan {
  payments: LoanPayment[];
}

interface ExportInvestment extends OneTimeInvestment {
  returns: OneTimeInvestmentReturn[];
}

interface ExportData {
  loans: ExportLoan[];
  investments: ExportInvestment[];
  stocks: Stock[];
}

function getFilename(): string {
  // UTC+6
  const now = new Date(Date.now() + 6 * 60 * 60 * 1000);
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = now.getUTCFullYear();
  const HH = String(now.getUTCHours()).padStart(2, '0');
  const MM = String(now.getUTCMinutes()).padStart(2, '0');
  const SS = String(now.getUTCSeconds()).padStart(2, '0');
  return `${dd}_${mm}_${yyyy}_${HH}_${MM}_${SS}_personal_finance.pdf`;
}

function lastY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}

function ensureSpace(doc: jsPDF, y: number, needed = 40): number {
  if (y + needed > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    return 20;
  }
  return y;
}

function sectionHeader(doc: jsPDF, title: string, y: number): number {
  y = ensureSpace(doc, y, 20);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(title, 14, y);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(14, y + 2, doc.internal.pageSize.getWidth() - 14, y + 2);
  return y + 9;
}

function subLabel(doc: jsPDF, label: string, x: number, y: number): number {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(label, x, y);
  return y + 2;
}

function addFooters(doc: jsPDF): void {
  const pageCount = (doc.internal as unknown as { pages: unknown[] }).pages.length - 1;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const year = new Date().getFullYear();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, pageH - 13, pageW - 14, pageH - 13);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `© ${year} Rahat Chowdhury. All rights reserved.`,
      pageW / 2,
      pageH - 8,
      { align: 'center' },
    );
  }
}

function noData(doc: jsPDF, y: number): number {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('No data', 14, y);
  return y + 10;
}

function itemHeader(doc: jsPDF, title: string, subtitle: string | null, y: number): number {
  y = ensureSpace(doc, y, 25);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(title, 14, y);
  if (subtitle) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, y + 4);
    return y + 8;
  }
  return y + 6;
}

export async function exportToPdf(): Promise<void> {
  const res = await fetch('/api/export');
  if (!res.ok) throw new Error('Failed to fetch export data');
  const { loans, investments, stocks }: ExportData = await res.json();

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // Cover header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Personal Finance Report', pageW / 2, 22, { align: 'center' });

  const now = new Date(Date.now() + 6 * 60 * 60 * 1000);
  const genLabel = now.toUTCString().replace('GMT', 'UTC+6');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${genLabel}`, pageW / 2, 30, { align: 'center' });

  let y = 42;

  // ── Loans Given ──────────────────────────────────────────────────────────────
  const loansGiven = loans.filter((l) => l.type === LoanType.GIVEN);
  y = sectionHeader(doc, 'Loans Given', y);

  if (loansGiven.length === 0) {
    y = noData(doc, y);
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Person', 'Phone', 'Principal', 'Paid', 'Remaining', 'Status', 'Start Date', 'Due Date', 'Notes']],
      body: loansGiven.map((l) => {
        const principal = Number(l.principalAmount);
        const paid = Number(l.totalPaid);
        return [
          l.person.name,
          l.person.phone,
          formatCurrency(principal),
          formatCurrency(paid),
          formatCurrency(Math.max(principal - paid, 0)),
          l.status,
          formatDate(l.startDate),
          l.dueDate ? formatDate(l.dueDate) : '—',
          l.notes ?? '—',
        ];
      }),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });
    y = lastY(doc) + 8;

    for (const loan of loansGiven) {
      if (loan.payments.length === 0) continue;
      y = ensureSpace(doc, y, 20);
      y = itemHeader(doc, loan.person.name, `${loan.payments.length} payment(s)`, y);
      y = subLabel(doc, 'Payments', 18, y);
      autoTable(doc, {
        startY: y,
        head: [['Amount', 'Date', 'Notes']],
        body: loan.payments.map((p) => [
          formatCurrency(Number(p.amount)),
          formatDate(p.paidAt),
          p.notes ?? '—',
        ]),
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 7.5 },
        margin: { left: 18, right: 14 },
      });
      y = lastY(doc) + 7;
    }

    y += 4;
  }

  // ── Loans Taken ───────────────────────────────────────────────────────────────
  y = sectionHeader(doc, 'Loans Taken', y);
  const loansTaken = loans.filter((l) => l.type === LoanType.TAKEN);

  if (loansTaken.length === 0) {
    y = noData(doc, y);
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Person', 'Phone', 'Principal', 'Paid', 'Remaining', 'Status', 'Start Date', 'Due Date', 'Notes']],
      body: loansTaken.map((l) => {
        const principal = Number(l.principalAmount);
        const paid = Number(l.totalPaid);
        return [
          l.person.name,
          l.person.phone,
          formatCurrency(principal),
          formatCurrency(paid),
          formatCurrency(Math.max(principal - paid, 0)),
          l.status,
          formatDate(l.startDate),
          l.dueDate ? formatDate(l.dueDate) : '—',
          l.notes ?? '—',
        ];
      }),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [217, 119, 6], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });
    y = lastY(doc) + 8;

    for (const loan of loansTaken) {
      if (loan.payments.length === 0) continue;
      y = ensureSpace(doc, y, 20);
      y = itemHeader(doc, loan.person.name, `${loan.payments.length} payment(s)`, y);
      y = subLabel(doc, 'Payments', 18, y);
      autoTable(doc, {
        startY: y,
        head: [['Amount', 'Date', 'Notes']],
        body: loan.payments.map((p) => [
          formatCurrency(Number(p.amount)),
          formatDate(p.paidAt),
          p.notes ?? '—',
        ]),
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [245, 158, 11], textColor: 255, fontSize: 7.5 },
        margin: { left: 18, right: 14 },
      });
      y = lastY(doc) + 7;
    }

    y += 4;
  }

  // ── One-Time Investments ─────────────────────────────────────────────────────
  y = sectionHeader(doc, 'One-Time Investments', y);

  if (investments.length === 0) {
    y = noData(doc, y);
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Name', 'Invested', 'Discount', 'Return', 'Net P&L', 'Status', 'Date', 'Description']],
      body: investments.map((i) => {
        const invested = Number(i.investedAmount);
        const discount = Number(i.discountAmount ?? 0);
        const returned = Number(i.returnAmount);
        const net = returned - (invested - discount);
        return [
          i.name,
          formatCurrency(invested),
          discount > 0 ? formatCurrency(discount) : '—',
          formatCurrency(returned),
          (net >= 0 ? '+' : '') + formatCurrency(net),
          i.status,
          formatDate(i.investmentDate),
          i.description ?? '—',
        ];
      }),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });
    y = lastY(doc) + 8;

    for (const inv of investments) {
      if (inv.returns.length === 0) continue;
      y = ensureSpace(doc, y, 20);
      y = itemHeader(doc, inv.name, `${inv.returns.length} return(s)`, y);
      y = subLabel(doc, 'Returns', 18, y);
      autoTable(doc, {
        startY: y,
        head: [['Amount', 'Date', 'Notes']],
        body: inv.returns.map((r) => [
          formatCurrency(Number(r.amount)),
          formatDate(r.receivedAt),
          r.notes ?? '—',
        ]),
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 7.5 },
        margin: { left: 18, right: 14 },
      });
      y = lastY(doc) + 7;
    }

    y += 4;
  }

  // ── Stocks Summary ───────────────────────────────────────────────────────────
  y = sectionHeader(doc, 'Stocks', y);

  if (stocks.length === 0) {
    y = noData(doc, y);
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Name', 'Status', 'Average', 'Invested', 'Sells', 'Dividends', 'Purification', 'Net P&L', 'Held Shares']],
      body: stocks.map((s) => {
        const t = stockTotals(s);
        const average = t.totalBoughtShares > 0 ? t.invested / t.totalBoughtShares : 0;
        return [
          s.name,
          s.status,
          average > 0 ? formatCurrency(average) : '—',
          formatCurrency(t.invested),
          formatCurrency(t.sells),
          formatCurrency(t.dividends),
          formatCurrency(t.purification),
          (t.net >= 0 ? '+' : '') + formatCurrency(t.net),
          Number(t.heldShares).toFixed(4),
        ];
      }),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });
    y = lastY(doc) + 10;

    for (const stock of stocks) {
      const hasTxns = stock.buys.length > 0 || stock.sells.length > 0 || stock.dividends.length > 0;
      if (!hasTxns) continue;

      y = itemHeader(doc, stock.name, `${stock.status} · ${stockTotals(stock).heldShares.toFixed(4)} held`, y);

      if (stock.buys.length > 0) {
        y = ensureSpace(doc, y, 20);
        y = subLabel(doc, 'Buys', 18, y);
        autoTable(doc, {
          startY: y,
          head: [['Unit Price', 'Shares', 'Commission', 'Total Amount', 'Date', 'Notes']],
          body: stock.buys.map((b) => [
            formatCurrency(Number(b.unitPrice)),
            Number(b.numberOfStocks).toFixed(4),
            formatCurrency(Number(b.commission)),
            formatCurrency(Number(b.unitPrice) * Number(b.numberOfStocks) + Number(b.commission)),
            formatDate(b.investmentDate),
            b.notes ?? '—',
          ]),
          styles: { fontSize: 7.5, cellPadding: 2 },
          headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 7.5 },
          margin: { left: 18, right: 14 },
        });
        y = lastY(doc) + 5;
      }

      if (stock.sells.length > 0) {
        y = ensureSpace(doc, y, 20);
        y = subLabel(doc, 'Sells', 18, y);
        autoTable(doc, {
          startY: y,
          head: [['Unit Price', 'Shares', 'Total Amount', 'Date', 'Notes']],
          body: stock.sells.map((s) => [
            formatCurrency(Number(s.unitPrice)),
            Number(s.numberOfStocks).toFixed(4),
            formatCurrency(Number(s.unitPrice) * Number(s.numberOfStocks)),
            formatDate(s.soldDate),
            s.notes ?? '—',
          ]),
          styles: { fontSize: 7.5, cellPadding: 2 },
          headStyles: { fillColor: [239, 68, 68], textColor: 255, fontSize: 7.5 },
          margin: { left: 18, right: 14 },
        });
        y = lastY(doc) + 5;
      }

      if (stock.dividends.length > 0) {
        y = ensureSpace(doc, y, 20);
        y = subLabel(doc, 'Dividends', 18, y);
        autoTable(doc, {
          startY: y,
          head: [['Dividend/Unit', 'Shares', 'Dividend Amount', 'Purification', 'Date']],
          body: stock.dividends.map((d) => [
            formatCurrency(Number(d.dividendUnitPrice)),
            Number(d.numberOfStocks).toFixed(4),
            formatCurrency(Number(d.dividendAmount)),
            formatCurrency(Number(d.purificationAmount)),
            formatDate(d.dividendDate),
          ]),
          styles: { fontSize: 7.5, cellPadding: 2 },
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 7.5 },
          margin: { left: 18, right: 14 },
        });
        y = lastY(doc) + 8;
      }
    }
  }

  addFooters(doc);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const filename = getFilename();
  const blob = doc.output('blob');

  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await (window as Window & {
        showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle>;
      }).showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'PDF Document', accept: { 'application/pdf': ['.pdf'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      throw err;
    }
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
