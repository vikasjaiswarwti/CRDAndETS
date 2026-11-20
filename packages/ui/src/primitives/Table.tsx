import { useUILibrary } from '../ui-lib/ui-library-context';
import type { TableProps } from '../ui-lib/types';

export const Table = <T extends object>(props: TableProps<T>) => {
    const library = useUILibrary();
    const TableComponent = library.Table;
    return <TableComponent {...(props as any)} />;
};