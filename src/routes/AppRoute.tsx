import { Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import Layout from "../components/Layout";

const AppRoute = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.element />}
          />
        ))}
      </Route>
    </Routes>
  );
};

export default AppRoute;
