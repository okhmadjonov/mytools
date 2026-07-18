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
} from "react-icons/fi";
import type { LayoutContextType, Snippet } from "../../components/Layout";
import styles from "./Home.module.scss";

const { TextArea } = Input;

const INITIAL_MOCK_SNIPPETS: Snippet[] = [
  {
    id: "mock-1",
    title: "Git: Revert last commit but keep changes",
    description: "Undoes the last commit, leaving your changes unstaged in the working directory.",
    code: "git reset --soft HEAD~1",
    category: "Git",
    tags: ["git", "undo", "commit"],
    createdAt: Date.now() - 100000,
  },
  {
    id: "mock-2",
    title: "Docker: Remove all unused containers & images",
    description: "Cleans up your Docker storage by removing dangling containers, volumes, networks, and images.",
    code: "docker system prune -a --volumes",
    category: "Docker",
    tags: ["docker", "cleanup", "sysadmin"],
    createdAt: Date.now() - 80000,
  },
  {
    id: "mock-3",
    title: "VS Code: Enable format on save",
    description: "Add this config snippet to your settings.json to format code automatically.",
    code: '{\n  "editor.formatOnSave": true,\n  "editor.defaultFormatter": "esbenp.prettier-vscode"\n}',
    category: "VS Code",
    tags: ["vscode", "settings", "prettier"],
    createdAt: Date.now() - 60000,
  },
];

const Home = () => {
  const { t } = useTranslation();
  const { snippets, saveSnippets, categories } = useOutletContext<LayoutContextType>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);

  const activeCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";
  const modalType = searchParams.get("modal"); // "add" or "edit"
  const editId = searchParams.get("id");

  // Load initial mocks if empty
  useEffect(() => {
    if (snippets.length === 0 && !localStorage.getItem("dev_snippets")) {
      saveSnippets(INITIAL_MOCK_SNIPPETS);
    }
  }, [snippets, saveSnippets]);

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
      ? values.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
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
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snippets, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeCategory.toLowerCase()}_snippets.json`);
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
    return false; // prevent upload
  };

  const filteredSnippets = snippets.filter((s) => {
    const matchesCategory =
      activeCategory === "all" ||
      s.category.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

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
      case "backend":
        return "#10b981";
      case "database":
        return "#8b5cf6";
      default:
        return "#7d8590";
    }
  };

  return (
    <div className={styles.homeContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h2>{activeCategory === "all" ? t("all") : activeCategory}</h2>
          <span className={styles.countBadge}>{filteredSnippets.length}</span>
        </div>

        <div className={styles.pageActions}>
          <Upload beforeUpload={beforeUpload} showUploadList={false}>
            <Button icon={<FiUpload />} className={styles.actionBtn}>
              {t("import")}
            </Button>
          </Upload>

          <Button
            icon={<FiDownload />}
            onClick={handleExport}
            className={styles.actionBtn}
          >
            {t("export")}
          </Button>

          <Button
            type="primary"
            icon={<FiPlus />}
            onClick={handleAddClick}
            className={styles.addBtn}
          >
            {t("addSnippet")}
          </Button>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredSnippets.map((snippet) => (
          <div key={snippet.id} className={styles.card}>
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
                <button
                  onClick={() => handleCopy(snippet.code, snippet.id)}
                  className={styles.starBtn}
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
              </div>
            </div>

            {snippet.description && (
              <p className={styles.cardDesc}>{snippet.description}</p>
            )}

            <div className={styles.codeContainer}>
              <pre>
                <code>{snippet.code}</code>
              </pre>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.footerLeft}>
                <span
                  className={styles.languageColorDot}
                  style={{ backgroundColor: getCategoryColor(snippet.category) }}
                ></span>
                <span className={styles.languageText}>{snippet.category}</span>
              </div>
              {snippet.tags.length > 0 && (
                <div className={styles.tagsContainer}>
                  {snippet.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSnippets.length === 0 && (
        <div className={styles.emptyState}>{t("noSnippets")}</div>
      )}

      {/* Add / Edit Snippet Modal */}
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
            <Input placeholder="e.g. react, hooks, setup" className={styles.modalInput} />
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
