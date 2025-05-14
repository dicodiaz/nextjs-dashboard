import { fetchFilteredCustomers } from '@/app/lib/data';
import CustomersTable from '@/app/ui/customers/table';
import { Metadata } from 'next';
import { FC } from 'react';

export const metadata: Metadata = {
  title: 'Customers',
};

type DashboardCustomersPageProps = {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
};

const DashboardCustomersPage: FC<DashboardCustomersPageProps> = async (props) => {
  const searchParams = (await props.searchParams) ?? {};
  const { query = '' } = searchParams;
  const customers = await fetchFilteredCustomers(query);

  return <CustomersTable customers={customers} />;
};

export default DashboardCustomersPage;
