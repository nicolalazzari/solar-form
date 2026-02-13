import styles from './ImageryAgeWarning.module.css';

export default function ImageryAgeWarning({
  formattedDate,
  onYes,
  onNo,
}) {
  return (
    <div className={styles.container}>
      <span className={styles.icon} role="img" aria-label="Warning">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 9V13M12 17H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <p className={styles.message}>
        Some satellite data used for this assessment is from{' '}
        <strong>{formattedDate}</strong> — Has your roof changed since then?
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.yesButton}
          onClick={onYes}
        >
          Yes
        </button>
        <button
          type="button"
          className={styles.noButton}
          onClick={onNo}
        >
          No
        </button>
      </div>
    </div>
  );
}
