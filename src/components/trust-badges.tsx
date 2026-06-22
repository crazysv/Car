import React from "react";

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
      <Badge icon="verified" text="Well-Maintained Fleet" />
      <Badge icon="payments" text="Pay Only 35% Advance" />
      <Badge icon="security" text={"\u20B95,000 Refundable Deposit"} />
      <Badge icon="headset_mic" text="WhatsApp & Call Support" />
      <Badge icon="badge" text="Aadhaar + DL Required" />
    </div>
  );
}

function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-outline-variant rounded-full shadow-sm text-primary">
      <span className="material-symbols-outlined text-[16px] text-secondary">{icon}</span>
      <span className="text-xs font-bold uppercase tracking-widest">{text}</span>
    </div>
  );
}
