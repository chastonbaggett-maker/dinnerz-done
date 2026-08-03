import {
  APP_LOAD_PREHIDE_STYLE_ID,
  buildAppLoadPrehideCss,
} from "@/lib/motion/app-load-prehide";
import type { AppLoadSpec } from "@/lib/motion/types";

export function AppLoadPrehideStyles({ appLoad }: { appLoad: AppLoadSpec }) {
  const css = buildAppLoadPrehideCss(appLoad);
  if (!css) return null;

  return (
    <style
      id={APP_LOAD_PREHIDE_STYLE_ID}
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
