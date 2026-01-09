const FloatingAddButton = ({ setShowModal }) => {
  return (
    <button
      type="button"
      onClick={() => setShowModal(true)}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        border: "none",
        backgroundColor: "#111827",
        color: "#ffffff",
        fontSize: "32px",
        lineHeight: 1,
        cursor: "pointer",
        boxShadow: "0 12px 24px rgba(15, 23, 42, 0.25)",
      }}
      aria-label="Add item"
    >
      +
    </button>
  );
};

export default FloatingAddButton;
