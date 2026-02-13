import styles from './DemoPageLayout.module.css';

const ECO_EXPERTS_LOGO = 'https://images-ulpn.ecs.prd9.eu-west-1.mvfglobal.net/mp/wp-content/uploads/sites/3/2023/09/The-Eco-Experts_Brand-Logo-Blue.svg';
const PROJECT_SOLAR_LOGO = 'https://images-ulpn.ecs.prd9.eu-west-1.mvfglobal.net/wp-content/uploads/2025/10/Project-Solar-long-full-colour-without-tag.svg';

const TRUST_POINTS = [
  { icon: 'installs', title: '50,000+', description: 'Installs across the UK' },
  { icon: 'piggybank', title: '£891', description: 'Avg saving in year one*' },
  { icon: 'guarantee', title: 'Lifetime', description: 'Panel guarantee & aftercare' },
  { icon: 'regulated', title: 'HIES + FCA', description: 'Regulated for peace of mind' },
];

const NEXT_STEPS = [
  { step: 1, icon: 'phone', title: 'Expert call', description: 'Confirm your details, check eligibility, and get instant answers about savings and finance.' },
  { step: 2, icon: 'clipboard', title: 'Free home assessment', description: 'We design your tailored system and provide a no-obligation quote.' },
  { step: 3, icon: 'wrench', title: 'Installation', description: 'Typically completed in 3-4 weeks with full handover, app setup, and aftercare.' },
];

const renderIcon = (iconName) => {
  switch (iconName) {
    case 'installs':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'piggybank':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
          <path d="M2 9.5a1 1 0 1 0 2 0 1 1 0 1 0-2 0" />
          <path d="M16 11h.01" />
        </svg>
      );
    case 'guarantee':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'regulated':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'phone':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'clipboard':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'wrench':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    default:
      return null;
  }
};

export default function DemoPageLayout({ children }) {
  return (
    <div className={styles.container}>
      {/* Co-branded Header */}
      <header className={styles.header}>
        <img src={ECO_EXPERTS_LOGO} alt="The Eco Experts" className={styles.logo} />
        <span className={styles.partnershipText}>In partnership with</span>
        <img src={PROJECT_SOLAR_LOGO} alt="Project Solar" className={styles.logo} />
      </header>
      <div className={styles.headerDivider} />

      {/* Main Confirmation */}
      <div className={styles.confirmationSection}>
        <div className={styles.checkIcon}>
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="30" fill="#DAE7E6" />
            <path
              d="M20 32 L28 40 L44 24"
              fill="none"
              stroke="#03624C"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className={styles.title}>You've been matched with Project Solar UK</h1>
        <p className={styles.subtitle}>
          Based on your answers, your home is suitable for solar panels.<br />
          Your personalised consultation is now reserved.
        </p>
      </div>

      {/* Modal Content Area - This is where the booking journey renders */}
      <div className={styles.iframeContainer}>
        <div className={styles.iframeContent}>
          {children}
        </div>
      </div>

      {/* Trust Section */}
      <div className={styles.trustSection}>
        <h3 className={styles.trustTitle}>Why 50,000+ UK Homes Trust Project Solar</h3>
        <p className={styles.trustSubtitle}>
          Certified quality, clear advice, and lifetime support – all from a nationwide installer.
        </p>
        <div className={styles.trustGrid}>
          {TRUST_POINTS.map((point) => (
            <div key={point.icon} className={styles.trustCard}>
              <span className={styles.trustIcon}>{renderIcon(point.icon)}</span>
              <h4 className={styles.trustCardTitle}>{point.title}</h4>
              <p className={styles.trustCardDescription}>{point.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What Happens Next Section */}
      <div className={styles.nextStepsSection}>
        <h3 className={styles.nextStepsTitle}>What happens next?</h3>
        <p className={styles.nextStepsSubtitle}>
          Your journey to cheaper, greener energy starts here — and we'll guide you at every step.
        </p>
        <div className={styles.stepsGrid}>
          {NEXT_STEPS.map((step) => (
            <div key={step.step} className={styles.stepCard}>
              <span className={styles.stepNumber}>{step.step}</span>
              <span className={styles.stepIcon}>{renderIcon(step.icon)}</span>
              <h4 className={styles.stepTitle}>{step.title}</h4>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <a href="https://www2.mvfglobal.com/privacypolicy/b649e" className={styles.footerLink} target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="https://www2.mvfglobal.com/terms_of_use/5da7f" className={styles.footerLink} target="_blank" rel="noopener noreferrer">Terms of Use</a>
        </div>
        <p className={styles.footerCopyright}>&copy; 2026 The Eco Experts. All rights reserved.</p>
      </footer>
    </div>
  );
}
