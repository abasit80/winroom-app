const PARTICLES = [
  { left: "8%", top: "18%", size: 5, delay: "0s" },
  { left: "22%", top: "72%", size: 4, delay: "1.2s" },
  { left: "38%", top: "12%", size: 6, delay: "2.4s" },
  { left: "54%", top: "64%", size: 4, delay: "0.6s" },
  { left: "68%", top: "22%", size: 5, delay: "3.1s" },
  { left: "78%", top: "78%", size: 4, delay: "1.8s" },
  { left: "88%", top: "36%", size: 6, delay: "2.8s" },
  { left: "12%", top: "48%", size: 3, delay: "4s" },
  { left: "46%", top: "86%", size: 5, delay: "0.9s" },
  { left: "91%", top: "12%", size: 3, delay: "3.6s" },
];

export function PageFx() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="navy-glow absolute inset-0" />
      <div className="aurora absolute inset-0" />
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
      <div className="orb orb-d" />
      <div className="perspective-grid opacity-40" />
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="fx-spark"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
          }}
        />
      ))}
      <div className="fx-grain" />
    </div>
  );
}
