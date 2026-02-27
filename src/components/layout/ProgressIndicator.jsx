import styles from './ProgressIndicator.module.css';

const STAGES = [
  { id: 'address', label: 'Address' },
  { id: 'solar', label: 'Assessment' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'slot', label: 'Booking' },
  { id: 'confirmation', label: 'Done' },
];

function LocationIcon({ color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <mask id="loc" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <rect width="20" height="20" fill="#D9D9D9" />
      </mask>
      <g mask="url(#loc)">
        <path d="M10 10.21a1.67 1.67 0 100-3.33 1.67 1.67 0 000 3.33zM10 2.5a5 5 0 00-5 5c0 3.75 5 9.17 5 9.17s5-5.42 5-9.17a5 5 0 00-5-5z" fill={color} />
      </g>
    </svg>
  );
}

function SunIcon({ color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <mask id="sun" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <rect width="20" height="20" fill="#D9D9D9" />
      </mask>
      <g mask="url(#sun)">
        <path d="M10 14.17a4.17 4.17 0 100-8.34 4.17 4.17 0 000 8.34zM9.17 1.67h1.66v2.5H9.17v-2.5zm0 14.16h1.66v2.5H9.17v-2.5zM3.4 4.58l1.18-1.18 1.77 1.77L5.17 6.35 3.4 4.58zm10.25 10.25l1.18-1.18 1.77 1.77-1.18 1.18-1.77-1.77zM15.42 5.17l1.18-1.17 1.77 1.77-1.18 1.18-1.77-1.78zM5.17 15.42L3.4 17.18l-1.18-1.18 1.78-1.76 1.17 1.18zM16.67 9.17v1.66h2.5V9.17h-2.5zm-15.84 0v1.66h2.5V9.17h-2.5z" fill={color} />
      </g>
    </svg>
  );
}

function ChecklistIcon({ color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <mask id="chk" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <rect width="20" height="20" fill="#D9D9D9" />
      </mask>
      <g mask="url(#chk)">
        <path d="M7.76 14.79V13.71H16.58V14.79H7.76ZM7.76 10.54V9.46H16.58V10.54H7.76ZM7.76 6.29V5.21H16.58V6.29H7.76ZM4.63 15.47a1.22 1.22 0 01-.86-.36 1.22 1.22 0 01-.36-.86c0-.34.12-.62.36-.86.24-.24.52-.36.87-.36.33 0 .62.12.86.36.24.24.36.52.36.86 0 .34-.12.62-.36.87-.24.24-.52.36-.87.36zm0-4.25a1.22 1.22 0 01-.86-.36 1.22 1.22 0 01-.36-.86c0-.34.12-.62.36-.86.24-.24.52-.36.87-.36.33 0 .62.12.86.36.24.24.36.52.36.86 0 .34-.12.62-.36.86-.24.24-.52.36-.87.36zm0-4.25a1.22 1.22 0 01-.86-.36 1.22 1.22 0 01-.36-.86c0-.34.12-.62.36-.86.24-.24.52-.36.87-.36.33 0 .62.12.86.36.24.24.36.52.36.86 0 .34-.12.63-.36.87-.24.24-.52.36-.87.36z" fill={color} />
      </g>
    </svg>
  );
}

function CalendarIcon({ color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <mask id="cal" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <rect width="20" height="20" fill="#D9D9D9" />
      </mask>
      <g mask="url(#cal)">
        <path d="M4.58 17.5c-.46 0-.85-.16-1.17-.49a1.6 1.6 0 01-.49-1.17V5.42c0-.46.16-.85.49-1.18.32-.32.71-.49 1.17-.49h1.25V2.08h1.25v1.67h5.84V2.08h1.25v1.67h1.25c.46 0 .85.17 1.17.49.33.33.49.72.49 1.18v10.42c0 .45-.16.84-.49 1.17-.32.33-.71.49-1.17.49H4.58zm0-1.25h10.84a.4.4 0 00.3-.12.4.4 0 00.11-.3V8.75H4.17v7.08a.4.4 0 00.12.3.4.4 0 00.3.12z" fill={color} />
      </g>
    </svg>
  );
}

function FinishIcon({ color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <mask id="fin" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <rect width="20" height="20" fill="#D9D9D9" />
      </mask>
      <g mask="url(#fin)">
        <path d="M8.33 14.17l-4.16-4.17 1.17-1.17 3 3 6.33-6.33 1.16 1.17-7.5 7.5z" fill={color} />
      </g>
    </svg>
  );
}

const ICONS = [LocationIcon, SunIcon, ChecklistIcon, CalendarIcon, FinishIcon];

const FILLED_COLOR = '#03624C';
const INACTIVE_COLOR = '#CCCCCC';

export default function ProgressIndicator({ currentStep, totalSteps }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.currentLabel}>
        {STAGES[currentStep - 1]?.label}
      </div>

      <div className={styles.container}>
        {STAGES.map((stage, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isLast = index === STAGES.length - 1;
          const IconComponent = ICONS[index];

          const iconColor = isCompleted
            ? '#FFFFFF'
            : isCurrent
              ? FILLED_COLOR
              : '#FFFFFF';

          let statusClass = styles.incomplete;
          if (isCompleted) statusClass = styles.completed;
          else if (isCurrent) statusClass = styles.current;

          return (
            <div
              key={stage.id}
              className={styles.stage}
              style={{ flex: isLast ? 'none' : 1 }}
            >
              <div className={styles.iconWrapper}>
                <div className={`${styles.stepIcon} ${statusClass}`}>
                  <IconComponent color={iconColor} />
                </div>
                {!isLast && (
                  <div
                    className={`${styles.connector} ${
                      isCompleted ? styles.connectorActive : ''
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
