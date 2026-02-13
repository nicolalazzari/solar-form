import styles from './ProgressIndicator.module.css';

export default function ProgressIndicator({ currentStep, totalSteps }) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <span className={styles.stepText}>Step {currentStep} of {totalSteps}</span>
        <span className={styles.percentage}>{percentage}%</span>
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
