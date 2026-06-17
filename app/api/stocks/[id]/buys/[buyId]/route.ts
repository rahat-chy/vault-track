import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ buyId: string }> },
) {
  const { buyId } = await params;
  const body = await request.json();
  const { unitPrice, numberOfStocks, commission, investmentDate, notes } = body;

  if (!unitPrice || !numberOfStocks || !investmentDate) {
    return NextResponse.json(
      { error: 'Unit price, number of stocks, and date are required' },
      { status: 400 },
    );
  }

  const currentBuy = await prisma.stockBuy.findUnique({ where: { id: buyId } });
  if (!currentBuy) {
    return NextResponse.json({ error: 'Buy record not found' }, { status: 404 });
  }

  const buysAgg = await prisma.stockBuy.aggregate({
    where: { stockId: currentBuy.stockId },
    _sum: { numberOfStocks: true },
  });
  const sellsAgg = await prisma.stockSell.aggregate({
    where: { stockId: currentBuy.stockId },
    _sum: { numberOfStocks: true },
  });
  const totalBought = Number(buysAgg._sum.numberOfStocks ?? 0);
  const totalSold = Number(sellsAgg._sum.numberOfStocks ?? 0);
  const newTotalBought = totalBought - Number(currentBuy.numberOfStocks) + parseFloat(String(numberOfStocks));
  if (newTotalBought < totalSold) {
    return NextResponse.json(
      {
        error: `Cannot reduce to ${numberOfStocks} shares — total sold (${totalSold}) would exceed total bought after this change.`,
      },
      { status: 400 },
    );
  }

  const buy = await prisma.stockBuy.update({
    where: { id: buyId },
    data: {
      unitPrice,
      numberOfStocks,
      commission: commission ?? 0,
      investmentDate: new Date(investmentDate),
      notes: notes || null,
    },
  });

  return NextResponse.json(buy);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ buyId: string }> },
) {
  const { buyId } = await params;
  await prisma.stockBuy.delete({ where: { id: buyId } });
  return new NextResponse(null, { status: 204 });
}
