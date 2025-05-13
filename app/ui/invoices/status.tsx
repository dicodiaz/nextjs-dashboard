import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Status } from '@prisma/client';
import clsx from 'clsx';
import { FC } from 'react';

type InvoiceStatusProps = {
  status: Status;
};

const InvoiceStatus: FC<InvoiceStatusProps> = ({ status }) => {
  return (
    <span
      className={clsx('inline-flex items-center rounded-full px-2 py-1 text-xs', {
        'bg-gray-100 text-gray-500': status === Status.pending,
        'bg-green-500 text-white': status === Status.paid,
      })}
    >
      {status === Status.pending ? (
        <>
          Pending
          <ClockIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
      {status === Status.paid ? (
        <>
          Paid
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
    </span>
  );
};

export default InvoiceStatus;
