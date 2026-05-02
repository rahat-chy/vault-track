import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; returnId: string }> },
) {
  const { id, returnId } = await params;
  const body = await request.json();
  const { amount, receivedAt, notes } = body;

  if (!amount || !receivedAt) {
    return NextResponse.json({ error: 'Amount and date are required' }, { status: 400 });
  }

  await prisma.oneTimeInvestmentReturn.update({
    where: { id: returnId },
    data: { amount, receivedAt: new Date(receivedAt), notes: notes || null },
  });

  const allReturns = await prisma.oneTimeInvestmentReturn.findMany({ where: { investmentId: id } });
  const newReturnAmount = allReturns.reduce((s, r) => s + Number(r.amount), 0);
  await prisma.oneTimeInvestment.update({ where: { id }, data: { returnAmount: newReturnAmount } });

  const ret = await prisma.oneTimeInvestmentReturn.findUnique({ where: { id: returnId } });
  return NextResponse.json(ret);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; returnId: string }> },
) {
  const { id, returnId } = await params;

  await prisma.oneTimeInvestmentReturn.delete({ where: { id: returnId } });

  const remaining = await prisma.oneTimeInvestmentReturn.findMany({ where: { investmentId: id } });
  const newReturnAmount = remaining.reduce((s, r) => s + Number(r.amount), 0);

  await prisma.oneTimeInvestment.update({
    where: { id },
    data: { returnAmount: newReturnAmount },
  });

  return new NextResponse(null, { status: 204 });
}
