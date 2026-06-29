import React from 'react';
import { Link, createSearchParams } from 'react-router-dom';
import { TCategory } from 'src/types/category.type';
import { path } from 'src/constants/path.enum';

interface MainCategoriesProps {
  categories: TCategory[];
}

export default function MainCategories({ categories }: MainCategoriesProps) {
  const categoryImages: Record<string, string> = {
    'thời trang nam': '/categories/nam.png',
    'thời trang nữ': '/categories/nu.png',
    'điện thoại & phụ kiện': '/categories/phone.png',
    'phụ kiện điện thoại': '/categories/phone.png',
    'balo & túi xách': '/categories/balo.png',
    'balo & túi ví': '/categories/balo.png',
    'đồng hồ & trang sức': '/categories/watch.png',
    'đồng hồ': '/categories/watch.png',
  };

  const getCategoryImage = (name: string) => {
    const lowerName = name.trim().toLowerCase();
    if (categoryImages[lowerName]) {
      return categoryImages[lowerName];
    }
    // Ảnh mặc định nếu không khớp
    return 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&auto=format&fit=crop&q=80';
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm mb-6 hidden md:block">
      <div className="h-[60px] px-5 flex items-center border-b border-gray-100 dark:border-gray-700">
        <div className="text-gray-500 dark:text-gray-400 uppercase font-medium">Danh Mục</div>
      </div>
      <div className="flex flex-wrap">
        {categories.map((category) => (
          <Link
            key={category._id}
            to={{
              pathname: path.home,
              search: createSearchParams({ category: category._id }).toString()
            }}
            className="w-[120px] h-[150px] flex flex-col items-center justify-center border-r border-b border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-[1px] transition-all bg-white dark:bg-gray-800"
          >
            <div className="w-[85px] h-[85px] bg-white rounded-full flex items-center justify-center mb-3">
              <img src={getCategoryImage(category.name)} alt={category.name} className="w-[60px] h-[60px] rounded-full object-cover" />
            </div>
            <div className="text-center text-[13px] leading-4 text-gray-700 dark:text-gray-200 px-2 line-clamp-2">
              {category.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
