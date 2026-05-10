import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ dividendId: string }> },
) {
  const { dividendId } = await params;
  const body = await request.json();
  const { dividendUnitPrice, numberOfStocks, dividendDate, currentUnitPrice, purificationAmount } = body;

  if (!dividendUnitPrice || !numberOfStocks || !dividendDate || !currentUnitPrice) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const currentDiv = await prisma.stockDividend.findUnique({ where: { id: dividendId } });
  if (!currentDiv) {
    return NextResponse.json({ error: 'Dividend record not found' }, { status: 404 });
  }

  const buysAgg = await prisma.stockBuy.aggregate({ where: { stockId: currentDiv.stockId }, _sum: { numberOfStocks: true } });
  const sellsAgg = await prisma.stockSell.aggregate({ where: { stockId: currentDiv.stockId }, _sum: { numberOfStocks: true } });
  const heldShares = Number(buysAgg._sum.numberOfStocks ?? 0) - Number(sellsAgg._sum.numberOfStocks ?? 0);
  if (parseFloat(String(numberOfStocks)) > heldShares) {
    return NextResponse.json(
      { error: `Cannot record dividend for ${numberOfStocks} shares. You currently hold ${heldShares} shares.` },
      { status: 400 },
    );
  }

  const dividendAmount =
    parseFloat(String(dividendUnitPrice)) * parseFloat(String(numberOfStocks));

  const dividend = await prisma.stockDividend.update({
    where: { id: dividendId },
    data: {
      dividendUnitPrice,
      numberOfStocks,
      dividendDate: new Date(dividendDate),
      currentUnitPrice,
      dividendAmount,
      purificationAmount: purificationAmount ? parseFloat(String(purificationAmount)) : 0,
    },
  });

  return NextResponse.json(dividend);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ dividendId: string }> },
) {
  const { dividendId } = await params;
  await prisma.stockDividend.delete({ where: { id: dividendId } });
  return new NextResponse(null, { status: 204 });
}
