const admin = require("firebase-admin");
const { onUserCreated, onUserDeleted } = require("firebase-functions/v2/identity");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

admin.initializeApp();

const db = admin.firestore();
const ADMIN_USERS_COLLECTION = "admin_users";
const SYSTEM_ROOT_ADMIN_USERNAME = "admin";

function normalizeUsernameFromEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase()
    .split("@")[0];
}

function buildBaseProfile(userRecord, username) {
  const now = new Date().toISOString();
  const isRootAdmin = username === SYSTEM_ROOT_ADMIN_USERNAME;

  return {
    username,
    email: userRecord.email || `${username}@sotay.com`,
    displayName: userRecord.displayName || username,
    role: isRootAdmin ? "super_admin" : "editor",
    isActive: true,
    authUid: userRecord.uid,
    authProviderIds: (userRecord.providerData || []).map((item) => item.providerId).filter(Boolean),
    authEmailVerified: !!userRecord.emailVerified,
    authDisabled: !!userRecord.disabled,
    syncSource: "firebase_auth_sync",
    syncStatus: "synced",
    syncedAt: now,
    lastLoginAt: null,
    updatedAt: now,
    updatedBy: "firebase_auth_sync"
  };
}

async function upsertAdminProfileFromAuth(userRecord, options = {}) {
  if (!userRecord || !userRecord.email) {
    logger.warn("Skip sync because auth user has no email.", { uid: userRecord ? userRecord.uid : null });
    return;
  }

  const username = normalizeUsernameFromEmail(userRecord.email);
  const ref = db.collection(ADMIN_USERS_COLLECTION).doc(username);
  const snapshot = await ref.get();
  const existing = snapshot.exists ? snapshot.data() : {};
  const base = buildBaseProfile(userRecord, username);
  const isRootAdmin = username === SYSTEM_ROOT_ADMIN_USERNAME;

  const payload = {
    ...base,
    createdAt: existing.createdAt || base.updatedAt,
    createdBy: existing.createdBy || (isRootAdmin ? SYSTEM_ROOT_ADMIN_USERNAME : "firebase_auth_sync"),
    displayName: existing.displayName || base.displayName,
    role: isRootAdmin ? "super_admin" : (existing.role || "editor"),
    isActive: isRootAdmin ? true : (typeof existing.isActive === "boolean" ? existing.isActive : true),
    lastLoginAt: existing.lastLoginAt || null
  };

  if (options.markDeleted) {
    payload.isActive = false;
    payload.authDeleted = true;
    payload.syncStatus = "auth_deleted";
  }

  await ref.set(payload, { merge: true });
  logger.info("Synced admin profile from Firebase Auth.", { username, uid: userRecord.uid, markDeleted: !!options.markDeleted });
}

exports.syncAdminProfileOnAuthCreate = onUserCreated(async (event) => {
  await upsertAdminProfileFromAuth(event.data);
});

exports.markAdminProfileOnAuthDelete = onUserDeleted(async (event) => {
  await upsertAdminProfileFromAuth(event.data, { markDeleted: true });
});

exports.syncFirebaseAuthUsersToAdminProfiles = onRequest(async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const expectedToken = process.env.SYNC_ADMIN_TOKEN || "";

    if (!expectedToken) {
      res.status(500).json({ ok: false, error: "Missing SYNC_ADMIN_TOKEN environment variable." });
      return;
    }

    if (!bearerToken || bearerToken !== expectedToken) {
      res.status(401).json({ ok: false, error: "Unauthorized." });
      return;
    }

    let nextPageToken;
    let synced = 0;

    do {
      const page = await admin.auth().listUsers(1000, nextPageToken);
      for (const user of page.users) {
        await upsertAdminProfileFromAuth(user);
        synced += 1;
      }
      nextPageToken = page.pageToken;
    } while (nextPageToken);

    res.status(200).json({ ok: true, synced });
  } catch (error) {
    logger.error("Failed to sync Firebase Auth users to admin_users.", error);
    res.status(500).json({ ok: false, error: error && error.message ? error.message : String(error) });
  }
});
