import type { Control } from "react-hook-form";

import type { PaymentFormValues } from "@/validation";

/** RHF checkout fields that only need `control`, `id`, and optional `disabled`. */
export interface CheckoutRhfBoundFieldProps {
  control: Control<PaymentFormValues>;
  id: string;
  disabled?: boolean;
}
