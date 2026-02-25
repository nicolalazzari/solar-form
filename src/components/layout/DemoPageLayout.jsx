import styles from './DemoPageLayout.module.css';

export default function DemoPageLayout({ children }) {
  return (
    <div className={styles.iframeContainer}>
      <div className={styles.iframeContent}>
        {children}
      </div>
    </div>
  );
}
