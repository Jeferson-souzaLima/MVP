import React from "react";
import { Package, Store, Scissors, ShoppingBag } from "lucide-react";

export function CategoryTabs({ selected, onChange }) {
  const tabs = [
    {
      id: "produtos",
      label: "Produtos",
      icon: ShoppingBag,
    },
    {
      id: "lojas",
      label: "Lojas",
      icon: Store,
    },
    {
      id: "servicos",
      label: "Serviços",
      icon: Scissors,
    },
  ];

  return (
    <div className="flex justify-center mt-6 px-4">
      <div
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          bg-white
          p-2
          shadow-lg
          border
          border-gray-100
        "
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = selected === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center justify-center gap-2
                rounded-full
                font-semibold
                whitespace-nowrap

                px-5 py-2 text-sm
                md:px-8 md:py-3 md:text-base
                lg:px-10 lg:py-3 lg:text-lg

                transition-all
                duration-300
                ease-out

                ${
                  active
                    ? `
                      bg-[#0E5617]
                      text-white
                      shadow-lg
                      scale-105
                    `
                    : `
                      text-gray-600
                      hover:bg-green-50
                      hover:text-[#0E5617]
                      hover:shadow-md
                      hover:scale-[1.02]
                    `
                }
              `}
            >
              <Icon
                className="
                  w-4 h-4
                  md:w-5 md:h-5
                  lg:w-6 lg:h-6
                "
              />

              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}