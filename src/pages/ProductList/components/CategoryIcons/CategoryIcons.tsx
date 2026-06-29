import React from 'react';

const CATEGORIES = [
  { id: 1, title: 'Khung Giờ Săn Sale', image: 'https://api.dicebear.com/7.x/icons/svg?seed=Sale&backgroundColor=ee4d2d' },
  { id: 2, title: 'Miễn Phí Ship - Có Shopee', image: 'https://api.dicebear.com/7.x/icons/svg?seed=Shipping&backgroundColor=00bfa5' },
  { id: 3, title: 'Voucher Giảm Đến 500.000Đ', image: 'https://api.dicebear.com/7.x/icons/svg?seed=Voucher&backgroundColor=ff9800' },
  { id: 4, title: 'Hàng Hiệu Giá Tốt', image: 'https://api.dicebear.com/7.x/icons/svg?seed=Brand&backgroundColor=e91e63' },
  { id: 5, title: 'ShopeePay Vouchers', image: 'https://api.dicebear.com/7.x/icons/svg?seed=Wallet&backgroundColor=f44336' },
  { id: 6, title: 'Bắt Trend Giá Sốc', image: 'https://api.dicebear.com/7.x/icons/svg?seed=Trend&backgroundColor=9c27b0' },
  { id: 7, title: 'Hàng Quốc Tế', image: 'https://api.dicebear.com/7.x/icons/svg?seed=Globe&backgroundColor=3f51b5' },
  { id: 8, title: 'Nạp Thẻ, Dịch Vụ', image: 'https://api.dicebear.com/7.x/icons/svg?seed=Phone&backgroundColor=00bcd4' },
];

export default function CategoryIcons() {
  return (
    <div className="bg-white rounded-sm shadow-sm p-4 mb-6 hidden md:block">
      <div className="flex justify-between items-start text-center">
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="flex flex-col items-center cursor-pointer w-[100px] transition-transform hover:-translate-y-1">
            <div className="w-[45px] h-[45px] mb-2">
              <img src={cat.image} alt={cat.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="text-[13px] leading-4 text-gray-700">{cat.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
