import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { name, status } = body;

  try {
    const stock = await prisma.stock.update({
      where: { id },
      data: { name, status },
      include: { buys: true, sells: true, dividends: true },
    });
    return NextResponse.json(stock);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'A stock with this name already exists.' }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.stock.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
