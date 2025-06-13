import { SearchIcon } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { Input } from "../../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";

export const OrdersListSection = (): JSX.Element => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  // Summary cards data
  const summaryCards = [
    {
      title: "Total commandes hier",
      value: "1,878",
      subtitle: "Aujourd'hui",
      subtitleColor: "text-orange-500",
    },
    {
      title: "Total commandes du jour",
      value: "2,878",
      subtitle: "Aujourd'hui",
      subtitleColor: "text-orange-500",
    },
    {
      title: "Total caisse",
      value: "360.000",
      currency: "XOF",
      subtitle: "Recette du jour",
      subtitleColor: "text-orange-500",
    },
  ];

  // Order status tabs data
  const statusTabs = [
    { id: "prete", label: "Prête", count: 12, active: true },
    { id: "en-attente", label: "En attente", count: null, active: false },
    { id: "annule", label: "Annulé", count: null, active: false },
    { id: "en-cours", label: "En cours", count: 12, active: false },
    { id: "terminee", label: "Terminée", count: null, active: false },
  ];

  // Table headers
  const tableHeaders = [
    "Commande",
    "ID de commande",
    "type de paiement",
    "Montant",
    "Statut",
    "Action",
  ];

  // Orders data
  const orders = [
    {
      id: 1,
      dish: "Saumon rôti aux herbes",
      additionalItems: "+02 autres éléments",
      orderId: "#1247",
      orderCode: "ORD-001247",
      paymentType: {
        type: "Cash",
        icon: "/moneywavy.svg",
        bgColor: "bg-[#fef1e8]",
      },
      amount: "33.000",
      currency: "XOF",
      status: {
        label: "Terminé",
        color: "bg-success-5 text-success-50",
      },
    },
    {
      id: 2,
      dish: "Burger boeuf croustillant",
      additionalItems: "+03 autres éléments",
      orderId: "#1247",
      orderCode: "ORD-001247",
      paymentType: {
        type: "Wave",
        icon: "/image-8.svg",
        bgColor: "bg-[#1dc4ff]",
        isSpecial: true,
      },
      amount: "25.000",
      currency: "XOF",
      status: {
        label: "En attente",
        color: "bg-warning-5 text-warning-50",
      },
    },
    {
      id: 3,
      dish: "Burger boeuf juteux",
      additionalItems: "+03 autres éléments",
      orderId: "#1247",
      orderCode: "ORD-001247",
      paymentType: {
        type: "Carte de crédit",
        icon: "/creditcard.svg",
        bgColor: "bg-[#fef1e8]",
      },
      amount: "25.000",
      currency: "XOF",
      status: {
        label: "En cours",
        color: "bg-brand-5 text-brand-60",
      },
    },
    {
      id: 4,
      dish: "Burger de boeuf fondant",
      additionalItems: "+03 autres éléments",
      orderId: "#1247",
      orderCode: "ORD-001247",
      paymentType: {
        type: "Orange money",
        icon: "/image-14.png",
        bgColor: "bg-[#030303]",
        isLogo: true,
      },
      amount: "25.000",
      currency: "XOF",
      status: {
        label: "Annulé",
        color: "bg-destructive-5 text-destructive-50",
      },
    },
  ];

  return (
    <section className="flex flex-col w-full gap-6 mt-8">
      {/* Summary Cards */}
      <div className="flex items-start gap-5 w-full">
        {summaryCards.map((card, index) => (
          <Card key={index} className="flex-1 rounded-3xl overflow-hidden">
            <CardContent className="flex flex-col items-start gap-6 p-6">
              <h3 className="font-title-t3-semibold font-[number:var(--title-t3-semibold-font-weight)] text-neutral-950 text-[length:var(--title-t3-semibold-font-size)] tracking-[var(--title-t3-semibold-letter-spacing)] leading-[var(--title-t3-semibold-line-height)] [font-style:var(--title-t3-semibold-font-style)]">
                {card.title}
              </h3>
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-start gap-1">
                  <span className="font-heading-h4-bold font-[number:var(--heading-h4-bold-font-weight)] text-neutral-950 text-[length:var(--heading-h4-bold-font-size)] tracking-[var(--heading-h4-bold-letter-spacing)] leading-[var(--heading-h4-bold-line-height)] [font-style:var(--heading-h4-bold-font-style)]">
                    {card.value}
                  </span>
                  {card.currency && (
                    <span className="font-heading-h4-bold font-[number:var(--heading-h4-bold-font-weight)] text-slate-200 text-[length:var(--heading-h4-bold-font-size)] tracking-[var(--heading-h4-bold-letter-spacing)] leading-[var(--heading-h4-bold-line-height)] [font-style:var(--heading-h4-bold-font-style)]">
                      {card.currency}
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-1 w-full">
                  <span
                    className={`font-title-t5-medium font-[number:var(--title-t5-medium-font-weight)] ${card.subtitleColor} text-[length:var(--title-t5-medium-font-size)] tracking-[var(--title-t5-medium-letter-spacing)] leading-[var(--title-t5-medium-line-height)] [font-style:var(--title-t5-medium-font-style)]`}
                  >
                    {card.subtitle}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders List */}
      <Card className="rounded-3xl overflow-hidden">
        {/* Header and SearchIcon */}
        <div className="flex flex-col border-b border-slate-200">
          <div className="flex items-center justify-between px-6 pt-4">
            <h2 className="font-title-t1-bold font-[number:var(--title-t1-bold-font-weight)] text-gray-80 text-[length:var(--title-t1-bold-font-size)] tracking-[var(--title-t1-bold-letter-spacing)] leading-[var(--title-t1-bold-line-height)] [font-style:var(--title-t1-bold-font-style)]">
              Liste des commandes
            </h2>
            <div className="w-80">
              <div className="relative">
                <Input
                  className="pl-4 pr-10 py-3 h-12 rounded-[123px] border border-[#eff1f3]"
                  placeholder="Rechercher une commande"
                />
                <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <Tabs defaultValue="prete" className="w-full">
            <TabsList className="flex h-auto bg-transparent p-0">
              {statusTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`flex items-center gap-2 px-7 py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-80 data-[state=inactive]:text-slate-700`}
                >
                  <span className="font-text-sm-bold font-[number:var(--text-sm-bold-font-weight)] text-inherit text-[length:var(--text-sm-bold-font-size)] tracking-[var(--text-sm-bold-letter-spacing)] leading-[var(--text-sm-bold-line-height)] [font-style:var(--text-sm-bold-font-style)]">
                    {tab.label}
                  </span>
                  {tab.count && (
                    <Badge className="bg-brand-5 text-orange-500 rounded-[1234px] px-2 py-1 font-text-xs-semibold font-[number:var(--text-xs-semibold-font-weight)] text-[length:var(--text-xs-semibold-font-size)] tracking-[var(--text-xs-semibold-letter-spacing)] leading-[var(--text-xs-semibold-line-height)] [font-style:var(--text-xs-semibold-font-style)]">
                      {tab.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Orders Table */}
        <Table>
          <TableHeader className="bg-gray-5">
            <TableRow>
              {tableHeaders.map((header, index) => (
                <TableHead
                  key={index}
                  className="h-[60px] px-6 py-5 font-title-t6-semibold font-[number:var(--title-t6-semibold-font-weight)] text-slate-600 text-[length:var(--title-t6-semibold-font-size)] tracking-[var(--title-t6-semibold-letter-spacing)] leading-[var(--title-t6-semibold-line-height)] [font-style:var(--title-t6-semibold-font-style)]"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="h-20 border-b border-slate-200"
              >
                {/* Dish Column */}
                <TableCell className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl bg-cover"
                      style={{
                        backgroundImage: "url(..//frame-48097467-3.png)",
                      }}
                    />
                    <div className="flex flex-col">
                      <div className="font-title-t5-bold font-[number:var(--title-t5-bold-font-weight)] text-[#181818] text-[length:var(--title-t5-bold-font-size)] tracking-[var(--title-t5-bold-letter-spacing)] leading-[var(--title-t5-bold-line-height)] [font-style:var(--title-t5-bold-font-style)]">
                        {order.dish}
                      </div>
                      <div className="font-title-t5-medium font-[number:var(--title-t5-medium-font-weight)] text-slate-500 text-[length:var(--title-t5-medium-font-size)] tracking-[var(--title-t5-medium-letter-spacing)] leading-[var(--title-t5-medium-line-height)] [font-style:var(--title-t5-medium-font-style)]">
                        {order.additionalItems}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Order ID Column */}
                <TableCell className="px-6 py-3">
                  <div className="flex flex-col">
                    <div className="font-title-t5-bold font-[number:var(--title-t5-bold-font-weight)] text-[#181818] text-[length:var(--title-t5-bold-font-size)] tracking-[var(--title-t5-bold-letter-spacing)] leading-[var(--title-t5-bold-line-height)] [font-style:var(--title-t5-bold-font-style)]">
                      {order.orderId}
                    </div>
                    <div className="font-title-t5-medium font-[number:var(--title-t5-medium-font-weight)] text-slate-500 text-[length:var(--title-t5-medium-font-size)] tracking-[var(--title-t5-medium-letter-spacing)] leading-[var(--title-t5-medium-line-height)] [font-style:var(--title-t5-medium-font-style)]">
                      {order.orderCode}
                    </div>
                  </div>
                </TableCell>

                {/* Payment Type Column */}
                <TableCell className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    {order.paymentType.isSpecial ? (
                      <div
                        className={`flex w-10 items-center justify-center px-2 py-[8.57px] ${order.paymentType.bgColor} rounded-[1000px]`}
                      >
                        <div className="relative w-[22.86px] h-[22.86px]">
                          <img
                            className="absolute w-[29px] h-[29px] top-[-3px] left-[-3px]"
                            alt="Payment icon"
                            src={order.paymentType.icon}
                          />
                        </div>
                      </div>
                    ) : order.paymentType.isLogo ? (
                      <div
                        className={`relative w-10 h-10 ${order.paymentType.bgColor} rounded-[1000px] overflow-hidden`}
                      >
                        <img
                          className="absolute w-8 h-[17px] top-3 left-[3px]"
                          alt="Payment logo"
                          src={order.paymentType.icon}
                        />
                      </div>
                    ) : (
                      <div
                        className={`flex w-10 h-10 items-center justify-center px-2 py-[8.57px] ${order.paymentType.bgColor} rounded-[1000px]`}
                      >
                        <img
                          className="w-5 h-5"
                          alt="Payment icon"
                          src={order.paymentType.icon}
                        />
                      </div>
                    )}
                    <div className="font-title-t5-bold font-[number:var(--title-t5-bold-font-weight)] text-[#181818] text-[length:var(--title-t5-bold-font-size)] tracking-[var(--title-t5-bold-letter-spacing)] leading-[var(--title-t5-bold-line-height)] [font-style:var(--title-t5-bold-font-style)]">
                      {order.paymentType.type}
                    </div>
                  </div>
                </TableCell>

                {/* Amount Column */}
                <TableCell className="px-6 py-3">
                  <div className="font-title-t5-bold font-[number:var(--title-t5-bold-font-weight)] text-[length:var(--title-t5-bold-font-size)] tracking-[var(--title-t5-bold-letter-spacing)] leading-[var(--title-t5-bold-line-height)] [font-style:var(--title-t5-bold-font-style)]">
                    <span className="text-[#181818]">{order.amount} </span>
                    <span className="text-slate-200">{order.currency}</span>
                  </div>
                </TableCell>

                {/* Status Column */}
                <TableCell className="px-6 py-3">
                  <Badge
                    className={`${order.status.color} px-2 py-1 rounded-[1234px] font-text-xs-semibold font-[number:var(--text-xs-semibold-font-weight)] text-[length:var(--text-xs-semibold-font-size)] tracking-[var(--text-xs-semibold-letter-spacing)] leading-[var(--text-xs-semibold-line-height)] [font-style:var(--text-xs-semibold-font-style)]`}
                  >
                    {order.status.label}
                  </Badge>
                </TableCell>

                {/* Action Column */}
                <TableCell className="px-6 py-3">
                  <DropdownMenu
                    onOpenChange={(open) => {
                      if (open) {
                        setActiveDropdown(order.id);
                      } else if (activeDropdown === order.id) {
                        setActiveDropdown(null);
                      }
                    }}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`w-10 h-10 rounded-[123px] ${order.id === 2 ? "bg-[#fef1e8]" : ""}`}
                      >
                        <img
                          className="w-6 h-6"
                          alt="Action menu"
                          src="/monotone-add.svg"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    {activeDropdown === order.id && (
                      <DropdownMenuContent className="w-[159px] rounded-lg border border-[#e8e8e9]">
                        <DropdownMenuItem className="flex items-center gap-2.5 px-4 py-2.5">
                          <img
                            className="w-4 h-4"
                            alt="Edit icon"
                            src="/pencilsimple.svg"
                          />
                          <span className="font-text-small-normal font-[number:var(--text-small-normal-font-weight)] text-[#181d27] text-[length:var(--text-small-normal-font-size)] tracking-[var(--text-small-normal-letter-spacing)] leading-[var(--text-small-normal-line-height)] [font-style:var(--text-small-normal-font-style)]">
                            Modifier
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="h-px bg-[#e8e8e9]" />
                        <DropdownMenuItem className="flex items-center gap-2.5 px-4 py-2.5 text-red-500">
                          <img
                            className="w-4 h-4"
                            alt="Cancel icon"
                            src="/x.svg"
                          />
                          <span className="font-text-small-normal font-[number:var(--text-small-normal-font-weight)] text-red-500 text-[length:var(--text-small-normal-font-size)] tracking-[var(--text-small-normal-letter-spacing)] leading-[var(--text-small-normal-line-height)] [font-style:var(--text-small-normal-font-style)]">
                            Annuler
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    )}
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
};
