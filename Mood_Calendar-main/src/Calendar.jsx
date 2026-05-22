import React from "react";
import Day from "./Day";
import "./index.css";

const Calendar = ({ moodData, notes = {}, onSelectMood, onAddNote, onViewNote, year, month }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalSlots = firstDayIndex + daysInMonth;

  const weeks = [];

  for (let i = 0; i < totalSlots; i++) {
    const day = i - firstDayIndex + 1;
    const key = `${year}-${month + 1}-${day}`;

    if (i < firstDayIndex) {
      weeks.push(<div key={`empty-${i}`} className="day empty" />);
    } else {
      weeks.push(
        <Day
          key={key}
          day={day}
          mood={moodData[key]}
          hasNote={!!notes[key]}
          onSelectMood={(mood) => onSelectMood(key, mood)}
          onAddNote={() => onAddNote(key)}
          onViewNote={() => onViewNote(key)}
        />
      );
    }
  }

  return (
    <div className="calendar">
      <div className="weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="days-grid">{weeks}</div>
    </div>
  );
};

export default Calendar;
