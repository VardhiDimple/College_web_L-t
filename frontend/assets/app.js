// ==== API base (Render backend URL) ====
const API_BASE = "https://college-web-l-t.onrender.com/api";;

// ==== Storage keys ====
const STORAGE_AUTH_KEY  = "portal_auth";
const STORAGE_USERS_KEY = "portal_users";

// ================== AUTH HELPERS ==================

/**
 * Save auth info to localStorage and also track user in portal_users
 */
function saveAuth(rawToken, rawRole, rawEmail, rawName) {
  const token = rawToken || "";
  const role  = rawRole ;
  const email = rawEmail || "";

  // Derive a safe display name
  let name = rawName;
  if (!name) {
    if (email && email.includes("@")) {
      name = email.split("@")[0];
    } else if (email) {
      name = email;
    } else {
      name = "User";
    }
  }

  const data = { token, role, email, name };

  // store main auth
  try {
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving auth:", e);
  }

  // track known users for profiles / chat / attendance
  try {
    let users = [];
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    users = raw ? JSON.parse(raw) : [];

    if (email && !users.some((u) => u.email === email)) {
      users.push({ email, role, name });
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    }
  } catch (e) {
    console.error("Error saving known users:", e);
  }
}

/**
 * Read auth object {token, role, email, name} from localStorage
 */
function getAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Require that a user is logged in, and (optionally) has a specific role.
 * If not, quietly redirect to the right page. No annoying alert.
 *
 * Usage on pages:
 *   const auth = requireAuth("student");
 *   if (!auth) return;  // in case of redirect
 */
function requireAuth(expectedRole) {
  const auth = getAuth();

  // Not logged in at all → go to login
  if (!auth) {
    console.warn("No auth found, redirecting to login.");
    window.location.href = "index.html";
    return null;
  }

  // Logged in but wrong role → silently redirect
  if (expectedRole && auth.role !== expectedRole) {
    console.warn(
      "Wrong role for this page. Expected:",
      expectedRole,
      "got:",
      auth.role
    );

    if (auth.role === "student") {
      window.location.href = "student_dashboard.html";
    } else if (auth.role === "faculty") {
      window.location.href = "faculty_dashboard.html";
    } else {
      window.location.href = "index.html";
    }
    return null;
  }

  // Everything ok
  return auth;
}

/**
 * Headers including JWT token (for protected API routes)
 */
function getAuthHeaders() {
  const auth = getAuth();
  if (!auth || !auth.token) return {};
  return { Authorization: `Bearer ${auth.token}` };
}

/**
 * All known users (students + faculty) as stored in localStorage.
 * Used for attendance table, chat etc.
 */
function getKnownUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ================== SUBJECTS & LABELS ==================

/**
 * Central list of subjects → used in dropdowns & labels
 */
const SUBJECTS = [
  { code: "CSE101", name: "Python Programming" },
  { code: "CSE102", name: "Java Programming" },
  { code: "CSE103", name: "Database Systems" },
  { code: "IT202",  name: "Operating Systems" },
  { code: "ECE201", name: "Signals & Systems" },
  { code: "EEE301", name: "Power Systems" },
];

/**
 * Convert "CSE101" → "CSE101 - Python Programming"
 */
function subjectLabel(code) {
  const match = SUBJECTS.find((s) => s.code === code);
  return match ? `${code} - ${match.name}` : code;
}

// ================== GRADES & CGPA HELPERS ==================

const GRADE_POINTS = {
  O:  10,
  "A+": 9,
  A:  8,
  "B+": 7,
  B:  6,
  C:  5,
  D:  4,
  F:  0,
};

/**
 * Calculate CGPA from array of rows like:
 *   [{ grade: "A+", credits: 4 }, ...]
 */
function calculateCGPA(rows) {
  let totalCredits = 0;
  let totalPoints  = 0;

  rows.forEach((r) => {
    const gp = GRADE_POINTS[r.grade?.toUpperCase()] ?? null;
    const cr = Number(r.credits) || 0;
    if (gp !== null && cr > 0) {
      totalCredits += cr;
      totalPoints  += gp * cr;
    }
  });

  return totalCredits ? totalPoints / totalCredits : 0;
}

/**
 * Convert marks → grade based on percentage
 */
function gradeFromMarks(marks, maxMarks) {
  const mk = Number(marks);
  const mx = Number(maxMarks) || 100;
  if (isNaN(mk) || mx <= 0) return "F";

  const pct = (mk / mx) * 100;

  if (pct >= 90) return "O";
  if (pct >= 80) return "A+";
  if (pct >= 70) return "A";
  if (pct >= 60) return "B+";
  if (pct >= 50) return "B";
  if (pct >= 40) return "C";
  if (pct >= 35) return "D";
  return "F";
}

// ================== SIMPLE TOAST NOTIFICATIONS ==================

/**
 * Show a small floating toast bottom-right.
 * Usage: showToast("Attendance saved");
 */
function showToast(message) {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }

  const el = document.createElement("div");
  el.className = "toast-msg";
  el.textContent = message;
  stack.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 2500);
}
// ==== Chat helpers (localStorage based) ====
// ==== Chat helpers (localStorage based) ====
// Direct (1–1) messages
// ==== Chat helpers (localStorage based) ====
// Direct (1–1) messages
const CHAT_KEY = "portal_chat_messages";

// Channels / group chats
const CHAT_CHANNELS_KEY    = "portal_chat_channels";
const CHAT_CHANNEL_MSG_KEY = "portal_chat_channel_messages";

// ---------- DIRECT CHAT ----------

// Get all direct chat messages
function getChatMessages() {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save all direct chat messages
function saveChatMessages(list) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(list));
}

// Add a new direct message
function addChatMessage(fromEmail, toEmail, text) {
  const list = getChatMessages();
  const msg = {
    id: Date.now(),
    from: fromEmail,
    to: toEmail,
    text,
    ts: new Date().toISOString(),
    readBy: [fromEmail] // sender has read it
  };
  list.push(msg);
  saveChatMessages(list);
  return msg;
}

// Mark all direct messages *to this user* as read
function markMessagesReadFor(email) {
  const list = getChatMessages();
  let changed = false;
  list.forEach((m) => {
    if (m.to === email && !m.readBy.includes(email)) {
      m.readBy.push(email);
      changed = true;
    }
  });
  if (changed) saveChatMessages(list);
}

// Get count of unread direct messages for this user
function getUnreadCount(email) {
  const list = getChatMessages();
  return list.filter((m) => m.to === email && !m.readBy.includes(email)).length;
}

// ---------- CHANNELS (GROUP CHATS) ----------

function getChatChannels() {
  try {
    const raw = localStorage.getItem(CHAT_CHANNELS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChatChannels(list) {
  localStorage.setItem(CHAT_CHANNELS_KEY, JSON.stringify(list));
}

/**
 * Add a new channel.
 * membersEmails: array of student emails who are in this channel.
 */
function addChatChannel(name, createdByEmail, membersEmails) {
  const list = getChatChannels();
  const channel = {
    id: Date.now().toString(),
    name,
    createdBy: createdByEmail,
    createdAt: new Date().toISOString(),
    members: membersEmails || []
  };
  list.push(channel);
  saveChatChannels(list);
  return channel;
}

// Channel messages

function getChannelMessages() {
  try {
    const raw = localStorage.getItem(CHAT_CHANNEL_MSG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChannelMessages(list) {
  localStorage.setItem(CHAT_CHANNEL_MSG_KEY, JSON.stringify(list));
}

function addChannelMessage(channelId, fromEmail, text) {
  const list = getChannelMessages();
  const msg = {
    id: Date.now(),
    channelId,
    from: fromEmail,
    text,
    ts: new Date().toISOString(),
    readBy: [fromEmail]
  };
  list.push(msg);
  saveChannelMessages(list);
  return msg;
}
