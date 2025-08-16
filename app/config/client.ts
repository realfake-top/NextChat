import { BuildConfig, getBuildConfig } from "./build";

// 你要的“硬默认值”
const DEFAULTS = {
  model: "gpt-5-nano-2025-08-07:free",
  baseUrl: "https://api.poixe.com",
} as const;

// 统一做一次“合并 + 清洗”
function withDefaults(cfg: Partial<BuildConfig> | undefined): BuildConfig {
  const merged = {
    ...DEFAULTS,
    ...(cfg ?? {}),
  } as BuildConfig;

  // 规范化 baseUrl：去掉末尾多余的斜杠
  if (typeof (merged as any).baseUrl === "string") {
    (merged as any).baseUrl = (merged as any).baseUrl.replace(/\/+$/, "");
  }

  return merged;
}

export function getClientConfig(): BuildConfig {
  if (typeof document !== "undefined") {
    // client side：从 <meta name="config"> 读取
    const raw = queryMeta("config") || "{}";
    let parsed: Partial<BuildConfig> | undefined;
    try {
      parsed = JSON.parse(raw) as Partial<BuildConfig>;
    } catch {
      parsed = undefined;
    }
    return withDefaults(parsed);
  }

  if (typeof process !== "undefined") {
    // server side：从构建配置读取
    const serverCfg = getBuildConfig();
    return withDefaults(serverCfg);
  }

  // 极端兜底（很少触发）
  return withDefaults(undefined);
}

function queryMeta(key: string, defaultValue?: string): string {
  let ret: string;
  if (typeof document !== "undefined") {
    const meta = document.head.querySelector(
      `meta[name='${key}']`,
    ) as HTMLMetaElement | null;
    ret = meta?.content ?? "";
  } else {
    ret = defaultValue ?? "";
  }
  return ret;
}
