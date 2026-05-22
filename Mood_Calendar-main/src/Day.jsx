import React, { useState } from "react";
import "./index.css";

const moods = [
  { label: "Happy",    emoji: "😊", color: "#facc15" },
  { label: "Sad",      emoji: "😢", color: "#60a5fa" },
  { label: "Angry",    emoji: "😠", color: "#f87171" },
  { label: "Stressed", emoji: "😣", color: "#fb923c" },
  { label: "Excited",  emoji: "😄", color: "#34d399" },
  { label: "Tired",    emoji: "😴", color: "#a78bfa" },
  { label: "Neutral",  emoji: "😐", color: "#cbd5e1" },
];

const Day = ({ day, mood, hasNote, onSelectMood, onAddNote, onViewNote }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDayClick = (e) => {
    e.stopPropagation();
    setShowMenu(true);
  };

  const handleSelect = (m) => {
    onSelectMood({ label: m.label, color: m.color, emoji: m.emoji });
    setShowMenu(false);
  };

  return (
    <>
      <div
        className="day"
        onClick={handleDayClick}
        style={{ borderColor: mood ? mood.color : "#cbd5e1" }}
      >
        <div className="day-number">{day}</div>
        {mood && <div className="mood-label">{mood.emoji} {mood.label}</div>}
        {hasNote && <div className="has-note-dot" title="Has note" />}
      </div>

      {/* Mood picker — fullscreen overlay so it's ALWAYS fully visible */}
      {showMenu && (
        <div className="mood-picker-overlay" onClick={() => setShowMenu(false)}>
          <div className="mood-picker-panel" onClick={(e) => e.stopPropagation()}>
            <p className="mood-picker-title">How are you feeling?</p>
            <div className="mood-picker-grid">
              {moods.map((m) => (
                <button
                  key={m.label}
                  className="mood-picker-btn"
                  style={{ "--mood-color": m.color }}
                  onClick={() => handleSelect(m)}
                  title={m.label}
                >
                  <span className="mpb-emoji">{m.emoji}</span>
                  <span className="mpb-label">{m.label}</span>
                </button>
              ))}
            </div>
            <div className="mood-picker-actions">
              <button
                className="mpb-action"
                onClick={() => { onAddNote(); setShowMenu(false); }}
              >
                📝 Add Note
              </button>
              {hasNote && (
                <button
                  className="mpb-action"
                  onClick={() => { onViewNote(); setShowMenu(false); }}
                >
                  🔓 View Note
                </button>
              )}
              <button className="mpb-action mpb-cancel" onClick={() => setShowMenu(false)}>
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Day;
