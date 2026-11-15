import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Every table shows an automatic "S.No" column. Body rows are numbered with a CSS counter, so
 * numbering stays correct with filtering/sorting and needs no changes in the pages. Rows that
 * hold a single full-width cell (empty states, loaders) are not numbered. Opt out with serial={false}.
 */
type Section = "head" | "body" | "foot" | null;
const SerialContext = React.createContext(true);
const SectionContext = React.createContext<Section>(null);

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement> & { serial?: boolean }>(
  ({ className, serial = true, ...props }, ref) => (
    <SerialContext.Provider value={serial}>
      <div className="relative w-full overflow-auto rounded-lg border border-stone-800">
        <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
      </div>
    </SerialContext.Provider>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <SectionContext.Provider value="head">
      <thead ref={ref} className={cn("[&_tr]:border-b [&_tr]:border-stone-800 bg-stone-900/90", className)} {...props} />
    </SectionContext.Provider>
  )
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <SectionContext.Provider value="body">
      <tbody
        ref={ref}
        className={cn("[counter-reset:serial] [&_tr:last-child]:border-0 divide-y divide-stone-800/60", className)}
        {...props}
      />
    </SectionContext.Provider>
  )
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <SectionContext.Provider value="foot">
      <tfoot ref={ref} className={cn("border-t border-stone-800 bg-stone-900/50 font-medium", className)} {...props} />
    </SectionContext.Provider>
  )
);
TableFooter.displayName = "TableFooter";

/** A row whose only cell spans several columns (e.g. "No records found"). */
function singleSpanningCell(children: React.ReactNode): React.ReactElement<{ colSpan?: number }> | null {
  const cells = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<{ colSpan?: number }>[];
  return cells.length === 1 && (cells[0].props.colSpan ?? 1) > 1 ? cells[0] : null;
}

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, children, ...props }, ref) => {
    const serial = React.useContext(SerialContext);
    const section = React.useContext(SectionContext);
    let content: React.ReactNode = children;
    if (serial && section) {
      const spanning = singleSpanningCell(children);
      if (spanning) {
        content = React.cloneElement(spanning, { colSpan: (spanning.props.colSpan ?? 1) + 1 });
      } else if (section === "head") {
        content = (
          <>
            <th className="h-10 w-14 px-4 text-left align-middle text-xs font-semibold text-stone-400 uppercase tracking-wider">S.No</th>
            {children}
          </>
        );
      } else if (section === "body") {
        content = (
          <>
            <td className="w-14 p-4 align-middle text-xs font-mono text-stone-500 [counter-increment:serial] before:content-[counter(serial)]" />
            {children}
          </>
        );
      } else {
        content = (
          <>
            <td />
            {children}
          </>
        );
      }
    }
    return (
      <tr
        ref={ref}
        className={cn("border-b border-stone-800/60 transition-colors hover:bg-stone-800/40 data-[state=selected]:bg-stone-800", className)}
        {...props}
      >
        {content}
      </tr>
    );
  }
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn("h-10 px-4 text-left align-middle text-xs font-semibold text-stone-400 uppercase tracking-wider [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-4 align-middle text-stone-200 [&:has([role=checkbox])]:pr-0", className)} {...props} />
  )
);
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell };

