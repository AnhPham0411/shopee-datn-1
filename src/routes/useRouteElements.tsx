import { useContext, lazy, Suspense } from "react";
import { Navigate, Outlet, useRoutes } from "react-router-dom";
import { path } from "src/constants/path.enum";
import { AuthContext } from "src/contexts/auth.context";
import AuthenticationLayout from "src/layouts/AuthenticationLayout";
import CartLayout from "src/layouts/CartLayout";
import MainLayout from "src/layouts/MainLayout";
import UserLayout from "src/layouts/UserLayout";
import StoreLayout from "src/layouts/StoreLayout";
import AdminLayout from "src/layouts/AdminLayout";

const Login = lazy(() => import("src/pages/Login"));
const Cart = lazy(() => import("src/pages/Cart"));
const Checkout = lazy(() => import("src/pages/Checkout"));
const FAQ = lazy(() => import("src/pages/FAQ"));
const Contact = lazy(() => import("src/pages/Contact"));
const ReturnPolicy = lazy(() => import("src/pages/ReturnPolicy"));
const StoreDashboard = lazy(() => import("src/pages/Store/pages/Dashboard"));
const StoreProducts = lazy(() => import("src/pages/Store/pages/Products"));
const StoreOrders = lazy(() => import("src/pages/Store/pages/Orders"));
const StoreVouchers = lazy(() => import("src/pages/Store/pages/Vouchers"));
const StoreRegister = lazy(() => import("src/pages/Store/pages/Register"));
const AdminDashboard = lazy(() => import("src/pages/Admin/pages/Dashboard"));
const AdminUsers = lazy(() => import("src/pages/Admin/pages/Users"));
const AdminProducts = lazy(() => import("src/pages/Admin/pages/Products"));
const AdminOrders = lazy(() => import("src/pages/Admin/pages/Orders"));
const AdminStores = lazy(() => import("src/pages/Admin/pages/Stores"));
const AdminCategories = lazy(() => import("src/pages/Admin/pages/Categories"));
const AdminVouchers = lazy(() => import("src/pages/Admin/pages/Vouchers"));
const AdminReviews = lazy(() => import("src/pages/Admin/pages/Reviews"));
const Forbidden = lazy(() => import("src/pages/Forbidden"));
const NotFound = lazy(() => import("src/pages/NotFound"));
const ProductDetails = lazy(() => import("src/pages/ProductDetails"));
const Register = lazy(() => import("src/pages/Register"));
const ChangePassword = lazy(() => import("src/pages/User/pages/ChangePassword"));
const OrderHistory = lazy(() => import("src/pages/User/pages/OrderHistory"));
const OrderDetail = lazy(() => import("src/pages/User/pages/OrderDetail"));
const Wishlist = lazy(() => import("src/pages/User/pages/Wishlist"));
const Addresses = lazy(() => import("src/pages/User/pages/Addresses"));
const Profile = lazy(() => import("src/pages/User/pages/Profile"));
const ProductList = lazy(() => import("src/pages/ProductList"));

function ProtectedRoute() {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <Outlet></Outlet> : <Navigate to={path.login}></Navigate>;
}

function RejectedRoute() {
  const { isAuthenticated } = useContext(AuthContext);
  return !isAuthenticated ? <Outlet></Outlet> : <Navigate to={path.home}></Navigate>;
}

function StoreRoute() {
  const { isAuthenticated, userProfile } = useContext(AuthContext);
  const isStore = userProfile?.roles?.includes("Store");

  if (!isAuthenticated) return <Navigate to={path.login} />;

  if (!isStore) {
    return (
      <Suspense>
        <StoreRegister />
      </Suspense>
    );
  }

  return <Outlet />;
}

function AdminRoute() {
  const { isAuthenticated, userProfile } = useContext(AuthContext);
  const isAdmin = userProfile?.roles?.includes("Admin");

  if (!isAuthenticated) return <Navigate to={path.login} />;

  if (!isAdmin) {
    return <Navigate to={path.forbidden} />;
  }

  return <Outlet />;
}

export default function useRoutesElement() {
  const routeElements = useRoutes([
    {
      path: "",
      element: <MainLayout></MainLayout>,
      children: [
        {
          path: path.home,
          index: true,
          element: (
            <Suspense>
              <ProductList></ProductList>
            </Suspense>
          ),
        },
        {
          path: path.productDetail,
          element: (
            <Suspense>
              <ProductDetails></ProductDetails>
            </Suspense>
          ),
        },
        {
          path: path.faq,
          element: (
            <Suspense>
              <FAQ></FAQ>
            </Suspense>
          ),
        },
        {
          path: path.contact,
          element: (
            <Suspense>
              <Contact></Contact>
            </Suspense>
          ),
        },
        {
          path: path.returnPolicy,
          element: (
            <Suspense>
              <ReturnPolicy></ReturnPolicy>
            </Suspense>
          ),
        },
        {
          path: path.forbidden,
          element: (
            <Suspense>
              <Forbidden />
            </Suspense>
          ),
        },
        {
          path: "*",
          element: (
            <Suspense>
              <NotFound></NotFound>
            </Suspense>
          ),
        },
      ],
    },

    {
      path: "",
      element: <ProtectedRoute></ProtectedRoute>,
      children: [
        {
          path: path.cart,
          element: (
            <CartLayout>
              <Suspense>
                <Cart></Cart>
              </Suspense>
            </CartLayout>
          ),
        },
        {
          path: path.checkout,
          element: (
            <MainLayout>
              <Suspense>
                <Checkout></Checkout>
              </Suspense>
            </MainLayout>
          ),
        },
        {
          path: path.user,
          element: (
            <MainLayout>
              <UserLayout></UserLayout>
            </MainLayout>
          ),
          children: [
            {
              path: path.profile,
              element: (
                <Suspense>
                  <Profile></Profile>
                </Suspense>
              ),
            },
            {
              path: path.changePassword,
              element: (
                <Suspense>
                  <ChangePassword></ChangePassword>
                </Suspense>
              ),
            },
            {
              path: path.orderHistory,
              element: (
                <Suspense>
                  <OrderHistory></OrderHistory>
                </Suspense>
              ),
            },
            {
              path: path.orderDetail,
              element: (
                <Suspense>
                  <OrderDetail></OrderDetail>
                </Suspense>
              ),
            },
            {
              path: path.wishlist,
              element: (
                <Suspense>
                  <Wishlist></Wishlist>
                </Suspense>
              ),
            },
            {
              path: path.addresses,
              element: (
                <Suspense>
                  <Addresses></Addresses>
                </Suspense>
              ),
            },
          ],
        },
      ],
    },
    {
      path: "",
      element: <RejectedRoute></RejectedRoute>,
      children: [
        {
          path: "",
          element: <AuthenticationLayout></AuthenticationLayout>,
          children: [
            {
              path: path.login,
              element: (
                <Suspense>
                  <Login></Login>
                </Suspense>
              ),
            },
            {
              path: path.register,
              element: (
                <Suspense>
                  <Register></Register>
                </Suspense>
              ),
            },
          ],
        },
      ],
    },
    {
      path: "",
      element: <StoreRoute></StoreRoute>,
      children: [
        {
          path: path.store,
          element: <StoreLayout />,
          children: [
            {
              path: path.storeDashboard,
              element: (
                <Suspense>
                  <StoreDashboard />
                </Suspense>
              ),
            },
            {
              path: path.storeProducts,
              element: (
                <Suspense>
                  <StoreProducts />
                </Suspense>
              ),
            },
            {
              path: path.storeOrders,
              element: (
                <Suspense>
                  <StoreOrders />
                </Suspense>
              ),
            },
            {
              path: path.storeVouchers,
              element: (
                <Suspense>
                  <StoreVouchers />
                </Suspense>
              ),
            },
          ],
        },
      ],
    },
    {
      path: "",
      element: <AdminRoute></AdminRoute>,
      children: [
        {
          path: path.admin,
          element: <AdminLayout />,
          children: [
            {
              path: path.adminDashboard,
              element: (
                <Suspense>
                  <AdminDashboard />
                </Suspense>
              ),
            },
            {
              path: path.adminUsers,
              element: (
                <Suspense>
                  <AdminUsers />
                </Suspense>
              ),
            },
            {
              path: path.adminProducts,
              element: (
                <Suspense>
                  <AdminProducts />
                </Suspense>
              ),
            },
            {
              path: path.adminOrders,
              element: (
                <Suspense>
                  <AdminOrders />
                </Suspense>
              ),
            },
            {
              path: path.adminStores,
              element: (
                <Suspense>
                  <AdminStores />
                </Suspense>
              ),
            },
            {
              path: path.adminCategories,
              element: (
                <Suspense>
                  <AdminCategories />
                </Suspense>
              ),
            },
            {
              path: path.adminVouchers,
              element: (
                <Suspense>
                  <AdminVouchers />
                </Suspense>
              ),
            },
            {
              path: path.adminReviews,
              element: (
                <Suspense>
                  <AdminReviews />
                </Suspense>
              ),
            },
          ],
        },
      ],
    },
  ]);
  return routeElements;
}
