import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { name, investedAmount, investmentDate, discountAmount, exitDate, status, description } = body;

  const investment = await prisma.oneTimeInvestment.update({
    where: { id },
    data: {
      name,
      investedAmount,
      investmentDate: new Date(investmentDate),
      discountAmount: discountAmount != null ? discountAmount : null,
      exitDate: exitDate ? new Date(exitDate) : null,
      status,
      description: description || null,
    },
  });

  return NextResponse.json(investment);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.oneTimeInvestment.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
