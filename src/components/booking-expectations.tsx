import React from "react";
import { siteConfig } from "@/data/site-config";

export function BookingExpectations() {
  return (
    <div className="bg-surface-container-low border border-secondary/20 rounded-2xl p-6 shadow-sm">
      <h3 className="font-headline-md text-primary mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary">verified_user</span>
        What to Expect
      </h3>
      <ul className="space-y-4">
        <ExpectationItem
          icon="payments"
          title="Pay only 35% advance"
          text="to request and lock your booking."
        />
        <ExpectationItem
          icon="account_balance_wallet"
          title="Remaining balance"
          text="is payable at vehicle handover."
        />
        <ExpectationItem
          icon="security"
          title={`\u20B9${siteConfig.booking.securityDeposit.toLocaleString("en-IN")} security deposit`}
          text="is refundable after return and inspection."
        />
        <ExpectationItem
          icon="badge"
          title="Aadhaar Card + Driving Licence"
          text="must be presented at handover."
        />
        <ExpectationItem
          icon="local_gas_station"
          title="Fuel is paid by the customer."
          text=""
        />
      </ul>

      <div className="mt-6 pt-6 border-t border-outline-variant">
        <p className="text-sm text-outline mb-3">If you need help before paying, contact JP Rentals.</p>
        <div className="flex items-center gap-4">
          <a
            href={siteConfig.phoneHref}
            className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-primary text-sm font-bold hover:border-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">call</span> Call
          </a>
          <a
            href={`https://wa.me/${siteConfig.phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-[#25D366]/10 border border-[#25D366]/30 rounded-lg text-[#128C7E] text-sm font-bold hover:bg-[#25D366]/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function ExpectationItem({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="material-symbols-outlined text-outline mt-0.5 text-[20px]">{icon}</span>
      <p className="text-sm text-outline">
        <strong className="text-primary">{title}</strong> {text}
      </p>
    </li>
  );
}
