// ==== API base (use only if you wired backend) ====
const API_BASE = "http://localhost:4000/api"; // or leave as-is if not using

// ==== Auth + known users ====
const STORAGE_AUTH_KEY = "portal_auth";
const STORAGE_USERS_KEY = "portal_users";

function saveAuth(token, role, email, name) {
  const data = { token, role, email, name: name || email.split("@")[0] };
  localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(data));

  // track known users for profiles / chat / attendance
  let users = [];
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    users = raw ? JSON.parse(raw) : [];
  } catch {
    users = [];
  }

  if (!users.some((u) => u.email === email)) {
    users.push({ email, role, name: data.name });
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }
}

function getAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function requireAuth(expectedRole) {
  const auth = getAuth();
  if (!auth || (expectedRole && auth.role !== expectedRole)) {
    alert("Please login again.");
    window.location.href = "index.html";
  }
  return auth;
}

function getKnownUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// 🔹 NEW: helper to attach JWT token in API calls
function getAuthHeaders() {
  const auth = getAuth();
  if (!auth || !auth.token) return {};
  return {
    Authorization: "Bearer " + auth.token,
  };
}

// ==== Subjects list for dropdowns ====
const SUBJECTS = [
  { code: "CSE101", name: "Python Programming" },
  { code: "CSE102", name: "Java Programming" },
  { code: "CSE103", name: "Database Systems" },
  { code: "IT202",  name: "Operating Systems" },
  { code: "ECE201", name: "Signals & Systems" },
  { code: "EEE301", name: "Power Systems" }
];

// ==== Grades & CGPA helper ====
const GRADE_POINTS = {
  "O": 10,
  "A+": 9,
  "A": 8,
  "B+": 7,
  "B": 6,
  "C": 5,
  "D": 4,
  "F": 0
};

function calculateCGPA(rows) {
  let totalCredits = 0;
  let totalPoints = 0;
  rows.forEach((r) => {
    const gp = GRADE_POINTS[r.grade?.toUpperCase()] ?? null;
    const cr = Number(r.credits) || 0;
    if (gp !== null && cr > 0) {
      totalCredits += cr;
      totalPoints += gp * cr;
    }
  });
  return totalCredits ? totalPoints / totalCredits : 0;
}

// Convert marks → grade based on percentage
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
