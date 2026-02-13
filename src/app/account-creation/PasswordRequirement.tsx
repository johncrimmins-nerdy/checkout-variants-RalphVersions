/**
 * Password Requirement Item
 * Shows a single password requirement with animated validation
 */

interface PasswordRequirementProps {
  isMet: boolean;
  label: string;
}

export default function PasswordRequirement({ isMet, label }: PasswordRequirementProps) {
  return (
    <div
      className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
        isMet ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
      }`}
      style={{ transitionProperty: 'max-height, opacity' }}
    >
      {isMet ? (
        <svg
          className="h-4 w-4 flex-shrink-0 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      ) : (
        <svg
          className="h-4 w-4 flex-shrink-0 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M6 18L18 6M6 6l12 12"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      )}
      <span className={isMet ? 'text-green-600' : 'text-gray-600'}>{label}</span>
    </div>
  );
}
