import { route, ok } from "@/lib/api";
import { Errors } from "@/lib/errors";
import { getInvoice, type InvoiceKind } from "@/services/invoice.service";

const KINDS: InvoiceKind[] = ["order", "payment", "book"];

export const GET = route<{ kind: string; id: string }>(async ({ user, params }) => {
  if (!KINDS.includes(params.kind as InvoiceKind)) throw Errors.notFound("Invoice");
  return ok(await getInvoice(user, params.kind as InvoiceKind, params.id));
});
