import { Routes, Route, useParams } from "react-router-dom";
import { routes } from "./routes";
import Layout from "../components/Layout";
import Home from "../pages/home";

const CategoryPageWrapper = () => {
  const { categoryName } = useParams();
  
  const getCategoryFromSlug = (slug: string) => {
    if (slug === "vs-code") return "VS Code";
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace("-", " ");
  };

  const category = categoryName ? getCategoryFromSlug(categoryName) : "all";
  return <Home category={category} />;
};

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
        {/* Fallback routing for dynamic custom categories */}
        <Route path="/:categoryName" element={<CategoryPageWrapper />} />
      </Route>
    </Routes>
  );
};

export default AppRoute;
