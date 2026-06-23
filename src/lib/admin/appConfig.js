import { supabase } from "../supabase/supabase";

// Đọc toàn bộ cờ cấu hình từ bảng app_config (sắp theo cột sort).
// Lỗi / thiếu supabase / rỗng -> trả mảng [] (không bao giờ throw).
export async function loadAppConfig() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("app_config")
      .select("*")
      .order("sort");
    if (error) return [];
    return (data || []).map((r) => ({
      key:         r.key,
      label:       r.label,
      description: r.description,
      enabled:     !!r.enabled,
      category:    r.category,
      sort:        r.sort,
    }));
  } catch {
    return [];
  }
}

// Chuyển danh sách cờ -> object tra cứu nhanh { [key]: enabled }.
// An toàn với mảng rỗng / null.
export function toConfigMap(list) {
  return (list || []).reduce((acc, r) => {
    acc[r.key] = r.enabled;
    return acc;
  }, {});
}

// Bật/tắt một cờ cấu hình theo key. Trả { error } (null nếu OK).
export async function setAppConfig(key, enabled) {
  if (!supabase) return { error: new Error("Supabase chưa sẵn sàng") };
  try {
    const { error } = await supabase
      .from("app_config")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("key", key);
    return { error: error || null };
  } catch (err) {
    return { error: err };
  }
}
