import { CustomersTableType, FormattedCustomersTable, InvoicesTable } from './definitions';
import prisma from './prisma';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await prisma.revenue.findMany({});

    console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await prisma.invoice.findMany({
      select: {
        id: true,
        amount: true,
        customer: { select: { name: true, image_url: true, email: true } },
      },
      orderBy: { date: 'desc' },
      take: 5,
    });
    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = prisma.invoice.count();
    const customerCountPromise = prisma.customer.count();
    const paidInvoiceCountPromise = prisma.invoice.count({ where: { status: 'paid' } });
    const pendingInvoiceCountPromise = prisma.invoice.count({ where: { status: 'pending' } });

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      paidInvoiceCountPromise,
      pendingInvoiceCountPromise,
    ]);

    const numberOfInvoices = data[0];
    const numberOfCustomers = data[1];
    const totalPaidInvoices = data[2];
    const totalPendingInvoices = data[3];

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices: InvoicesTable[] = await prisma.$queryRaw`
      SELECT
        "public"."Invoice".id,
        "public"."Invoice".amount,
        "public"."Invoice".date,
        "public"."Invoice".status,
        "public"."Customer".name,
        "public"."Customer".email,
        "public"."Customer".image_url
      FROM "public"."Invoice"
      JOIN "public"."Customer" ON "public"."Invoice".customer_id = "public"."Customer".id
      WHERE
        "public"."Customer".name ILIKE ${`%${query}%`} OR
        "public"."Customer".email ILIKE ${`%${query}%`} OR
        "public"."Invoice".amount::text ILIKE ${`%${query}%`} OR
        "public"."Invoice".date::text ILIKE ${`%${query}%`} OR
        "public"."Invoice".status ILIKE ${`%${query}%`}
      ORDER BY "public"."Invoice".date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data: { count: string }[] = await prisma.$queryRaw`SELECT COUNT(*)
    FROM "public"."Invoice"
    JOIN "public"."Customer" ON "public"."Invoice".customer_id = "public"."Customer".id
    WHERE
      "public"."Customer".name ILIKE ${`%${query}%`} OR
      "public"."Customer".email ILIKE ${`%${query}%`} OR
      "public"."Invoice".amount::text ILIKE ${`%${query}%`} OR
      "public"."Invoice".date::text ILIKE ${`%${query}%`} OR
      "public"."Invoice".status ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await prisma.invoice.findMany({
      select: { id: true, customer_id: true, amount: true, status: true },
      where: { id },
    });

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
      status: invoice.status as 'paid' | 'pending',
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export const fetchFilteredCustomers = async (query: string) => {
  try {
    const data: CustomersTableType[] = await prisma.$queryRaw`
      SELECT
        "public"."Customer".id,
        "public"."Customer".name,
        "public"."Customer".email,
        "public"."Customer".image_url,
        COUNT("public"."Invoice".id) AS total_invoices,
        SUM(CASE WHEN "public"."Invoice".status = 'pending' THEN "public"."Invoice".amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN "public"."Invoice".status = 'paid' THEN "public"."Invoice".amount ELSE 0 END) AS total_paid
      FROM "public"."Customer"
      LEFT JOIN "public"."Invoice" ON "public"."Customer".id = "public"."Invoice".customer_id
      WHERE
        "public"."Customer".name ILIKE ${`%${query}%`} OR
        "public"."Customer".email ILIKE ${`%${query}%`}
      GROUP BY "public"."Customer".id, "public"."Customer".name, "public"."Customer".email, "public"."Customer".image_url
      ORDER BY "public"."Customer".name ASC
	  `;

    const customers: FormattedCustomersTable[] = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(Number(customer.total_pending)),
      total_paid: formatCurrency(Number(customer.total_paid)),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
};
