export type Theme = "light" | "dark";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  theme: Theme;
}
