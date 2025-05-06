import { PrismaClient } from '@prisma/client';
import { customers, invoices, revenues, users } from '../app/lib/placeholder-data';

const prisma = new PrismaClient();

const main = async () => {
  await prisma.revenue.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  for (const { name, email, password } of users) {
    await prisma.user.create({ data: { email, name, password } });
  }

  for (const { name, email, image_url } of customers) {
    await prisma.customer.create({ data: { name, email, image_url } });
  }

  for (const { customer_email, amount, status, date } of invoices) {
    await prisma.invoice.create({
      data: {
        amount,
        status,
        date: new Date(date),
        customer: { connect: { email: customer_email } },
      },
    });
  }

  for (const { month, revenue } of revenues) {
    await prisma.revenue.create({ data: { month, revenue } });
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
