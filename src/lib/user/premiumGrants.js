import { supabase } from "../supabase/supabase";

const STORE_KEY = "melodies_premium_grants";

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); }
  catch { return []; }
}

function saveStore(list) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }
  catch {}
}

function pushGrantToSupabase(grant) {
  if (!supabase) return;
  supabase.from("premium_grants").insert({
    id:           grant.id,
    user_email:   grant.userEmail,
    granted_by:   grant.grantedBy,
    plan:         grant.plan,
    duration_days: grant.durationDays ?? null,
    expires_at:   grant.expiresAt ?? null,
    granted_at:   grant.grantedAt,
    reason:       grant.reason ?? null,
  }).then().catch(() => {});
}

export const GRANT_DURATIONS = [
  { key: "7d",       label: "7 ngày",   days: 7 },
  { key: "1m",       label: "1 tháng",  days: 30 },
  { key: "3m",       label: "3 tháng",  days: 90 },
  { key: "lifetime", label: "Vĩnh viễn", days: null },
];

export function grantPremium(adminEmail, targetEmail, durationKey, reason = "") {
  const dur = GRANT_DURATIONS.find((d) => d.key === durationKey) ?? GRANT_DURATIONS[3];
  const now = new Date().toISOString();
  const expiresAt = dur.days ? new Date(Date.now() + dur.days * 864e5).toISOString() : null;
  const grant = {
    id: "pg-" + Date.now(),
    userEmail: targetEmail.toLowerCase(),
    grantedBy: adminEmail,
    plan: "premium",
    durationDays: dur.days,
    expiresAt,
    grantedAt: now,
    reason,
    durationLabel: dur.label,
  };
  const list = [grant, ...readStore().filter((g) => g.userEmail !== targetEmail.toLowerCase() || g.plan !== "premium")];
  saveStore(list);
  pushGrantToSupabase(grant);
  return { grant, expiresAt };
}

export function revokePremium(adminEmail, targetEmail) {
  const now = new Date().toISOString();
  const grant = {
    id: "pg-" + Date.now(),
    userEmail: targetEmail.toLowerCase(),
    grantedBy: adminEmail,
    plan: "free",
    durationDays: null,
    expiresAt: null,
    grantedAt: now,
    reason: "revoked",
    durationLabel: "—",
  };
  const list = [grant, ...readStore()];
  saveStore(list);
  return grant;
}

export function getGrantHistory(email) {
  return readStore().filter((g) => g.userEmail === email.toLowerCase());
}

export function getActiveGrant(email) {
  return readStore().find(
    (g) => g.userEmail === email.toLowerCase() && g.plan === "premium"
  ) ?? null;
}

// Promo codes — localStorage store
const PROMO_KEY = "melodies_promo_codes";

function readPromos() {
  try { return JSON.parse(localStorage.getItem(PROMO_KEY) || "[]"); }
  catch { return []; }
}
function savePromos(list) {
  try { localStorage.setItem(PROMO_KEY, JSON.stringify(list)); }
  catch {}
}

function syncPromoToSupabase(promo) {
  if (!supabase) return;
  supabase.from("promo_codes").upsert({
    code:         promo.code,
    created_by:   promo.createdBy,
    plan:         promo.plan,
    duration_days: promo.durationDays ?? null,
    max_uses:     promo.maxUses,
    used_count:   promo.usedCount,
    expires_at:   promo.expiresAt ?? null,
    active:       promo.active,
  }).then().catch(() => {});
}

export function createPromoCode(adminEmail, { durationKey = "1m", maxUses = 1, code }) {
  const dur = GRANT_DURATIONS.find((d) => d.key === durationKey) ?? GRANT_DURATIONS[1];
  const promo = {
    code: (code || Math.random().toString(36).slice(2, 8).toUpperCase()),
    createdBy: adminEmail,
    plan: "premium",
    durationDays: dur.days,
    durationLabel: dur.label,
    maxUses,
    usedCount: 0,
    expiresAt: null,
    active: true,
    createdAt: new Date().toISOString(),
  };
  const list = [promo, ...readPromos()];
  savePromos(list);
  syncPromoToSupabase(promo);
  return promo;
}

export function redeemPromoCode(code, userEmail) {
  const list = readPromos();
  const idx = list.findIndex((p) => p.code.toUpperCase() === code.toUpperCase() && p.active);
  if (idx === -1) return { ok: false, error: "Mã không tồn tại hoặc đã hết hạn" };
  const promo = list[idx];
  if (promo.usedCount >= promo.maxUses) return { ok: false, error: "Mã đã được dùng hết" };
  list[idx] = { ...promo, usedCount: promo.usedCount + 1, active: promo.usedCount + 1 < promo.maxUses };
  savePromos(list);
  syncPromoToSupabase(list[idx]);
  const result = grantPremium(promo.createdBy, userEmail, promo.durationDays ?
    (promo.durationDays === 7 ? "7d" : promo.durationDays === 30 ? "1m" : "3m") : "lifetime",
    "Promo code: " + promo.code);
  return { ok: true, expiresAt: result.expiresAt, durationLabel: promo.durationLabel };
}

export function loadPromoCodes() {
  return readPromos();
}

export function deactivatePromoCode(code) {
  const list = readPromos().map((p) => p.code === code ? { ...p, active: false } : p);
  savePromos(list);
  if (supabase) supabase.from("promo_codes").update({ active: false }).eq("code", code).then().catch(() => {});
}
