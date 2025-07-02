import { SearchIcon } from "lucide-react";
import { Input } from "../../../../../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { useMenu } from "../../../../../contexts/MenuContext";

export const MenuSection = (): JSX.Element => {
  const { searchTerm, selectedCategory, setSearchTerm, setSelectedCategory } =
    useMenu();

  // Menu categories data
  const menuCategories = [
    { id: "all", label: "Tous" },
    { id: "menus", label: "Menus" },
    { id: "boissons", label: "Boissons" },
    { id: "accompagnements", label: "Accompagnements" },
    { id: "desserts", label: "Desserts" },
  ];
  return (
    <section className="flex flex-col w-full items-start gap-3 pt-3 pb-0 px-6 flex-shrink-0">
      {/* Search Bar */}
      <div className="w-full">
        <div className="relative w-full">
          <Input
            className="h-10 pl-4 pr-10 py-2 bg-[#eff1f3] rounded-[123px] font-title-t4-semibold text-gray-60"
            placeholder="Rechercher un plat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <SearchIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Menu Categories Tabs */}
      <Tabs
        value={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value as any)}
        className="w-full"
      >
        <TabsList className="w-full h-auto bg-transparent p-0 justify-start">
          {menuCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className={`flex-1 px-4 py-2 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-gray-80 data-[state=inactive]:text-slate-700 font-text-sm-bold`}
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </section>
  );
};
