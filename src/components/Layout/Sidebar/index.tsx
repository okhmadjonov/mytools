import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiGrid,
  FiGithub,
  FiTerminal,
  FiCpu,
  FiDatabase,
  FiLayout,
  FiHash,
} from "react-icons/fi";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
  categories: string[];
}

const Sidebar = ({ categories }: SidebarProps) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const handleCategoryClick = (category: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === "all") {
      newParams.delete("category");
    } else {
      newParams.set("category", category);
    }
    setSearchParams(newParams);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "all":
        return <FiGrid />;
      case "git":
        return <FiGithub />;
      case "docker":
        return <FiTerminal />;
      case "vs code":
      case "vscode":
        return <FiTerminal />;
      case "frontend":
        return <FiLayout />;
      case "backend":
        return <FiCpu />;
      case "database":
        return <FiDatabase />;
      default:
        return <FiHash />;
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sectionTitle}>{t("categories")}</div>
      <ul className={styles.categoryList}>
        <li
          className={`${styles.categoryItem} ${activeCategory === "all" ? styles.active : ""}`}
          onClick={() => handleCategoryClick("all")}
        >
          <span className={styles.icon}>{getCategoryIcon("all")}</span>
          <span className={styles.name}>{t("all")}</span>
        </li>
        {categories.map((cat) => (
          <li
            key={cat}
            className={`${styles.categoryItem} ${activeCategory.toLowerCase() === cat.toLowerCase() ? styles.active : ""}`}
            onClick={() => handleCategoryClick(cat)}
          >
            <span className={styles.icon}>{getCategoryIcon(cat)}</span>
            <span className={styles.name}>{cat}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
