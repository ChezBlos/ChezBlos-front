import React, { createContext, useContext, useState } from "react";

type TabType = "selection" | "recap" | "confirmation";

interface TabContextType {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  nextTab: () => void;
  previousTab: () => void;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTab, setCurrentTab] = useState<TabType>("selection");

  const tabs: TabType[] = ["selection", "recap", "confirmation"];

  const nextTab = () => {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };

  const previousTab = () => {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1]);
    }
  };

  const canGoNext = () => {
    const currentIndex = tabs.indexOf(currentTab);
    return currentIndex < tabs.length - 1;
  };

  const canGoPrevious = () => {
    const currentIndex = tabs.indexOf(currentTab);
    return currentIndex > 0;
  };

  return (
    <TabContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        nextTab,
        previousTab,
        canGoNext,
        canGoPrevious,
      }}
    >
      {children}
    </TabContext.Provider>
  );
};

export const useTab = () => {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error("useTab must be used within a TabProvider");
  }
  return context;
};
