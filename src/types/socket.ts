export type HavenlyEvents = {
  invite_sent: (payload: any) => void;
  data_updated: (payload: { entity: string }) => void;
  alert_fired: (payload: any) => void;
};
