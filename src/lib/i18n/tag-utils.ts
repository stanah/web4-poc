import { useTranslations } from "next-intl";

export function useTagLabel() {
  const t = useTranslations("Tags");
  return (tag: string): string => {
    if (t.has(tag)) return t(tag);
    return tag;
  };
}
