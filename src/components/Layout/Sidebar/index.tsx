import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input, Button } from "antd";
import { FiBookOpen } from "react-icons/fi";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
  categories: string[];
}

const Sidebar = ({ categories }: SidebarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [filterQuery, setFilterQuery] = useState("");

  const handleCategoryClick = (category: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === "all") {
      newParams.delete("category");
    } else {
      newParams.set("category", category);
    }
    setSearchParams(newParams);
  };

  const handleAddClick = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("modal", "add");
    setSearchParams(newParams);
  };

  // Filter categories shown in sidebar
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h3>Top categories</h3>
        <Button
          type="primary"
          icon={<FiBookOpen className={styles.newIcon} />}
          onClick={handleAddClick}
          className={styles.newBtn}
        >
          New
        </Button>
      </div>

      <div className={styles.filterSection}>
        <Input
          placeholder="Find a category..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className={styles.filterInput}
          allowClear
        />
      </div>

      <ul className={styles.categoryList}>
        <li
          className={`${styles.categoryItem} ${activeCategory === "all" ? styles.active : ""}`}
          onClick={() => handleCategoryClick("all")}
        >
          <div className={styles.repoIndicator}></div>
          <span className={styles.repoName}>barchasi</span>
        </li>
        {filteredCategories.map((cat) => (
          <li
            key={cat}
            className={`${styles.categoryItem} ${activeCategory.toLowerCase() === cat.toLowerCase() ? styles.active : ""}`}
            onClick={() => handleCategoryClick(cat)}
          >
            <div className={styles.repoIndicator}></div>
            <span className={styles.repoName}>
              {cat}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
