import prisma from '../lib/prisma';

async function listInvoices() {
  const invoice = await prisma.invoice.findMany({
    where: { amount: 666 },
    include: { customer: true },
  });

  return invoice;
}

export async function GET() {
  try {
    return Response.json(await listInvoices());
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
