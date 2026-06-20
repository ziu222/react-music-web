import { supabase } from "../supabase/supabase";

export const GRANT_DURATIONS = [
  { key: "7d",       label: "7 ngày",   days: 7 },
  { key: "1m",       label: "1 tháng",  days: 30 },
  { key: "3m",       label: "3 tháng",  days: 90 },
  { key: "lifetime", label: "Vĩnh viễn", days: null },
];

function durationLabel(days) {
  const dur = GRANT_DURATIONS.find(d => d.days === days);
  return dur?.label ?? (days ? `${days} ngày` : "Vĩnh viễn");
}

function fromGrantRow(r) {
  return {
    id:            r.id,
    userEmail:     r.user_email,
    grantedBy:     r.granted_by,
    plan:          r.plan,
    durationDays:  r.duration_days ?? null,
    durationLabel: durationLabel(r.duration_days),
    expiresAt:     r.expires_at ?? null,
    grantedAt:     r.granted_at,
    reason:        r.reason ?? "",
  };
}

function fromPromoRow(r) {
  return {
    code:          r.code,
    createdBy:     r.created_by,
    plan:          r.plan,
    durationDays:  r.duration_days ?? null,
    durationLabel: durationLabel(r.duration_days),
    maxUses:       r.max_uses,
    usedCount:     r.used_count,
    expiresAt:     r.expires_at ?? null,
    active:        r.active,
    createdAt:     r.created_at ?? null,
  };
}

// ── Grants ────────────────────────────────────────────────────

export async function grantPremium(adminEmail, targetEmail, durationKey, reason = "") {
  const dur = GRANT_DURATIONS.find(d => d.key === durationKey) ?? GRANT_DURATIONS[3];
  const now = new Date().toISOString();
  const expiresAt = dur.days ? new Date(Date.now() + dur.days * 864e5).toISOString() : null;
  const grant = {
    id:           "pg-" + Date.now(),
    user_email:   targetEmail.toLowerCase(),
    granted_by:   adminEmail,
    plan:         "premium",
    duration_days: dur.days,
    expires_at:   expiresAt,
    granted_at:   now,
    reason,
  };
  if (supabase) {
    const { error } = await supabase.from("premium_grants").insert(grant);
    if (error) console.error("[grantPremium]", error.message);
  }
  return { grant: fromGrantRow(grant), expiresAt };
}

export async function revokePremium(adminEmail, targetEmail) {
  const now = new Date().toISOString();
  const entry = {
    id:           "pg-" + Date.now(),
    user_email:   targetEmail.toLowerCase(),
    granted_by:   adminEmail,
    plan:         "free",
    duration_days: null,
    expires_at:   null,
    granted_at:   now,
    reason:       "revoked",
  };
  if (supabase) {
    const { error } = await supabase.from("premium_grants").insert(entry);
    if (error) console.error("[revokePremium]", error.message);
  }
  return fromGrantRow(entry);
}

export async function getGrantHistory(email) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("premium_grants")
    .select("*")
    .eq("user_email", email.toLowerCase())
    .order("granted_at", { ascending: false });
  if (error) return [];
  return (data || []).map(fromGrantRow);
}

export async function getActiveGrant(email) {
  if (!supabase) return null;
  const { data } = await supabase
    .from("premium_grants")
    .select("*")
    .eq("user_email", email.toLowerCase())
    .order("granted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data || data.plan !== "premium") return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  return fromGrantRow(data);
}

// ── Promo codes ───────────────────────────────────────────────

export async function loadPromoCodes() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data || []).map(fromPromoRow);
}

export async function createPromoCode(adminEmail, { durationKey = "1m", maxUses = 1, code }) {
  const dur = GRANT_DURATIONS.find(d => d.key === durationKey) ?? GRANT_DURATIONS[1];
  const promo = {
    code:          code || Math.random().toString(36).slice(2, 8).toUpperCase(),
    created_by:    adminEmail,
    plan:          "premium",
    duration_days: dur.days,
    max_uses:      maxUses,
    used_count:    0,
    expires_at:    null,
    active:        true,
  };
  if (supabase) {
    const { error } = await supabase.from("promo_codes").insert(promo);
    if (error) console.error("[createPromoCode]", error.message);
  }
  return fromPromoRow(promo);
}

export async function redeemPromoCode(code, userEmail) {
  if (!supabase) return { ok: false, error: "Không kết nối được" };
  const { data } = await supabase
    .from("promo_codes")
    .select("*")
    .ilike("code", code)
    .eq("active", true)
    .maybeSingle();
  if (!data) return { ok: false, error: "Mã không tồn tại hoặc đã hết hạn" };
  if (data.used_count >= data.max_uses) return { ok: false, error: "Mã đã được dùng hết" };

  const newCount = data.used_count + 1;
  const nowInactive = newCount >= data.max_uses;
  await supabase.from("promo_codes").update({ used_count: newCount, active: !nowInactive }).eq("code", data.code);

  const dur = GRANT_DURATIONS.find(d => d.days === data.duration_days);
  const result = await grantPremium(
    data.created_by,
    userEmail,
    dur?.key ?? "lifetime",
    "Promo code: " + data.code
  );
  return { ok: true, expiresAt: result.expiresAt, durationLabel: durationLabel(data.duration_days) };
}

export async function deactivatePromoCode(code) {
  if (supabase) {
    await supabase.from("promo_codes").update({ active: false }).eq("code", code);
  }
}
