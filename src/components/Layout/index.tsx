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
  const [binId, setBinId] = useState<string | null>(
    localStorage.getItem("npoint_bin_id") || "7c41e341ca0e5e5e8227"
  );
  const [isLoading, setIsLoading] = useState(true);

  // Function to initialize a new npoint.io bin
  const initializeNewBin = async (initialData: Snippet[]) => {
    try {
      const res = await fetch("https://api.npoint.io/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: initialData }),
      });
      if (!res.ok) throw new Error("Failed to create cloud bin");
      const data = await res.json();
      if (data.id) {
        localStorage.setItem("npoint_bin_id", data.id);
        setBinId(data.id);
        message.success("Cloud Sync initialized! Check Sync settings to link other devices.");
      }
    } catch (err) {
      console.error("Failed to initialize npoint.io bin", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const storedBinId = localStorage.getItem("npoint_bin_id") || "7c41e341ca0e5e5e8227";
      if (!localStorage.getItem("npoint_bin_id")) {
        localStorage.setItem("npoint_bin_id", "7c41e341ca0e5e5e8227");
        setBinId("7c41e341ca0e5e5e8227");
      }

      // 1. If we have a Cloud Bin ID, fetch from cloud
      if (storedBinId) {
        try {
          const res = await fetch(`https://api.npoint.io/documents/${storedBinId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.contents && Array.isArray(data.contents)) {
              setSnippets(data.contents);
              localStorage.setItem("dev_snippets", JSON.stringify(data.contents));
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Cloud fetch failed, falling back to local storage", err);
        }
      }

      // 2. Try Local Storage
      const stored = localStorage.getItem("dev_snippets");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSnippets(parsed);
          setIsLoading(false);
          // If no cloud bin yet, initialize one with current local storage data
          if (!storedBinId && parsed.length > 0) {
            initializeNewBin(parsed);
          }
          return;
        } catch (err) {
          console.error("Failed to parse local snippets", err);
        }
      }

      // 3. Fallback to public/snippets.json
      try {
        const res = await fetch("/snippets.json");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSnippets(data);
            localStorage.setItem("dev_snippets", JSON.stringify(data));
            // Initialize new bin
            if (!storedBinId) {
              initializeNewBin(data);
            }
          }
        }
      } catch (err) {
        console.error("Fallback load failed", err);
      }
      setIsLoading(false);
    };

    loadData();
  }, [binId]);

  const saveSnippets = async (newSnippets: Snippet[], triggerDownload = false) => {
    // Immediate local update
    setSnippets(newSnippets);
    localStorage.setItem("dev_snippets", JSON.stringify(newSnippets));

    // Async cloud sync update
    const currentBinId = localStorage.getItem("npoint_bin_id");
    if (currentBinId) {
      try {
        await fetch(`https://api.npoint.io/documents/${currentBinId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: newSnippets }),
        });
      } catch (err) {
        console.warn("Cloud sync failed, will retry next save", err);
      }
    } else {
      // If somehow no bin, create one now
      initializeNewBin(newSnippets);
    }

    if (triggerDownload) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(newSnippets, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "snippets.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      message.info("Updated snippets.json downloaded!");
    }
  };

  const updateBinId = (newId: string) => {
    if (newId) {
      localStorage.setItem("npoint_bin_id", newId);
      setBinId(newId);
    } else {
      localStorage.removeItem("npoint_bin_id");
      setBinId(null);
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
              binId,
              updateBinId,
              isLoading,
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
  binId: string | null;
  updateBinId: (newId: string) => void;
  isLoading: boolean;
};
