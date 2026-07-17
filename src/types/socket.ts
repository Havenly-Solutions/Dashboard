export type HavenlyEvents = {
  invite_sent: (payload: any) => void;
  invite_accepted: (payload: any) => void;
  team_member_removed: (payload: any) => void;
  role_changed: (payload: any) => void;
  user_logged_in: (payload: any) => void;
  intake_created: (payload: any) => void;
  data_updated: (payload: { entity: string }) => void;
  alert_fired: (payload: any) => void;
};
