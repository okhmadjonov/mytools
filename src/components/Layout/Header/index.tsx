import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "antd";
import { FiSearch, FiMenu, FiChevronDown } from "react-icons/fi";
import { uzFlag, ruFlag, usaFlag } from "../../../assets/icons";
import styles from "./Header.module.scss";

interface HeaderProps {
  onToggleMenu: () => void;
}

const Header = ({ onToggleMenu }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchQuery = searchParams.get("search") || "";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("search", value);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  const handleLangChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem("lng", value);
    setIsLangOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLanguageLabelAndFlag = (lang: string) => {
    switch (lang) {
      case "uz":
        return { label: "UZ", flag: uzFlag };
      case "ru":
        return { label: "RU", flag: ruFlag };
      default:
        return { label: "EN", flag: usaFlag };
    }
  };

  const activeLang = getLanguageLabelAndFlag(i18n.language);

  return (
    <header className={styles.header}>
      <button className={styles.menuToggle} onClick={onToggleMenu} aria-label="Toggle menu">
        <FiMenu />
      </button>

      <div className={styles.centerSection}>
        <div className={styles.searchContainer}>
          <Input
            prefix={<FiSearch className={styles.searchIcon} />}
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
            suffix={<span className={styles.searchShortcut}>/</span>}
            allowClear
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.langDropdownContainer} ref={dropdownRef}>
          <button
            className={styles.langDropdownTrigger}
            onClick={() => setIsLangOpen(!isLangOpen)}
            aria-expanded={isLangOpen}
          >
            <img src={activeLang.flag} alt={activeLang.label} className={styles.flagIcon} />
            <span>{activeLang.label}</span>
            <FiChevronDown className={`${styles.chevronIcon} ${isLangOpen ? styles.rotate : ""}`} />
          </button>

          {isLangOpen && (
            <ul className={styles.langDropdownMenu}>
              <li
                className={`${styles.langDropdownItem} ${i18n.language === "uz" ? styles.selected : ""}`}
                onClick={() => handleLangChange("uz")}
              >
                <img src={uzFlag} alt="UZ" className={styles.flagIcon} />
                <span>UZ</span>
              </li>
              <li
                className={`${styles.langDropdownItem} ${i18n.language === "en" ? styles.selected : ""}`}
                onClick={() => handleLangChange("en")}
              >
                <img src={usaFlag} alt="EN" className={styles.flagIcon} />
                <span>EN</span>
              </li>
              <li
                className={`${styles.langDropdownItem} ${i18n.language === "ru" ? styles.selected : ""}`}
                onClick={() => handleLangChange("ru")}
              >
                <img src={ruFlag} alt="RU" className={styles.flagIcon} />
                <span>RU</span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
