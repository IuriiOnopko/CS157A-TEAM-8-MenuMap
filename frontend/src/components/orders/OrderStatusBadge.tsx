import React from "react";
import type { OrderStatus } from "../../api/orders";

const STYLES: Record<OrderStatus, { label: string; className: string }> = {
  SUBMITTED: { label: "Submitted", className: "bg-[#EEF1F4] text-[#3E4A57]" },
  PREPARING: { label: "Preparing", className: "bg-[#FDF3E7] text-clay" },
  READY: { label: "Ready", className: "bg-[#E4F3EA] text-[#1E7A46]" },
  COMPLETED: { label: "Completed", className: "bg-[#EFF3EA] text-sage" },
  CANCELED: { label: "Canceled", className: "bg-[#FDECEC] text-[#B42318]" },
};

export function statusLabel(status: OrderStatus): string {
  return STYLES[status].label;
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style = STYLES[status];
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[12px] font-semibold ${style.className}`}>
      {style.label}
    </span>
  );
}
