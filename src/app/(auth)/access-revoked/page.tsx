import { ShieldOff } from "lucide-react";

export default function AccessRevokedPage() {
  return (
    <div>
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-error-container text-error">
        <ShieldOff className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h1 className="text-display-lg text-on-surface">Access revoked</h1>
      <p className="mt-1.5 text-body-base text-on-surface-variant">
        This account no longer has access to Havenly Solutions. If you believe this is a mistake,
        contact your Founder or Admin directly.
      </p>
    </div>
  );
}
