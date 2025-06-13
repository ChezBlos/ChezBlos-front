import React from "react";
import { DashboardHeaderSection } from "./sections/DashboardHeaderSection";
import { OrdersListSection } from "./sections/OrdersListSection/OrdersListSection";

export const Accueil = (): JSX.Element => {
  return (
    <main className="bg-[#eff1f3] flex flex-col items-center w-full min-h-screen">
      <div className="bg-[#eff1f3] w-full max-w-[1440px]">
        <DashboardHeaderSection />
        <OrdersListSection />
      </div>
    </main>
  );
};
