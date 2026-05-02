import { NextResponse } from 'next/server';
import { LoanStatus } from '@/app/lib/types';
import { prisma } from '@/app/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payments = await prisma.loanPayment.findMany({
    where: { loanId: id },
    orderBy: { paidAt: 'asc' },
  });
  return NextResponse.json(payments);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { amount, paidAt, notes } = body;

  if (!amount || !paidAt) {
    return NextResponse.json({ error: 'Amount and date are required' }, { status: 400 });
  }

  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) {
    return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
  }

  const payment = await prisma.loanPayment.create({
    data: { loanId: id, amount, paidAt: new Date(paidAt), notes: notes || null },
  });

  const newTotalPaid = Number(loan.totalPaid) + Number(amount);
  const fullyRepaid = newTotalPaid >= Number(loan.principalAmount);

  await prisma.loan.update({
    where: { id },
    data: {
      totalPaid: newTotalPaid,
      ...(fullyRepaid ? { status: LoanStatus.CLOSED, returnDate: new Date() } : {}),
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
