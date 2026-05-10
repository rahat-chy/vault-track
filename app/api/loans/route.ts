import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET() {
  const loans = await prisma.loan.findMany({
    include: { person: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(loans);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { personId, principalAmount, startDate, dueDate, returnDate, type, notes } = body;

  if (!personId || !principalAmount || !startDate || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const loan = await prisma.loan.create({
    data: {
      personId,
      principalAmount,
      startDate: new Date(startDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      returnDate: returnDate ? new Date(returnDate) : null,
      type,
      notes: notes || null,
    },
    include: { person: true },
  });

  return NextResponse.json(loan, { status: 201 });
}
