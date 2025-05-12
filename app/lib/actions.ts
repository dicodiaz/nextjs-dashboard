'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import prisma from './prisma';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export const createInvoice = async (formData: FormData) => {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date();

  await prisma.invoice.create({
    data: {
      customer_id: customerId,
      amount: amountInCents,
      status,
      date,
    },
  });

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
};

export const updateInvoice = async (id: string, formData: FormData) => {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;

  await prisma.invoice.update({
    where: { id },
    data: {
      customer_id: customerId,
      amount: amountInCents,
      status,
    },
  });

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
};

export const deleteInvoice = async (id: string) => {
  await prisma.invoice.delete({ where: { id } });

  revalidatePath('/dashboard/invoices');
};
