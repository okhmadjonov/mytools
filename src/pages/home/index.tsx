import { useState, useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input, Select, Button, Popconfirm, Upload, message } from "antd";
import {
  FiCopy,
  FiCheck,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiTerminal,
  FiUpload,
  FiDownload,
  FiX,
  FiStar,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import Fuse from "fuse.js";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-sql";

import type { LayoutContextType, Snippet } from "../../components/Layout";
import staticSnippets from "../../data/staticSnippets.json";
import styles from "./Home.module.scss";

const { TextArea } = Input;

const INITIAL_MOCK_SNIPPETS: Snippet[] = [];

interface HomeProps {
  category?: string;
}

const Home = ({ category: propCategory }: HomeProps) => {
  const { t } = useTranslation();
  const { snippets, saveSnippets, categories, starredIds, toggleStar, isLoading } =
    useOutletContext<LayoutContextType>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  
  // Tag filter state
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const activeCategory = propCategory || "all";
  const searchQuery = searchParams.get("search") || "";
  const modalType = searchParams.get("modal");
  const editId = searchParams.get("id");

  // Load initial mocks if empty
  useEffect(() => {
    if (
      snippets.length === 0 &&
      !localStorage.getItem("dev_snippets") &&
      !isLoading
    ) {
      saveSnippets(INITIAL_MOCK_SNIPPETS);
    }
  }, [snippets, saveSnippets, isLoading]);

  // Handle opening of Edit modal
  useEffect(() => {
    if (modalType === "edit" && editId) {
      const found = snippets.find((s) => s.id === editId);
      if (found) {
        setEditingSnippet(found);
        form.setFieldsValue({
          title: found.title,
          category: found.category,
          description: found.description,
          code: found.code,
          tags: found.tags.join(", "),
        });
      }
    } else {
      setEditingSnippet(null);
      form.resetFields();
    }
  }, [modalType, editId, snippets, form]);

  const handleCloseModal = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("modal");
    newParams.delete("id");
    setSearchParams(newParams);
  };

  const handleAddClick = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("modal", "add");
    setSearchParams(newParams);
  };

  const handleSave = (values: any) => {
    const parsedTags = values.tags
      ? values.tags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean)
      : [];

    if (editingSnippet) {
      const updated = snippets.map((s) =>
        s.id === editingSnippet.id
          ? {
              ...s,
              title: values.title,
              category: values.category,
              description: values.description,
              code: values.code,
              tags: parsedTags,
            }
          : s
      );
      saveSnippets(updated, true);
      message.success("Snippet updated successfully!");
    } else {
      const newSnippet: Snippet = {
        id: `snippet-${Date.now()}`,
        title: values.title,
        category: values.category,
        description: values.description,
        code: values.code,
        tags: parsedTags,
        createdAt: Date.now(),
      };
      saveSnippets([newSnippet, ...snippets], true);
      message.success("Snippet added successfully!");
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    const updated = snippets.filter((s) => s.id !== id);
    saveSnippets(updated, true);
    message.success("Snippet deleted successfully!");
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    message.success(t("copied"));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditClick = (snippet: Snippet) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("modal", "edit");
    newParams.set("id", snippet.id);
    setSearchParams(newParams);
  };

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(snippets, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${activeCategory.toLowerCase()}_snippets.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (importedSnippets: Snippet[]) => {
    if (Array.isArray(importedSnippets)) {
      const valid = importedSnippets.every(
        (s) => s.id && s.title && s.code && s.category
      );
      if (valid) {
        saveSnippets(importedSnippets, true);
      } else {
        throw new Error("Invalid format");
      }
    } else {
      throw new Error("Data is not an array");
    }
  };

  const beforeUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        handleImport(json);
        message.success("Snippets imported successfully!");
      } catch (err) {
        message.error("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    return false;
  };

  const getFileExtension = (category: string) => {
    const cat = category.toLowerCase();
    if (cat === "python") return ".py";
    if (cat === "c#" || cat === "csharp") return ".cs";
    if (cat === "java") return ".java";
    if (cat === "reactjs") return ".tsx";
    if (cat === "frontend" || cat === "aralash") return ".js";
    if (cat === "database") return ".sql";
    if (cat === "docker") return ".yml";
    if (cat === "git") return ".sh";
    return ".txt";
  };

  const handleDownloadFile = (snippet: Snippet) => {
    const element = document.createElement("a");
    const file = new Blob([snippet.code], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    const ext = getFileExtension(snippet.category);
    const safeTitle = snippet.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
    element.download = `${safeTitle}${ext}`;
    document.body.appendChild(element);
    element.click();
    element.remove();
    message.success("Fayl yuklab olindi!");
  };

  // Combine static snippets from json + dynamic snippets from database/localstorage
  const combinedSnippets = [
    ...staticSnippets,
    ...snippets.filter((s) => !staticSnippets.some((st) => st.id === s.id)),
  ];

  // 1. Filter snippets by Category page
  const categoryFiltered = combinedSnippets.filter((s) => {
    if (activeCategory === "starred") {
      return starredIds.includes(s.id);
    }
    return activeCategory === "all" || s.category.toLowerCase() === activeCategory.toLowerCase();
  });

  // 2. Filter by selected tag if any
  const tagFiltered = categoryFiltered.filter((s) => {
    if (!selectedTag) return true;
    return s.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase());
  });

  // 3. Filter using Fuse.js (Fuzzy search) if query exists
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>(tagFiltered);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSnippets(tagFiltered);
      return;
    }

    const fuse = new Fuse(tagFiltered, {
      keys: ["title", "description", "code", "tags"],
      threshold: 0.35,
    });

    const results = fuse.search(searchQuery).map((r) => r.item);
    setFilteredSnippets(results);
  }, [searchQuery, selectedTag, activeCategory, snippets, starredIds]);

  // Syntax Highlighting effect
  useEffect(() => {
    Prism.highlightAll();
  }, [filteredSnippets]);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === "INPUT" || 
        activeEl.tagName === "TEXTAREA" || 
        activeEl.getAttribute("contenteditable") === "true"
      );

      if (isTyping) {
        if (e.key === "Escape") {
          (activeEl as HTMLElement).blur();
        }
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      if (e.key.toLowerCase() === "n" || (e.ctrlKey && e.key.toLowerCase() === "n")) {
        e.preventDefault();
        handleAddClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchParams, propCategory]);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "git":
        return "#f05032";
      case "docker":
        return "#2496ed";
      case "vs code":
      case "vscode":
        return "#007acc";
      case "frontend":
        return "#3b82f6";
      case "reactjs":
        return "#61dafb";
      case "aralash":
        return "#e91e63";
      case "backend":
        return "#10b981";
      case "c#":
      case "csharp":
        return "#178600";
      case "java":
        return "#b07219";
      case "python":
        return "#3572a5";
      case "database":
        return "#8b5cf6";
      default:
        return "#7d8590";
    }
  };

  const getPrismLanguageClass = (category: string) => {
    const cat = category.toLowerCase();
    if (cat === "git" || cat === "docker") return "language-bash";
    if (cat === "vs code" || cat === "vscode") return "language-json";
    if (cat === "database") return "language-sql";
    if (cat === "frontend" || cat === "reactjs") return "language-typescript";
    return "language-javascript";
  };

  if (isLoading) {
    return (
      <div className={styles.homeContainer}>
        <div className={styles.pageHeader}>
          <div className={styles.skeletonTitleHeader}></div>
        </div>
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${styles.card} ${styles.skeletonCard}`}>
              <div className={styles.skeletonHeader}>
                <div className={styles.skeletonAvatar}></div>
                <div className={styles.skeletonMeta}>
                  <div className={styles.skeletonLineShort}></div>
                  <div className={styles.skeletonLineLong}></div>
                </div>
              </div>
              <div className={styles.skeletonDesc}></div>
              <div className={styles.skeletonCode}></div>
              <div className={styles.skeletonFooter}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.homeContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h2>{activeCategory === "all" ? t("all") : (activeCategory === "starred" ? "Tanlanganlar" : activeCategory)}</h2>
          <span className={styles.countBadge}>{filteredSnippets.length}</span>
        </div>

        <div className={styles.pageActions}>
          <Upload beforeUpload={beforeUpload} showUploadList={false} disabled>
            <Button icon={<FiUpload />} className={styles.actionBtn} disabled>
              {t("import")}
            </Button>
          </Upload>

          <Button
            icon={<FiDownload />}
            onClick={handleExport}
            className={styles.actionBtn}
            disabled
          >
            {t("export")}
          </Button>

          <Button
            type="primary"
            icon={<FiPlus />}
            onClick={handleAddClick}
            className={styles.addBtn}
            disabled
          >
            {t("addSnippet")}
          </Button>
        </div>
      </div>

      {/* Selected Tag Active Filter Banner */}
      {selectedTag && (
        <div className={styles.tagBanner}>
          <span>
            Filtering by tag: <strong>#{selectedTag}</strong>
          </span>
          <button onClick={() => setSelectedTag(null)} className={styles.clearTagBtn}>
            <FiX /> Clear Filter
          </button>
        </div>
      )}

      {activeCategory === "all" && !selectedTag && (
        <div className={styles.guideCard}>
          <h3>{t("guide.title")}</h3>
          <div className={styles.guideSteps}>
            <div className={styles.guideStep}>
              <strong>{t("guide.step1Title")}</strong>
              <p>{t("guide.step1Desc")}</p>
            </div>
            <div className={styles.guideStep}>
              <strong>{t("guide.step2Title")}</strong>
              <p>{t("guide.step2Desc")}</p>
            </div>
            <div className={styles.guideStep}>
              <strong>{t("guide.step3Title")}</strong>
              <p>{t("guide.step3Desc")}</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {filteredSnippets.map((snippet) => {
          const isStatic = staticSnippets.some((st) => st.id === snippet.id);
          const isStarred = starredIds.includes(snippet.id);

          return (
            <div
              key={snippet.id}
              className={styles.card}
              style={{
                "--glow-color": getCategoryColor(snippet.category),
              } as React.CSSProperties}
            >
              <div className={styles.cardHeader}>
                <div className={styles.meta}>
                  <div className={styles.cardTitleArea}>
                    <span className={styles.repoIcon}>
                      <FiTerminal />
                    </span>
                    <span className={styles.cardTitle}>
                      {snippet.category.toLowerCase().replace(" ", "-")}
                    </span>
                  </div>
                  <h4 className={styles.snippetTitle}>{snippet.title}</h4>
                </div>
                <div className={styles.actions}>
                  {/* Star/Favorite Button */}
                  <button
                    onClick={() => toggleStar(snippet.id)}
                    className={styles.starIconBtn}
                    data-tooltip={isStarred ? "Tanlanganlardan olib tashlash" : "Tanlanganlarga qo'shish"}
                  >
                    {isStarred ? <FaStar style={{ color: "#ffc107" }} /> : <FiStar />}
                  </button>

                  {/* Download Code Button */}
                  <button
                    onClick={() => handleDownloadFile(snippet)}
                    className={styles.downloadFileBtn}
                    data-tooltip="Fayl ko'rinishida yuklab olish"
                  >
                    <FiDownload />
                  </button>

                  <button
                    onClick={() => handleCopy(snippet.code, snippet.id)}
                    className={styles.starBtn}
                    data-tooltip={copiedId === snippet.id ? "Nusxalandi!" : "Kodni nusxalash"}
                  >
                    {copiedId === snippet.id ? (
                      <>
                        <FiCheck className={styles.checkIcon} /> Copied!
                      </>
                    ) : (
                      <>
                        <FiCopy /> Copy
                      </>
                    )}
                  </button>
                  {!isStatic && (
                    <>
                      <button
                        onClick={() => handleEditClick(snippet)}
                        className={styles.editBtn}
                      >
                        <FiEdit3 />
                      </button>
                      <Popconfirm
                        title={t("delete") + "?"}
                        onConfirm={() => handleDelete(snippet.id)}
                        okText={t("delete")}
                        cancelText={t("form.cancel")}
                        okButtonProps={{ danger: true }}
                      >
                        <button className={styles.deleteBtn}>
                          <FiTrash2 />
                        </button>
                      </Popconfirm>
                    </>
                  )}
                </div>
              </div>

              {snippet.description && (
                <p className={styles.cardDesc}>{snippet.description}</p>
              )}

              <div className={styles.codeContainer}>
                <pre>
                  <code className={getPrismLanguageClass(snippet.category)}>
                    {snippet.code}
                  </code>
                </pre>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.footerLeft}>
                  <span
                    className={styles.languageColorDot}
                    style={{
                      backgroundColor: getCategoryColor(snippet.category),
                    }}
                  ></span>
                  <span className={styles.languageText}>
                    {snippet.category}
                  </span>
                </div>
                {snippet.tags.length > 0 && (
                  <div className={styles.tagsContainer}>
                    {snippet.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`${styles.tag} ${selectedTag?.toLowerCase() === tag.toLowerCase() ? styles.tagActive : ""}`}
                        style={{
                          "--tag-color": getCategoryColor(snippet.category),
                        } as React.CSSProperties}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSnippets.length === 0 && (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyStateIcon}>
            <FiTerminal />
          </div>
          <h3>{t("noSnippets")}</h3>
          <p>Qidiruv shartlariga mos keladigan ma'lumotlar topilmadi. Boshqa kalit so'zlarni sinab ko'ring.</p>
        </div>
      )}



      <Modal
        title={editingSnippet ? t("editSnippet") : t("addSnippet")}
        open={modalType === "add" || modalType === "edit"}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnClose
        className={styles.modal}
        styles={{
          mask: {
            backdropFilter: "blur(4px)",
          },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="title"
            label={t("form.title")}
            rules={[{ required: true, message: t("form.required") }]}
          >
            <Input className={styles.modalInput} />
          </Form.Item>

          <Form.Item
            name="category"
            label={t("form.category")}
            rules={[{ required: true, message: t("form.required") }]}
          >
            <Select className={styles.modalSelect}>
              {categories.map((cat) => (
                <Select.Option key={cat} value={cat}>
                  {cat}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label={t("form.description")}>
            <Input className={styles.modalInput} />
          </Form.Item>

          <Form.Item
            name="code"
            label={t("form.code")}
            rules={[{ required: true, message: t("form.required") }]}
          >
            <TextArea rows={6} className={styles.modalTextArea} />
          </Form.Item>

          <Form.Item name="tags" label={t("form.tags")}>
            <Input
              placeholder="e.g. react, hooks, setup"
              className={styles.modalInput}
            />
          </Form.Item>

          <div className={styles.formActions}>
            <Button onClick={handleCloseModal} className={styles.cancelBtn}>
              {t("form.cancel")}
            </Button>
            <Button type="primary" htmlType="submit" className={styles.saveBtn}>
              {t("form.save")}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Home;
