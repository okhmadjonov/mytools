import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input, Button } from "antd";
import {
  FiBookOpen,
  FiFolder,
  FiLayers,
  FiLayout,
  FiServer,
  FiDatabase,
  FiGitBranch,
  FiX,
  FiPlus,
} from "react-icons/fi";
import { FaDocker, FaLaptopCode } from "react-icons/fa";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
  categories: string[];
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (newCat: string) => void;
  onDeleteCategory: (cat: string) => void;
}

const Sidebar = ({ categories, isOpen, onClose, onAddCategory, onDeleteCategory }: SidebarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [filterQuery, setFilterQuery] = useState("");
  const [newCatInput, setNewCatInput] = useState("");

  const DEFAULT_MAIN_CATEGORIES = [
    "git",
    "docker",
    "vs code",
    "vscode",
    "frontend",
    "backend",
    "database",
    "other",
  ];

  // Determine active category based on URL path
  const getActiveCategory = () => {
    if (pathname === "/") return "all";
    if (pathname === "/vs-code") return "vs code";
    return pathname.substring(1); // e.g. "/git" -> "git"
  };

  const activeCategory = getActiveCategory();

  const handleCategoryClick = (category: string) => {
    if (category === "all") {
      navigate("/");
    } else {
      navigate(`/${category.toLowerCase().replace(" ", "-")}`);
    }
    onClose(); // Close mobile drawer on selection
  };

  const handleAddClick = () => {
    navigate(`${pathname}?modal=add`);
    onClose();
  };

  const handleAddNewCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatInput.trim()) {
      onAddCategory(newCatInput.trim());
      setNewCatInput("");
    }
  };

  // Filter categories shown in sidebar
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "all":
      case "barchasi":
        return <FiLayers className={styles.categoryIcon} />;
      case "git":
        return <FiGitBranch className={styles.categoryIcon} />;
      case "docker":
        return <FaDocker className={styles.categoryIcon} />;
      case "vs code":
      case "vscode":
        return <FaLaptopCode className={styles.categoryIcon} />;
      case "frontend":
        return <FiLayout className={styles.categoryIcon} />;
      case "backend":
        return <FiServer className={styles.categoryIcon} />;
      case "database":
        return <FiDatabase className={styles.categoryIcon} />;
      default:
        return <FiFolder className={styles.categoryIcon} />;
    }
  };

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose}></div>}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <h3>Top categories</h3>
          <div className={styles.headerRightActions}>
            <Button
              type="primary"
              icon={<FiBookOpen className={styles.newIcon} />}
              onClick={handleAddClick}
              className={styles.newBtn}
            >
              New
            </Button>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close menu"
            >
              <FiX />
            </button>
          </div>
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
            <div className={styles.categoryItemLeft}>
              {getCategoryIcon("all")}
              <span className={styles.repoName}>Bosh sahifa</span>
            </div>
          </li>
          {filteredCategories.map((cat) => {
            const isDefault = DEFAULT_MAIN_CATEGORIES.includes(cat.toLowerCase());

            return (
              <li
                key={cat}
                className={`${styles.categoryItem} ${activeCategory.toLowerCase() === cat.toLowerCase() ? styles.active : ""}`}
                onClick={() => handleCategoryClick(cat)}
              >
                <div className={styles.categoryItemLeft}>
                  {getCategoryIcon(cat)}
                  <span className={styles.repoName}>{cat}</span>
                </div>
                {!isDefault && (
                  <button
                    className={styles.deleteCategoryBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCategory(cat);
                    }}
                    title="Delete category"
                  >
                    <FiX />
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {/* Dynamic Category Addition Input */}
        <form onSubmit={handleAddNewCategorySubmit} className={styles.addCategoryForm}>
          <Input
            prefix={<FiPlus className={styles.addIcon} />}
            placeholder="Add category..."
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            className={styles.addCategoryInput}
          />
        </form>
      </aside>
    </>
  );
};

export default Sidebar;
