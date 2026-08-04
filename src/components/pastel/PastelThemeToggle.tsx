"use client";

import styles from "./pastel.module.css";

export type PastelTheme = "light" | "dark";

type Props = {
  theme: PastelTheme;
  onToggle: () => void;
};

export default function PastelThemeToggle({ theme, onToggle }: Props) {
  const label =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={onToggle}
      aria-pressed={theme === "dark"}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}
