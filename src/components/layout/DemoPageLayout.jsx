import styles from './DemoPageLayout.module.css';

const PROJECT_SOLAR_LOGO = 'https://images-ulpn.ecs.prd9.eu-west-1.mvfglobal.net/wp-content/uploads/2025/10/Project-Solar-long-full-colour-without-tag.svg';

export default function DemoPageLayout({ children }) {
  return (
    <div className={styles.iframeContainer}>
      <div className={styles.header}>
        <img
          src={PROJECT_SOLAR_LOGO}
          alt="Project Solar"
          className={styles.logo}
        />
      </div>
      <div className={styles.iframeContent}>
        {children}
      </div>
    </div>
  );
}
