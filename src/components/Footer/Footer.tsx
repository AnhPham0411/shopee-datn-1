import React from "react";
import { Link } from "react-router-dom";
import { path } from "src/constants/path.enum";
import { useTranslation } from "react-i18next";

import SeoFooter from "./SeoFooter";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <>
      <SeoFooter />
      <footer className="bg-neutral-100 dark:bg-gray-900 py-10">
        <div className="container">
          <div className="mb-10 grid grid-cols-1 gap-8 border-b border-gray-200 dark:border-gray-700 pb-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase text-gray-700 dark:text-gray-300">{t("Chăm sóc khách hàng")}</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  to={path.faq}
                  className="hover:text-primary"
                >
                  {t("Câu hỏi thường gặp")}
                </Link>
              </li>
              <li>
                <Link
                  to={path.contact}
                  className="hover:text-primary"
                >
                  {t("Hỗ trợ & Liên hệ")}
                </Link>
              </li>
              <li>
                <Link
                  to={path.returnPolicy}
                  className="hover:text-primary"
                >
                  {t("Chính sách đổi trả")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase text-gray-700 dark:text-gray-300">{t("Về Shopee")}</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <span className="cursor-pointer hover:text-primary">{t("Giới thiệu")}</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-primary">{t("Tuyển dụng")}</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-primary">{t("Điều khoản")}</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase text-gray-700 dark:text-gray-300">{t("Theo dõi chúng tôi trên")}</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-primary"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.31h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                  </svg>
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-primary"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-primary"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.63-.52 3.25-1.5 4.54-1.01 1.33-2.5 2.24-4.14 2.58-1.53.33-3.15.21-4.6-.39-1.5-.61-2.73-1.72-3.48-3.14-.77-1.47-1-3.17-.67-4.78.33-1.62 1.25-3.08 2.56-4.06 1.3-.97 2.91-1.41 4.51-1.28.32.02.64.07.96.14V12.4c-.2-.04-.4-.06-.6-.08-.75-.05-1.51.02-2.22.25-.76.24-1.43.71-1.92 1.34-.49.63-.76 1.41-.78 2.21-.02.77.21 1.52.64 2.15.42.61 1.01 1.09 1.69 1.36.72.29 1.52.38 2.28.26.79-.12 1.51-.5 2.07-1.07.6-.62 1-1.45 1.12-2.32.11-.84.1-1.69.1-2.54V.02h4.03z" />
                  </svg>
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between text-gray-500 dark:text-gray-400 lg:flex-row">
          <div className="text-sm">© {new Date().getFullYear()} Shopee Clone. {t("Tất cả các quyền được bảo lưu.")}</div>
          <div className="text-sm">{t("Quốc gia & Khu vực:")} Việt Nam | Singapore | Indonesia</div>
        </div>
        <div className="mt-8 text-center text-xs leading-relaxed text-gray-400 dark:text-gray-500">
          <div>{t("Công ty TNHH Shopee Clone")}</div>
          <div className="mt-2">
            {t("Địa chỉ:")} Tầng 4-5-6, Tòa nhà Capital Place, số 29 đường Liễu Giai, Phường Ngọc Khánh, Quận Ba Đình, Thành
            phố Hà Nội, Việt Nam. <br /> {t("Tổng đài hỗ trợ:")} 19001221 - Email: cskh@shopee.vn
          </div>
          <div className="mt-2">
            {t("Chịu Trách Nhiệm Quản Lý Nội Dung:")} Nguyễn Đức Trí - {t("Điện thoại liên hệ:")} 024 73081221 (ext 4678)
          </div>
          <div className="mt-2">
            {t("Mã số doanh nghiệp:")} 0106773786 do Sở Kế hoạch & Đầu tư TP Hà Nội cấp lần đầu ngày 10/02/2015
          </div>
          <div className="mt-2">© 2015 - {t("Bản quyền thuộc về")} Công ty TNHH Shopee</div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
