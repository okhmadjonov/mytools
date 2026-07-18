import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { message } from "antd";
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
    // 1. Try to fetch from public/snippets.json
    fetch("/snippets.json")
      .then((res) => {
        if (!res.ok) throw new Error("File not found");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setSnippets(data);
          localStorage.setItem("dev_snippets", JSON.stringify(data));
        }
      })
      .catch(() => {
        // 2. Fallback to localStorage
        const stored = localStorage.getItem("dev_snippets");
        if (stored) {
          try {
            setSnippets(JSON.parse(stored));
          } catch (err) {
            console.error("Failed to parse snippets from localStorage", err);
          }
        }
      });
  }, []);

  const saveSnippets = (newSnippets: Snippet[], triggerDownload = false) => {
    setSnippets(newSnippets);
    localStorage.setItem("dev_snippets", JSON.stringify(newSnippets));

    if (triggerDownload) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(newSnippets, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "snippets.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      message.info("Updated snippets.json downloaded! Replace it in your public/ folder.");
    }
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
  saveSnippets: (snippets: Snippet[], triggerDownload?: boolean) => void;
  categories: string[];
};
