import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { personId, principalAmount, startDate, dueDate, status, type, notes } = body;

  const loan = await prisma.loan.update({
    where: { id },
    data: {
      personId,
      principalAmount,
      startDate: new Date(startDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      status,
      type,
      notes: notes || null,
    },
    include: { person: true },
  });

  return NextResponse.json(loan);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.loan.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
