import { BellIcon, PlusIcon, StarIcon } from "lucide-react";
import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";

export const DashboardHeaderSection = (): JSX.Element => {
  // Data for the header section
  const userData = {
    name: "Roger",
    date: "24 Juin 2025",
    time: "10:32",
  };

  return (
    <header className="flex flex-col w-full items-start">
      {/* Top navigation bar */}
      <nav className="flex items-center justify-between px-20 py-6 relative self-stretch w-full flex-[0_0_auto] z-[1] bg-white border-b border-slate-200">
        <img className="relative h-[41px]" alt="Logo" src="/logo-55.svg" />

        <div className="flex items-center gap-2">
          {/* Email button */}
          <div className="flex w-12 h-12 items-center justify-center bg-[#eff1f3] rounded-full">
            <StarIcon className="w-6 h-6" />
          </div>

          {/* Notification button with indicator */}
          <div className="flex w-12 h-12 items-center justify-center bg-[#eff1f3] rounded-full relative">
            <BellIcon className="w-6 h-6" />
            <div className="absolute w-1.5 h-1.5 top-[15px] right-[15px] bg-rose-500 rounded-[3px] border border-solid border-[#eff1f3]" />
          </div>

          {/* User avatar with status indicator */}
          <Avatar className="relative w-12 h-12">
            <AvatarImage src="/avatar.png" alt="User avatar" />
            <AvatarFallback>UR</AvatarFallback>
            <div className="absolute w-[15px] h-[15px] bottom-0 right-0 bg-success-50 rounded-full border-[1.5px] border-solid border-white" />
          </Avatar>
        </div>
      </nav>

      {/* Secondary header with greeting and action button */}
      <div className="flex flex-col h-[97px] items-start px-20 py-0 relative self-stretch w-full z-0 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between gap-4 pt-5 pb-[19px] px-0 relative self-stretch w-full">
          <div className="flex flex-col items-start gap-1">
            <h1 className="font-heading-h5-bold text-[#181818] text-[length:var(--heading-h5-bold-font-size)] tracking-[var(--heading-h5-bold-letter-spacing)] leading-[var(--heading-h5-bold-line-height)]">
              Bonjour {userData.name}
            </h1>
            <p className="font-title-t5-medium text-slate-400 text-[length:var(--title-t5-medium-font-size)] tracking-[var(--title-t5-medium-letter-spacing)] leading-[var(--title-t5-medium-line-height)]">
              {userData.date} - {userData.time}
            </p>
          </div>

          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
            <PlusIcon className="w-5 h-5 mr-2" />
            <span className="font-title-t4-bold text-[length:var(--title-t4-bold-font-size)] tracking-[var(--title-t4-bold-letter-spacing)] leading-[var(--title-t4-bold-line-height)]">
              Nouvelle commande
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};
