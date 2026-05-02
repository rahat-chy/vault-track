import { NextResponse } from 'next/server';
import { StockStatus } from '@/app/lib/types';
import { prisma } from '@/app/lib/db';

export async function GET() {
  const stocks = await prisma.stock.findMany({
    orderBy: { createdAt: 'desc' },
    include: { buys: true, sells: true, dividends: true },
  });
  return NextResponse.json(stocks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    const stock = await prisma.stock.create({
      data: { name, status: StockStatus.ACTIVE },
      include: { buys: true, sells: true, dividends: true },
    });
    return NextResponse.json(stock, { status: 201 });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'A stock with this name already exists.' }, { status: 409 });
    }
    throw err;
  }
}
