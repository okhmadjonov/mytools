import { Routes, Route, useParams } from "react-router-dom";
import { routes } from "./routes";
import Layout from "../components/Layout";
import Home from "../pages/home";

const CategoryPageWrapper = () => {
  const { categoryName } = useParams();
  
  const getCategoryFromSlug = (slug: string) => {
    const s = slug.toLowerCase();
    if (s === "vs-code") return "VS Code";
    if (s === "reactjs") return "ReactJS";
    if (s === "aralash") return "Aralash";
    if (s === "csharp") return "C#";
    if (s === "java") return "Java";
    if (s === "python") return "Python";
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
