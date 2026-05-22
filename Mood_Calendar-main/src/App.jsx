import React, { useState, useEffect } from "react";
import Calendar from "./Calendar";
import AuthPage from "./AuthPage";
import "./index.css";
import suggestions from "./Suggestions.jsx";
import { getToken, getUser, setAuth, clearAuth, authFetch } from "./auth.js";

const App = () => {
  // ── Auth state ───────────────────────────────────────────────────────────
  const [token, setToken]   = useState(getToken());
  const [user, setUser]     = useState(getUser());

  // ── App state ────────────────────────────────────────────────────────────
  const [moodData, setMoodData]           = useState({});
  const [notes, setNotes]                 = useState({});
  const [darkMode, setDarkMode]           = useState(false);
  const [currentMonth, setCurrentMonth]   = useState(new Date().getMonth());
  const [currentYear, setCurrentYear]     = useState(new Date().getFullYear());
  const [monthlySuggestion, setMonthlySuggestion] = useState("");
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [viewingNote, setViewingNote]     = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteDate, setNewNoteDate]     = useState("");
  const [newNoteText, setNewNoteText]     = useState("");
  const [newNotePassword, setNewNotePassword] = useState("");

  // ── Load data when logged in ─────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    authFetch("/api/moods")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const moodMap = {};
        data.forEach((item) => { moodMap[item.dateKey] = item.mood; });
        setMoodData(moodMap);
      })
      .catch(() => {});

    authFetch("/api/notes")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const notesMap = {};
        data.forEach((item) => { notesMap[item.dateKey] = true; });
        setNotes(notesMap);
      })
      .catch(() => {});
  }, [token]);

  // ── Auth handlers ────────────────────────────────────────────────────────
  const handleLogin = (newToken, newUser) => {
    setAuth(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
    setMoodData({});
    setNotes({});
  };

  const handleLogout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
    setMoodData({});
    setNotes({});
    setMonthlySuggestion("");
    setSuggestionMessage("");
  };

  // ── Mood handler ─────────────────────────────────────────────────────────
  const handleSelectMood = async (day, mood) => {
    setMoodData((prev) => ({ ...prev, [day]: mood }));
    await authFetch("/api/mood", {
      method: "POST",
      body: JSON.stringify({ dateKey: day, mood }),
    });
  };

  // ── Note handlers ────────────────────────────────────────────────────────
  const handleAddNote = (day) => {
    setNewNoteDate(day);
    setNewNoteText("");
    setNewNotePassword("");
    setShowAddNoteModal(true);
  };

  const handleSubmitNote = async () => {
    if (!newNoteText || !newNotePassword) return;
    await authFetch("/api/note", {
      method: "POST",
      body: JSON.stringify({ dateKey: newNoteDate, note: newNoteText, password: newNotePassword }),
    });
    setNotes((prev) => ({ ...prev, [newNoteDate]: true }));
    setViewingNote({ date: newNoteDate, content: newNoteText });
    setShowNoteModal(true);
    setShowAddNoteModal(false);
  };

  const handleViewNote = async (day) => {
    const password = prompt("Enter password to view note:");
    if (!password) return;
    const res = await authFetch("/api/note/view", {
      method: "POST",
      body: JSON.stringify({ dateKey: day, password }),
    });
    const data = await res.json();
    setViewingNote({ date: day, content: res.ok ? data.note : (data.error || "Error retrieving note.") });
    setShowNoteModal(true);
  };

  // ── Month navigation ─────────────────────────────────────────────────────
  const handleMonthChange = (direction) => {
    const newDate = new Date(currentYear, currentMonth + direction, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
    setMonthlySuggestion("");
    setSuggestionMessage("");
  };

  // ── Monthly suggestion ───────────────────────────────────────────────────
  const getMostCommonMood = () => {
    const freq = {};
    Object.keys(moodData).forEach((key) => {
      const [y, m] = key.split("-").map(Number);
      if (y === currentYear && m === currentMonth + 1) {
        const label = moodData[key]?.label;
        if (label) freq[label] = (freq[label] || 0) + 1;
      }
    });
    let most = "", max = 0;
    for (const mood in freq) {
      if (freq[mood] > max) { most = mood; max = freq[mood]; }
    }
    return most;
  };

  const showMonthlySuggestion = () => {
    const now = new Date();
    const isPastMonth =
      currentYear < now.getFullYear() ||
      (currentYear === now.getFullYear() && currentMonth < now.getMonth());
    const isCurrentMonthEnded =
      currentYear === now.getFullYear() &&
      currentMonth === now.getMonth() &&
      now.getDate() === new Date(currentYear, currentMonth + 1, 0).getDate();

    if (isPastMonth || isCurrentMonthEnded) {
      const most = getMostCommonMood();
      if (most) {
        setMonthlySuggestion(`You mostly felt ${most} this month: ${suggestions[most]}`);
        setSuggestionMessage("");
      } else {
        setMonthlySuggestion("");
        setSuggestionMessage("No mood data for this month.");
      }
    } else {
      setMonthlySuggestion("");
      setSuggestionMessage("Monthly suggestion is available only after the month ends.");
    }
  };

  // ── Auth gate ────────────────────────────────────────────────────────────
  if (!token) return <AuthPage onLogin={handleLogin} />;

  // ── Main App ─────────────────────────────────────────────────────────────
  return (
    <div className={darkMode ? "app dark" : "app"}>
      <header>
        <h1>🧠 VibeVault</h1>
        <div className="header-right">
          <span className="welcome-text">👋 {user?.username}</span>
          <button className="mode-btn" onClick={() => setDarkMode((p) => !p)}>
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </header>

      <div className="month-nav">
        <button className="btn1" onClick={() => handleMonthChange(-1)}>⬅️ Prev</button>
        <span>
          {new Date(currentYear, currentMonth).toLocaleString("default", {
            month: "long", year: "numeric",
          })}
        </span>
        <button className="btn2" onClick={() => handleMonthChange(1)}>Next ➡️</button>
      </div>

      <Calendar
        moodData={moodData}
        notes={notes}
        onSelectMood={handleSelectMood}
        onAddNote={handleAddNote}
        onViewNote={handleViewNote}
        year={currentYear}
        month={currentMonth}
      />

      <div className="bottom-bar">
        <button className="monthview" onClick={showMonthlySuggestion}>
          📅 Monthly Suggestion
        </button>
        {suggestionMessage && <div className="info-message">{suggestionMessage}</div>}
        {monthlySuggestion && <div className="suggestion-box">{monthlySuggestion}</div>}
      </div>

      {/* View Note Modal */}
      {showNoteModal && viewingNote && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>📝 Note for {viewingNote.date}</h3>
            <p>{viewingNote.content}</p>
            <button onClick={() => setShowNoteModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Share your Feelings — {newNoteDate}</h3>
            <textarea
              rows="4"
              placeholder="Write your note here..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
            />
            <input
              type="password"
              placeholder="Set a password for this note"
              value={newNotePassword}
              onChange={(e) => setNewNotePassword(e.target.value)}
            />
            <button onClick={handleSubmitNote}>💾 Save Note</button>
            <button onClick={() => setShowAddNoteModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
