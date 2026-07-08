import { type Href } from "expo-router";
import { FileQuestion, Home, Search, Settings, Sparkles, User } from "lucide-react-native";
import type { ComponentProps } from "react";

export type NavItem = {
  href: Href;
  icon: typeof Home;
  label: string;
  match: string[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/(app)/(tabs)" as Href,
    icon: Home,
    label: "Home",
    match: ["/", "/index"],
  },
  {
    href: "/(app)/(tabs)/search" as Href,
    icon: Search,
    label: "Search",
    match: ["/search"],
  },
  {
    href: "/(app)/(tabs)/profile" as Href,
    icon: User,
    label: "Profile",
    match: ["/profile"],
  },
  {
    href: "/(app)/(tabs)/settings" as Href,
    icon: Settings,
    label: "Settings",
    match: ["/settings"],
  },
  {
    href: "/(app)/features" as Href,
    icon: Sparkles,
    label: "Features",
    match: ["/features"],
  },
  {
    href: "/(app)/blank" as Href,
    icon: FileQuestion,
    label: "Blank",
    match: ["/blank"],
  },
];
