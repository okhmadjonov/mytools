import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import styles from "./Layout.module.scss";

export interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  category: string;
  tags: string[];
  createdAt: number;
}

const DEFAULT_CATEGORIES = [
  "Git",
  "Docker",
  "VS Code",
  "Frontend",
  "Backend",
  "Database",
  "Other",
];

const Layout = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("dev_snippets");
    if (stored) {
      try {
        setSnippets(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse snippets from localStorage", err);
      }
    }
  }, []);

  const saveSnippets = (newSnippets: Snippet[]) => {
    setSnippets(newSnippets);
    localStorage.setItem("dev_snippets", JSON.stringify(newSnippets));
  };

  return (
    <div className={styles.appContainer}>
      <Header />
      <div className={styles.mainLayout}>
        <Sidebar categories={DEFAULT_CATEGORIES} />
        <main className={styles.contentArea}>
          <Outlet
            context={{
              snippets,
              saveSnippets,
              categories: DEFAULT_CATEGORIES,
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default Layout;
export type LayoutContextType = {
  snippets: Snippet[];
  saveSnippets: (snippets: Snippet[]) => void;
  categories: string[];
};
