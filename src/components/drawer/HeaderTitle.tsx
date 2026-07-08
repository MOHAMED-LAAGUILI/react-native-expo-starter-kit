import { usePathname } from "expo-router";
import { useMemo } from "react";
import { Text } from "@/components/ui/Text";
import { useThemeColors } from "@/hooks/useThemeColor";

export function HeaderTitle() {
  const pathname = usePathname();
  const { text } = useThemeColors();

  const title = useMemo(() => {
    if (pathname.includes("/post/")) return "Post";
    const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    const currentSegment = segments.at(-1);

    switch (currentSegment) {
      case "features":
        return "Features";
      case "blank":
        return "Blank";
      case "search":
        return "Search";
      case "profile":
        return "Profile";
      case "settings":
        return "Settings";
      case "index":
      case "(tabs)":
      case "(app)":
      default:
        return "Home";
    }
  }, [pathname]);

  return (
    <Text
      variant="h3"
      style={{ color: text }}
    >
      {title}
    </Text>
  );
}
