import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

export default function Banner() {
  return (
    <div className="flex bg-white shadow-sm mt-6 mb-6 rounded-sm overflow-hidden h-[235px]">
      <div className="w-2/3 h-full relative">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={true}
          className="h-full w-full"
        >
          <SwiperSlide>
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80" alt="banner 1" className="w-full h-full object-cover" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&auto=format&fit=crop&q=80" alt="banner 2" className="w-full h-full object-cover" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80" alt="banner 3" className="w-full h-full object-cover" />
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="w-1/3 h-full flex flex-col pl-1">
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80" alt="sub banner 1" className="w-full h-1/2 object-cover pb-[2px]" />
        <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80" alt="sub banner 2" className="w-full h-1/2 object-cover pt-[2px]" />
      </div>
    </div>
  );
}
