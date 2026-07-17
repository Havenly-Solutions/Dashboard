import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Smartphone,
  Siren,
  Headset,
  MessagesSquare,
  Users,
  ShieldCheck,
  Wallet,
  Handshake,
  MessageCircle,
  Settings,
  Lock,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import type { NavModule } from "@/lib/rbac";

const ICON_MAP: Record<NavModule["icon"], LucideIcon> = {
  dashboard: LayoutDashboard,
  analytics: BarChart3,
  campaign: Megaphone,
  smartphone: Smartphone,
  emergency: Siren,
  "support-agent": Headset,
  forum: MessagesSquare,
  groups: Users,
  shield: ShieldCheck,
  payments: Wallet,
  handshake: Handshake,
  chat: MessageCircle,
  settings: Settings,
  lock: Lock,
  card: CreditCard,
};

export function NavIcon({ name, className }: { name: NavModule["icon"]; className?: string }) {
  const Icon = ICON_MAP[name];
  return <Icon className={className} strokeWidth={1.75} />;
}
