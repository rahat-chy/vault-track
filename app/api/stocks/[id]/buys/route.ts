import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { unitPrice, numberOfStocks, investmentDate, notes } = body;

  if (!unitPrice || !numberOfStocks || !investmentDate) {
    return NextResponse.json(
      { error: 'Unit price, number of stocks, and date are required' },
      { status: 400 },
    );
  }

  const stock = await prisma.stock.findUnique({ where: { id } });
  if (!stock) {
    return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
  }

  const buy = await prisma.stockBuy.create({
    data: {
      stockId: id,
      unitPrice,
      numberOfStocks,
      investmentDate: new Date(investmentDate),
      notes: notes || null,
    },
  });

  return NextResponse.json(buy, { status: 201 });
}
