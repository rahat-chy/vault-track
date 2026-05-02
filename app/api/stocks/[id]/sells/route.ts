import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { unitPrice, numberOfStocks, soldDate, notes } = body;

  if (!unitPrice || !numberOfStocks || !soldDate) {
    return NextResponse.json(
      { error: 'Unit price, number of stocks, and date are required' },
      { status: 400 },
    );
  }

  const stock = await prisma.stock.findUnique({ where: { id } });
  if (!stock) {
    return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
  }

  const buysAgg = await prisma.stockBuy.aggregate({ where: { stockId: id }, _sum: { numberOfStocks: true } });
  const sellsAgg = await prisma.stockSell.aggregate({ where: { stockId: id }, _sum: { numberOfStocks: true } });
  const totalBought = Number(buysAgg._sum.numberOfStocks ?? 0);
  const totalSold = Number(sellsAgg._sum.numberOfStocks ?? 0);
  const remaining = totalBought - totalSold;
  if (parseFloat(String(numberOfStocks)) > remaining) {
    return NextResponse.json(
      { error: `Cannot sell ${numberOfStocks} shares. Only ${remaining} shares available.` },
      { status: 400 },
    );
  }

  const sell = await prisma.stockSell.create({
    data: {
      stockId: id,
      unitPrice,
      numberOfStocks,
      soldDate: new Date(soldDate),
      notes: notes || null,
    },
  });

  return NextResponse.json(sell, { status: 201 });
}
