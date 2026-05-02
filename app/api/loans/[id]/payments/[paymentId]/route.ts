import { NextResponse } from 'next/server';
import { LoanStatus } from '@/app/lib/types';
import { prisma } from '@/app/lib/db';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> },
) {
  const { id, paymentId } = await params;

  await prisma.loanPayment.delete({ where: { id: paymentId } });

  const remaining = await prisma.loanPayment.findMany({ where: { loanId: id } });
  const newTotalPaid = remaining.reduce((s, p) => s + Number(p.amount), 0);

  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) return new NextResponse(null, { status: 204 });

  const stillFullyPaid = newTotalPaid >= Number(loan.principalAmount);

  await prisma.loan.update({
    where: { id },
    data: {
      totalPaid: newTotalPaid,
      ...(!stillFullyPaid ? { status: LoanStatus.ACTIVE, returnDate: null } : {}),
    },
  });

  return new NextResponse(null, { status: 204 });
}
