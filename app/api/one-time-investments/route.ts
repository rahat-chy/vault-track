import { NextResponse } from 'next/server';
import { InvestmentStatus } from '@/app/lib/types';
import { prisma } from '@/app/lib/db';

export async function GET() {
  const investments = await prisma.oneTimeInvestment.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(investments);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, investedAmount, investmentDate, discountAmount, exitDate, status, description } = body;

  if (!name || !investedAmount || !investmentDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const investment = await prisma.oneTimeInvestment.create({
    data: {
      name,
      investedAmount,
      investmentDate: new Date(investmentDate),
      discountAmount: discountAmount != null ? discountAmount : null,
      exitDate: exitDate ? new Date(exitDate) : null,
      status: status ?? InvestmentStatus.ACTIVE,
      description: description || null,
    },
  });

  return NextResponse.json(investment, { status: 201 });
}
