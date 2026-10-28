import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  current?: number;
  defaultCurrent?: number;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  onChange?: (page: number, pageSize: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode);
  simple?: boolean;
  total: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getPageItems(page: number, pageCount: number): Array<number | 'ellipsis'> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, 'ellipsis', pageCount];
  if (page >= pageCount - 3) {
    return [1, 'ellipsis', pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  }
  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', pageCount];
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      className,
      current,
      defaultCurrent = 1,
      disabled = false,
      hideOnSinglePage = false,
      onChange,
      pageSize: pageSizeProp,
      pageSizeOptions,
      showSizeChanger = false,
      showTotal = false,
      simple = false,
      total,
      ...props
    },
    ref,
  ) => {
    const locale = useOxygenLocale();
    const [uncontrolledCurrent, setUncontrolledCurrent] = useState(defaultCurrent);
    const [uncontrolledPageSize, setUncontrolledPageSize] = useState(
      Math.max(1, pageSizeProp ?? 10),
    );
    const pageSize = Math.max(1, pageSizeProp ?? uncontrolledPageSize);

    const pageCount = Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
    const page = clamp(current ?? uncontrolledCurrent, 1, pageCount);
    const resolvedPageSizeOptions = Array.from(
      new Set([...(pageSizeOptions ?? [10, 20, 50]), pageSize].filter((option) => option > 0)),
    ).sort((a, b) => a - b);
    const pageItems = getPageItems(page, pageCount);

    if (hideOnSinglePage && pageCount <= 1) return null;

    function changePage(nextPage: number) {
      if (disabled || nextPage < 1 || nextPage > pageCount || nextPage === page) return;
      if (current === undefined) setUncontrolledCurrent(nextPage);
      onChange?.(nextPage, pageSize);
    }

    function changePageSize(nextPageSize: number) {
      if (disabled || nextPageSize === pageSize) return;
      if (pageSizeProp === undefined) setUncontrolledPageSize(nextPageSize);
      setUncontrolledCurrent(1);
      onChange?.(1, nextPageSize);
    }

    return (
      <nav
        aria-label={locale.common.pagination}
        className={cn('oxygen-pagination', className)}
        data-disabled={disabled ? 'true' : undefined}
        data-page-size={pageSize}
        data-total={total}
        ref={ref}
        {...props}
      >
        <button
          aria-label={locale.common.previous}
          className="oxygen-pagination__button"
          disabled={disabled || page <= 1}
          onClick={() => changePage(page - 1)}
          type="button"
        >
          {locale.common.previous}
        </button>
        {simple ? (
          <span aria-live="polite" className="oxygen-pagination__simple">
            {page} / {pageCount}
          </span>
        ) : (
          <span className="oxygen-pagination__pages">
            {pageItems.map((item, index) => (
              item === 'ellipsis' ? (
                <span aria-hidden="true" className="oxygen-pagination__ellipsis" key={`ellipsis-${index}`}>
                  …
                </span>
              ) : (
                <button
                  aria-current={item === page ? 'page' : undefined}
                  aria-label={locale.common.page(item)}
                  className="oxygen-pagination__button"
                  disabled={disabled}
                  key={item}
                  onClick={() => changePage(item)}
                  type="button"
                >
                  {item}
                </button>
              )
            ))}
          </span>
        )}
        <button
          aria-label={locale.common.next}
          className="oxygen-pagination__button"
          disabled={disabled || page >= pageCount}
          onClick={() => changePage(page + 1)}
          type="button"
        >
          {locale.common.next}
        </button>
        {showSizeChanger ? (
          <label className="oxygen-pagination__size-changer">
            <span className="oxygen-visually-hidden">{locale.common.pageSize}</span>
            <select
              aria-label={locale.common.pageSize}
              disabled={disabled}
              onChange={(event) => changePageSize(Number(event.target.value))}
              value={pageSize}
            >
              {resolvedPageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {locale.common.pageSizeOption(option)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {showTotal ? (
          <span className="oxygen-pagination__total">
            {typeof showTotal === 'function'
              ? showTotal(
                total,
                total === 0
                  ? [0, 0]
                  : [(page - 1) * pageSize + 1, Math.min(page * pageSize, total)],
              )
              : locale.common.total(total)}
          </span>
        ) : null}
      </nav>
    );
  },
);

Pagination.displayName = 'Pagination';
