import { NextResponse } from 'next/server';
import { LoanStatus } from '@/app/lib/types';
import { prisma } from '@/app/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> },
) {
  const { id, paymentId } = await params;
  const body = await request.json();
  const { amount, paidAt, notes } = body;

  if (!amount || !paidAt) {
    return NextResponse.json({ error: 'Amount and date are required' }, { status: 400 });
  }

  await prisma.loanPayment.update({
    where: { id: paymentId },
    data: { amount, paidAt: new Date(paidAt), notes: notes || null },
  });

  const allPayments = await prisma.loanPayment.findMany({ where: { loanId: id } });
  const newTotalPaid = allPayments.reduce((s, p) => s + Number(p.amount), 0);

  const loan = await prisma.loan.findUnique({ where: { id } });
  if (loan) {
    const fullyRepaid = newTotalPaid >= Number(loan.principalAmount);
    await prisma.loan.update({
      where: { id },
      data: {
        totalPaid: newTotalPaid,
        ...(fullyRepaid
          ? { status: LoanStatus.CLOSED, returnDate: loan.returnDate ?? new Date() }
          : { status: LoanStatus.ACTIVE, returnDate: null }),
      },
    });
  }

  const payment = await prisma.loanPayment.findUnique({ where: { id: paymentId } });
  return NextResponse.json(payment);
}

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
