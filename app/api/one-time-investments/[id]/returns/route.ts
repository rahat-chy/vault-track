import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const returns = await prisma.oneTimeInvestmentReturn.findMany({
    where: { investmentId: id },
    orderBy: { receivedAt: 'asc' },
  });
  return NextResponse.json(returns);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { amount, receivedAt, notes } = body;

  if (!amount || !receivedAt) {
    return NextResponse.json({ error: 'Amount and date are required' }, { status: 400 });
  }

  const investment = await prisma.oneTimeInvestment.findUnique({ where: { id } });
  if (!investment) {
    return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
  }

  const ret = await prisma.oneTimeInvestmentReturn.create({
    data: { investmentId: id, amount, receivedAt: new Date(receivedAt), notes: notes || null },
  });

  const newReturnAmount = Number(investment.returnAmount) + Number(amount);
  const effective = Number(investment.investedAmount) - Number(investment.discountAmount ?? 0);
  const newStatus = newReturnAmount >= effective ? 'CLOSED' : 'ACTIVE';
  await prisma.oneTimeInvestment.update({
    where: { id },
    data: { returnAmount: newReturnAmount, status: newStatus },
  });

  return NextResponse.json(ret, { status: 201 });
}
