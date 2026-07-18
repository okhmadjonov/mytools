import { useTranslation } from "react-i18next";
import { Select } from "antd";
import { FiCode } from "react-icons/fi";
import { uzFlag, ruFlag, usaFlag } from "../../../assets/icons";
import styles from "./Header.module.scss";

const { Option } = Select;

const Header = () => {
  const { t, i18n } = useTranslation();

  const handleLangChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem("lng", value);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>
          <FiCode />
        </div>
        <h1>{t("title")}</h1>
      </div>

      <div className={styles.actionsSection}>
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
