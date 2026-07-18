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
  FiChevronRight,
  FiChevronDown,
  FiSliders,
} from "react-icons/fi";
import { FaDocker, FaLaptopCode, FaReact, FaCoffee, FaPython, FaCode } from "react-icons/fa";
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
    "reactjs",
    "aralash",
    "backend",
    "c#",
    "csharp",
    "java",
    "python",
    "database",
    "other",
  ];

  // Accordion open/close state for parent menus
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    Frontend: true,
    Backend: true,
  });

  const handleParentMenuClick = (menuName: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
    handleCategoryClick(menuName);
  };

  // Determine active category based on URL path
  const getActiveCategory = () => {
    if (pathname === "/") return "all";
    if (pathname === "/vs-code") return "vs code";
    if (pathname === "/reactjs") return "reactjs";
    if (pathname === "/csharp") return "c#";
    return pathname.substring(1); // e.g. "/git" -> "git"
  };

  const activeCategory = getActiveCategory();

  const handleCategoryClick = (category: string) => {
    if (category === "all") {
      navigate("/");
    } else if (category.toLowerCase() === "c#") {
      navigate("/csharp");
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
  const filteredCustomCategories = categories.filter((cat) => {
    const isMain = DEFAULT_MAIN_CATEGORIES.includes(cat.toLowerCase());
    const matchesFilter = cat.toLowerCase().includes(filterQuery.toLowerCase());
    return !isMain && matchesFilter;
  });

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
      case "reactjs":
        return <FaReact className={styles.categoryIcon} style={{ color: "#61dafb" }} />;
      case "aralash":
        return <FiSliders className={styles.categoryIcon} />;
      case "backend":
        return <FiServer className={styles.categoryIcon} />;
      case "c#":
      case "csharp":
        return <FaCode className={styles.categoryIcon} />;
      case "java":
        return <FaCoffee className={styles.categoryIcon} />;
      case "python":
        return <FaPython className={styles.categoryIcon} style={{ color: "#306998" }} />;
      case "database":
        return <FiDatabase className={styles.categoryIcon} />;
      default:
        return <FiFolder className={styles.categoryIcon} />;
    }
  };

  // Built-in sidebar hierarchy
  const staticItems = [
    {
      name: "Git",
      icon: getCategoryIcon("git"),
    },
    {
      name: "Docker",
      icon: getCategoryIcon("docker"),
    },
    {
      name: "VS Code",
      icon: getCategoryIcon("vs code"),
    },
    {
      name: "Frontend",
      icon: getCategoryIcon("frontend"),
      children: [
        { name: "ReactJS", icon: getCategoryIcon("reactjs") },
        { name: "Aralash", icon: getCategoryIcon("aralash") },
      ],
    },
    {
      name: "Backend",
      icon: getCategoryIcon("backend"),
      children: [
        { name: "C#", icon: getCategoryIcon("c#") },
        { name: "Java", icon: getCategoryIcon("java") },
        { name: "Python", icon: getCategoryIcon("python") },
      ],
    },
    {
      name: "Database",
      icon: getCategoryIcon("database"),
    },
    {
      name: "Other",
      icon: getCategoryIcon("other"),
    },
  ];

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
              disabled
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
          {/* Bosh Sahifa */}
          <li
            className={`${styles.categoryItem} ${activeCategory === "all" ? styles.active : ""}`}
            onClick={() => handleCategoryClick("all")}
          >
            <div className={styles.categoryItemLeft}>
              {getCategoryIcon("all")}
              <span className={styles.repoName}>Bosh sahifa</span>
            </div>
          </li>

          {/* Core static hierarchical items */}
          {staticItems.map((item) => {
            const hasChildren = !!item.children;
            const isExpanded = !!expandedMenus[item.name];
            const isSelected = activeCategory.toLowerCase() === item.name.toLowerCase();

            return (
              <li key={item.name} className={styles.categoryItemWrapper}>
                <div
                  className={`${styles.categoryItem} ${isSelected ? styles.active : ""}`}
                  onClick={() => hasChildren ? handleParentMenuClick(item.name) : handleCategoryClick(item.name)}
                >
                  <div className={styles.categoryItemLeft}>
                    {item.icon}
                    <span className={styles.repoName}>{item.name}</span>
                  </div>
                  {hasChildren && (
                    <span className={styles.chevronIconWrapper}>
                      {isExpanded ? (
                        <FiChevronDown className={styles.chevronIcon} />
                      ) : (
                        <FiChevronRight className={styles.chevronIcon} />
                      )}
                    </span>
                  )}
                </div>

                {hasChildren && (
                  <ul
                    className={`${styles.childList} ${
                      isExpanded ? styles.expandedList : ""
                    }`}
                  >
                    {item.children.map((child) => {
                      const isChildSelected =
                        activeCategory.toLowerCase() === child.name.toLowerCase();

                      return (
                        <li
                          key={child.name}
                          className={`${styles.childItem} ${
                            isChildSelected ? styles.childActive : ""
                          }`}
                          onClick={() => handleCategoryClick(child.name)}
                        >
                          {child.icon}
                          <span className={styles.childName}>{child.name}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}

          {/* Custom user added categories */}
          {filteredCustomCategories.map((cat) => (
            <li
              key={cat}
              className={`${styles.categoryItem} ${
                activeCategory.toLowerCase() === cat.toLowerCase() ? styles.active : ""
              }`}
              onClick={() => handleCategoryClick(cat)}
            >
              <div className={styles.categoryItemLeft}>
                {getCategoryIcon(cat)}
                <span className={styles.repoName}>{cat}</span>
              </div>
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
            </li>
          ))}
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
