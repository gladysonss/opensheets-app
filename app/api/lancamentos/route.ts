
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { lancamentos } from '@/db/schema';
import { getUser } from '@/lib/auth/server';
import { fetchLancamentos } from '@/app/(dashboard)/lancamentos/data';
import { createLancamentoAction } from '@/app/(dashboard)/lancamentos/actions';

export async function GET() {
  try {
    const user = await getUser();
    const lancamentosData = await fetchLancamentos([eq(lancamentos.userId, user.id)]);
    return NextResponse.json(lancamentosData);
  } catch (error) {
    console.error('Error fetching lancamentos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = await createLancamentoAction(json);

    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 201 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating lancamento:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
