import React from "react";
import "../styles/Timeline.css";

const events = [
  { time: "14:00", title: "Recepción", icon: "src/assets/arco.png" },
  { time: "14:45", title: "Ceremonia", icon: "src/assets/anillos.png" },
  { time: "15:20", title: "Fotos con los novios", icon: "src/assets/camara.png" },
  { time: "15:45", title: "Brindis", icon: "src/assets/brindis.png" },
  { time: "16:00", title: "Primer Baile", icon: "src/assets/baile.png" },
  { time: "16:30", title: "Cena", icon: "src/assets/cena.png" },
  { time: "17:30", title: "Pastel", icon: "src/assets/pastel.png" },
  { time: "18:00", title: "Baile", icon: "src/assets/bailando.png" },
  { time: "20:00", title: "Fin de la noche", icon: "src/assets/atardecer.png" },
].sort((a, b) => {
  const timeA = a.time.split(':').map(Number);
  const timeB = b.time.split(':').map(Number);
  return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
});

const Timeline = () => {
  return (
    <div className="timeline">
      <h2 className="timeline-title">Wedding Timeline</h2>
      <h3 className="timeline-subtitle">Majito y Pablo</h3>

      <div className="timeline-container">
        <div className="timeline-line"></div>
        {events.map((event, index) => (
          <div
            key={index}
            className={`timeline-event ${index % 2 === 0 ? "left" : "right"}`}
          >
            <div className="event-content">
              <div className="event-time">{event.time}</div>
              <div className="event-icon">
                <img src={event.icon} alt={event.title} className="icon-image" />
              </div>
              <div className="event-title">{event.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;