import { lusitana } from '@/app/ui/fonts';
import { clsx } from 'clsx';
import Link from 'next/link';
import { FC } from 'react';

type Breadcrumb = {
  label: string;
  href: string;
  active?: boolean;
};

type BreadcrumbsProps = {
  breadcrumbs: Breadcrumb[];
};

const Breadcrumbs: FC<BreadcrumbsProps> = ({ breadcrumbs }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 block">
      <ol className={clsx(lusitana.className, 'flex text-xl md:text-2xl')}>
        {breadcrumbs.map((breadcrumb, index) => (
          <li
            key={breadcrumb.href}
            aria-current={breadcrumb.active}
            className={clsx(breadcrumb.active ? 'text-gray-900' : 'text-gray-500')}
          >
            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
            {index < breadcrumbs.length - 1 ? <span className="mx-3 inline-block">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
