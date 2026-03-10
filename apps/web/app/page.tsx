import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.logo}>
          <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>Sentimeter</h1>
          <p>Developer-first feedback collection system.</p>
        </div>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="/dashboard"
            rel="noopener noreferrer"
          >
            Go to Dashboard
          </a>
          <a
            href="https://github.com/handshek/sentimeter"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            GitHub
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>© 2026 Sentimeter</p>
      </footer>
    </div>
  );
}
