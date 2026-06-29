import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "./contexts/auth.context";
import useRoutesElement from "./routes/useRouteElements";
import { LocalStorageEventTarget } from "./utils/auth";
import BackToTop from "./components/BackToTop";

// eslint-disable-next-line import/no-unresolved
function App() {
  const routeElements = useRoutesElement();
  const { clearAuthenFromProvider } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    LocalStorageEventTarget.addEventListener("clearAuthen", clearAuthenFromProvider);
    return () => {
      LocalStorageEventTarget.removeEventListener("clearAuthen", clearAuthenFromProvider);
    };
  }, [clearAuthenFromProvider]);
  return (
    <>
      {routeElements}
      <BackToTop />
    </>
  );
}

export default App;
