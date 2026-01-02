import React from 'react';
import { cn } from '@/lib/utils';
import { Category } from '@/types/menu';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-4 -mx-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            'category-tab whitespace-nowrap',
            activeCategory === category.id && 'category-tab-active'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
