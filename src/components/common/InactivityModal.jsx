import styles from './InactivityModal.module.css';

export default function InactivityModal({ countdown, onStayActive }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Are you still there?</h2>
        <p className={styles.message}>
          Your session will expire in <span className={styles.countdown}>{countdown}</span> seconds due to inactivity.
        </p>
        <button
          className={styles.button}
          onClick={onStayActive}
          type="button"
        >
          Yes, I'm still here
        </button>
      </div>
    </div>
  );
}
