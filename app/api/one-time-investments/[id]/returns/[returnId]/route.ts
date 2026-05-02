import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

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
