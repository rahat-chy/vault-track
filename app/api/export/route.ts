import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET() {
  const [loans, investments, stocks] = await Promise.all([
    prisma.loan.findMany({
      include: { person: true, payments: { orderBy: { paidAt: 'asc' } } },
      orderBy: { startDate: 'asc' },
    }),
    prisma.oneTimeInvestment.findMany({
      include: { returns: { orderBy: { receivedAt: 'asc' } } },
      orderBy: { investmentDate: 'asc' },
    }),
    prisma.stock.findMany({
      include: {
        buys: { orderBy: { investmentDate: 'asc' } },
        sells: { orderBy: { soldDate: 'asc' } },
        dividends: { orderBy: { dividendDate: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  return NextResponse.json({ loans, investments, stocks });
}
