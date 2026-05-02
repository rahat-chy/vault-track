import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { dividendUnitPrice, numberOfStocks, dividendDate, currentUnitPrice } = body;

  if (!dividendUnitPrice || !numberOfStocks || !dividendDate || !currentUnitPrice) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const stock = await prisma.stock.findUnique({ where: { id } });
  if (!stock) {
    return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
  }

  const buysAgg = await prisma.stockBuy.aggregate({ where: { stockId: id }, _sum: { numberOfStocks: true } });
  const sellsAgg = await prisma.stockSell.aggregate({ where: { stockId: id }, _sum: { numberOfStocks: true } });
  const heldShares = Number(buysAgg._sum.numberOfStocks ?? 0) - Number(sellsAgg._sum.numberOfStocks ?? 0);
  if (parseFloat(String(numberOfStocks)) > heldShares) {
    return NextResponse.json(
      { error: `Cannot record dividend for ${numberOfStocks} shares. You currently hold ${heldShares} shares.` },
      { status: 400 },
    );
  }

  const dividendAmount =
    parseFloat(String(dividendUnitPrice)) * parseFloat(String(numberOfStocks));

  const dividend = await prisma.stockDividend.create({
    data: {
      stockId: id,
      dividendUnitPrice,
      numberOfStocks,
      dividendDate: new Date(dividendDate),
      currentUnitPrice,
      dividendAmount,
    },
  });

  return NextResponse.json(dividend, { status: 201 });
}
