import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LockIcon from "src/components/Icon/LockIcon";
import { path } from "src/constants/path.enum";
import { AuthContext } from "src/contexts/auth.context";
import getAvatarUrl from "src/utils/getAvatarUrl";

const UserSidebar = () => {
  const { t } = useTranslation();
  const { userProfile } = useContext(AuthContext);
  return (
    <aside>
      <div className="flex items-center border-b border-b-gray-200 dark:border-b-gray-700 py-4">
        <NavLink
          to={path.profile}
          className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-black/10"
        >
          <img
            src={getAvatarUrl(userProfile?.avatar, userProfile?.email)}
            alt=""
            className="h-full w-full object-cover"
          />
        </NavLink>
        <div className="flex-grow pl-4">
          <div className="mb-1 font-semibold text-gray-600 dark:text-gray-300 line-clamp-1">{userProfile?.name || userProfile?.email || t("Chưa có tên")}</div>
          <NavLink
            to={path.profile}
            className="flex items-center capitalize text-gray-500 dark:text-gray-400"
          >
            <svg
              width={12}
              height={12}
              viewBox="0 0 12 12"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: 4 }}
            >
              <path
                d="M8.54 0L6.987 1.56l3.46 3.48L12 3.48M0 8.52l.073 3.428L3.46 12l6.21-6.18-3.46-3.48"
                fill="#9B9B9B"
                fillRule="evenodd"
              />
            </svg>
            {t("Sửa hồ sơ")}
          </NavLink>
        </div>
      </div>
      <div className="mt-7">
        <NavLink
          to={path.profile}
          className={({ isActive }) =>
            `flex items-center gap-x-3 capitalize transition-colors ${isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"}`
          }
        >
          <div className="h-[22px] w-[22px]">
            <img
              src="https://cf.shopee.vn/file/ba61750a46794d8847c3f463c5e71cc4"
              alt=""
              className="h-full w-full"
            />
          </div>
          {t("Tài khoản của tôi")}
        </NavLink>
        <NavLink
          to={path.changePassword}
          className={({ isActive }) =>
            `mt-2 flex items-center gap-x-3 capitalize transition-colors ${isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"}`
          }
        >
          <div className="h-[22px] w-[22px]">
            <LockIcon
              className="h-[22px] w-[22px]"
              fill="#0E4FB2"
            ></LockIcon>
          </div>
          {t("Đổi mật khẩu")}
        </NavLink>
        <NavLink
          to={path.orderHistory}
          className={({ isActive }) =>
            `mt-2 flex items-center gap-x-3 capitalize transition-colors ${isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"}`
          }
        >
          <div className="h-[22px] w-[22px]">
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 21V3L15 5L12 3L9 5L6 3V21L9 19.5L12 21L15 19.5L18 21Z"
                stroke="#0E4FB2"
                strokeWidth={2}
                strokeLinejoin="round"
              />
              <path
                d="M10 9H14"
                stroke="#0E4FB2"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <path
                d="M10 15H14"
                stroke="#0E4FB2"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <path
                d="M10 12H14"
                stroke="#0E4FB2"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </div>
          {t("Đơn mua")}
        </NavLink>
        <NavLink
          to={path.wishlist}
          className={({ isActive }) =>
            `mt-2 flex items-center gap-x-3 capitalize transition-colors ${isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"}`
          }
        >
          <div className="flex h-[22px] w-[22px] items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-none stroke-[#0E4FB2] stroke-2"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          {t("Yêu thích")}
        </NavLink>
      </div>
    </aside>
  );
};

export default UserSidebar;
