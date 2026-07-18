import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input, Select } from "antd";
import { FiSearch } from "react-icons/fi";
import { uzFlag, ruFlag, usaFlag } from "../../../assets/icons";
import styles from "./Header.module.scss";

const { Option } = Select;

const Header = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

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
  };

  return (
    <header className={styles.header}>
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
        <Select
          defaultValue={i18n.language}
          onChange={handleLangChange}
          className={styles.langSelect}
          popupClassName={styles.langSelectPopup}
        >
          <Option value="uz">
            <div className={styles.langItem}>
              <img src={uzFlag} alt="UZ" className={styles.flagIcon} />
              <span>UZ</span>
            </div>
          </Option>
          <Option value="en">
            <div className={styles.langItem}>
              <img src={usaFlag} alt="EN" className={styles.flagIcon} />
              <span>EN</span>
            </div>
          </Option>
          <Option value="ru">
            <div className={styles.langItem}>
              <img src={ruFlag} alt="RU" className={styles.flagIcon} />
              <span>RU</span>
            </div>
          </Option>
        </Select>
      </div>
    </header>
  );
};

export default Header;
