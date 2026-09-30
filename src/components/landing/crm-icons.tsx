export function CrmIcons() {
  return (
    <div className="flex items-center gap-2.5">
      <HubSpotIcon />
      <SalesforceIcon />
      <PipedriveIcon />
      <DynamicsIcon />
    </div>
  );
}

export function HubSpotIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="HubSpot">
      <circle cx="12" cy="12" r="12" fill="#FF7A59" />
      <circle cx="12" cy="12" r="3.2" fill="#fff" />
      <circle cx="12" cy="4.6" r="1.7" fill="#fff" />
      <circle cx="18.6" cy="9.2" r="1.5" fill="#fff" />
      <circle cx="16.6" cy="17.6" r="1.5" fill="#fff" />
      <circle cx="7.4" cy="17.6" r="1.5" fill="#fff" />
      <path d="M12 5.8v3M16.8 9.6l-2.2 1.4M15.6 16.4l-1.8-1.6M8.4 16.4l1.8-1.6" stroke="#fff" strokeWidth="1.4" />
    </svg>
  );
}

export function SalesforceIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Salesforce">
      <rect width="24" height="24" rx="6" fill="#00A1E0" />
      <path
        d="M8.2 14.6c-1.5 0-2.7-1.1-2.7-2.6 0-1.2.8-2.2 1.9-2.5.3-1.4 1.5-2.4 3-2.4 1 0 1.8.4 2.4 1.1.5-.4 1.2-.6 1.9-.6 1.6 0 2.9 1.3 2.9 2.9 0 .2 0 .4-.1.6 1 .3 1.7 1.2 1.7 2.3 0 1.3-1.1 2.4-2.4 2.4H8.2z"
        fill="#fff"
      />
    </svg>
  );
}

export function PipedriveIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Pipedrive">
      <rect width="24" height="24" rx="6" fill="#017737" />
      <text x="5" y="16.5" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">
        Pd
      </text>
    </svg>
  );
}

export function DynamicsIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Dynamics 365">
      <rect width="24" height="24" rx="6" fill="#0B53CE" />
      <path d="M6 17V8.2L12 6l6 2.2V17l-6 2.4L6 17z" fill="#7EB4FF" />
      <path d="M12 8.2v8.8l6-2.1V9.8L12 8.2z" fill="#fff" />
    </svg>
  );
}
