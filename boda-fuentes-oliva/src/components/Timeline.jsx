import React, { useEffect, useRef, useState } from "react";
import "../styles/Timeline.css";
import "../styles/ScrollAnimations.css";

const events = [
  { time: "14:00", title: "Recepción", icon: "/icons/arco.png" },
  { time: "14:45", title: "Ceremonia", icon: "/icons/anillos.png" },
  { time: "15:20", title: "Fotos con los novios", icon: "/icons/camara.png" },
  { time: "15:45", title: "Brindis", icon: "/icons/brindis.png" },
  { time: "16:00", title: "Primer Baile", icon: "/icons/baile.png" },
  { time: "16:30", title: "Cena", icon: "/icons/cena.png" },
  { time: "17:30", title: "Pastel", icon: "/icons/pastel.png" },
  { time: "18:00", title: "Baile", icon: "/icons/bailando.png" },
  { time: "20:00", title: "Fin de la noche", icon: "/icons/atardecer.png" },
].sort((a, b) => {
  const timeA = a.time.split(':').map(Number);
  const timeB = b.time.split(':').map(Number);
  return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
});

const Timeline = () => {
  const [visibleItems, setVisibleItems] = useState(
    new Array(events.length).fill(true) // Empezar todos como visibles
  );
  const observerRefs = useRef([]);

  useEffect(() => {
    const observers = [];

    observerRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setVisibleItems((prev) => {
            const newVisible = [...prev];
            newVisible[index] = entry.isIntersecting;
            return newVisible;
          });
        },
        {
          threshold: 0.3,
          rootMargin: '-50px',
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <div className="timeline">
      <h2 className="timeline-title">Wedding Timeline</h2>
      <h3 className="timeline-subtitle">Majito y Pablo</h3>

      <div className="timeline-container">
        <div className="timeline-line"></div>
        {events.map((event, index) => (
          <div
            key={index}
            ref={(el) => (observerRefs.current[index] = el)}
            className={`timeline-event ${index % 2 === 0 ? "left" : "right"} timeline-item-animate ${
              visibleItems[index] ? "visible" : "hidden"
            }`}
            data-index={index}
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