import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; sellId: string }> },
) {
  const { id, sellId } = await params;
  const body = await request.json();
  const { unitPrice, numberOfStocks, soldDate, notes } = body;

  if (!unitPrice || !numberOfStocks || !soldDate) {
    return NextResponse.json(
      { error: 'Unit price, number of stocks, and date are required' },
      { status: 400 },
    );
  }

  const currentSell = await prisma.stockSell.findUnique({ where: { id: sellId } });
  if (!currentSell) {
    return NextResponse.json({ error: 'Sell record not found' }, { status: 404 });
  }

  const buysAgg = await prisma.stockBuy.aggregate({ where: { stockId: id }, _sum: { numberOfStocks: true } });
  const sellsAgg = await prisma.stockSell.aggregate({ where: { stockId: id }, _sum: { numberOfStocks: true } });
  const totalBought = Number(buysAgg._sum.numberOfStocks ?? 0);
  const totalSold = Number(sellsAgg._sum.numberOfStocks ?? 0);
  const remaining = totalBought - totalSold + Number(currentSell.numberOfStocks);
  if (parseFloat(String(numberOfStocks)) > remaining) {
    return NextResponse.json(
      { error: `Cannot sell ${numberOfStocks} shares. Only ${remaining} shares available.` },
      { status: 400 },
    );
  }

  const sell = await prisma.stockSell.update({
    where: { id: sellId },
    data: {
      unitPrice,
      numberOfStocks,
      soldDate: new Date(soldDate),
      notes: notes || null,
    },
  });

  return NextResponse.json(sell);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sellId: string }> },
) {
  const { sellId } = await params;
  await prisma.stockSell.delete({ where: { id: sellId } });
  return new NextResponse(null, { status: 204 });
}
