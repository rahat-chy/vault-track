import { NextResponse } from 'next/server';
import { Prisma } from '@/app/generated/prisma/client';
import { prisma } from '@/app/lib/db';

export async function GET() {
  try {
    const persons = await prisma.person.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(persons);
  } catch {
    return NextResponse.json({ error: 'Failed to load persons.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });
    }

    const person = await prisma.person.create({ data: { name, phone, email: email || null } });
    return NextResponse.json(person, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ error: 'A person with this phone number already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create person.' }, { status: 500 });
  }
}
