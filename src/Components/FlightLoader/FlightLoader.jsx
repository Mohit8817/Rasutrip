import React from "react";

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(255, 255, 255)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
  },
  box: {
    background: "#fff",
    borderRadius: "8px",
    padding: "2rem 3rem",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid #ddd",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "#222",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#444",
    marginBottom: "1.5rem",
  },
  dotsWrapper: {
    display: "flex",
    justifyContent: "center",
    gap: "0.6rem",
  },
  dot: (color, delay) => ({
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    backgroundColor: color,
    animation: `bounce 1s infinite`,
    animationDelay: delay,
  }),
  keyframes: `
    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1.2);
        opacity: 1;
      }
    }
  `,
};

const FlightLoader = ({ message = "Please Wait...", subMessage = "We are looking for all available flights for you" }) => {
  return (
    <>
      <style>{styles.keyframes}</style>
      <div style={styles.overlay}>
        <div style={styles.box}>
          <div style={styles.title}>{message}</div>
          <div style={styles.subtitle}>{subMessage}</div>

          <div style={styles.dotsWrapper}>
            <div style={styles.dot("#5ca9ff", "0s")}></div>
            <div style={styles.dot("#a0a0a0", "0.2s")}></div>
            <div style={styles.dot("#f28b82", "0.4s")}></div>
            <div style={styles.dot("#6d6d6d", "0.6s")}></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlightLoader;
