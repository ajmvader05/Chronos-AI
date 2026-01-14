import { useEffect, useMemo, useRef, useState } from "react";

const initialNotes = [
  {
    id: "note-1",
    anchorId: "anchor-1",
    text: "Clarify the requirements for the client onboarding timeline.",
  },
  {
    id: "note-2",
    anchorId: "anchor-2",
    text: "Add a link to the architectural diagram for this section.",
  },
  {
    id: "note-3",
    anchorId: "anchor-3",
    text: "Confirm the analytics milestones with the data team.",
  },
];

const docSections = [
  {
    id: "anchor-1",
    title: "01 / Kickoff",
    body:
      "Align on scope, confirm stakeholders, and capture the initial success metrics. Clarify the ideal cadence for status updates and define the decision-making workflow.",
  },
  {
    id: "anchor-2",
    title: "02 / Discovery",
    body:
      "Review existing artifacts, audit current metrics, and map the dependencies for implementation. Validate assumptions with the engineering and operations leads.",
  },
  {
    id: "anchor-3",
    title: "03 / Launch",
    body:
      "Finalize the release checklist, coordinate enablement, and publish the go-live communication. Capture feedback in the first two weeks and prioritize follow-ups.",
  },
];

const KamiAnnotationPanel = () => {
  const scrollRef = useRef(null);
  const anchorRefs = useRef({});
  const [notes, setNotes] = useState(initialNotes);
  const [activeAnchor, setActiveAnchor] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [anchorPositions, setAnchorPositions] = useState({});

  const noteByAnchor = useMemo(() => {
    const map = new Map();
    notes.forEach((note) => {
      map.set(note.anchorId, note);
    });
    return map;
  }, [notes]);

  const updateAnchorPositions = () => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const positions = {};
    Object.entries(anchorRefs.current).forEach(([anchorId, element]) => {
      if (!element) {
        return;
      }
      const anchorRect = element.getBoundingClientRect();
      positions[anchorId] = anchorRect.top - containerRect.top + container.scrollTop;
    });
    setAnchorPositions(positions);
  };

  useEffect(() => {
    updateAnchorPositions();
    const container = scrollRef.current;
    if (!container) {
      return undefined;
    }
    const handleScroll = () => updateAnchorPositions();
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    updateAnchorPositions();
  }, [notes]);

  const handleNoteHover = (anchorId) => {
    setActiveAnchor(anchorId);
  };

  const handleScrollToAnchor = (anchorId) => {
    const container = scrollRef.current;
    const anchorElement = anchorRefs.current[anchorId];
    if (!container || !anchorElement) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const anchorRect = anchorElement.getBoundingClientRect();
    const offset = anchorRect.top - containerRect.top + container.scrollTop - 80;
    container.scrollTo({ top: offset, behavior: "smooth" });
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setDraftText(note.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftText("");
  };

  const saveEditing = (noteId) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === noteId ? { ...note, text: draftText.trim() } : note))
    );
    setEditingId(null);
    setDraftText("");
  };

  const deleteNote = (noteId) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  return (
    <div className="annotation-shell">
      <div className="annotation-scroll" ref={scrollRef}>
        <div className="annotation-page">
          <div className="annotation-header">
            <p className="annotation-kicker">Proposal draft</p>
            <h2>Partnership rollout plan</h2>
            <p>
              The margin notes on the right are linked to each highlighted section. Hover to
              spotlight the anchor or click to jump directly to the referenced section.
            </p>
          </div>
          {docSections.map((section) => (
            <section
              key={section.id}
              ref={(element) => {
                anchorRefs.current[section.id] = element;
              }}
              id={section.id}
              className={
                activeAnchor === section.id
                  ? "annotation-section annotation-section--active"
                  : "annotation-section"
              }
              onMouseEnter={() => handleNoteHover(section.id)}
              onMouseLeave={() => handleNoteHover(null)}
            >
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        <aside className="annotation-panel" aria-label="Margin annotations">
          <div className="annotation-panel-header">
            <h4>Notes</h4>
            <span>{notes.length} linked</span>
          </div>
          <div className="annotation-note-stack">
            {notes.map((note) => (
              <div
                key={note.id}
                className={
                  activeAnchor === note.anchorId
                    ? "annotation-note annotation-note--active"
                    : "annotation-note"
                }
                style={{ top: anchorPositions[note.anchorId] || 0 }}
                onMouseEnter={() => handleNoteHover(note.anchorId)}
                onMouseLeave={() => handleNoteHover(null)}
              >
                <button
                  type="button"
                  className="annotation-anchor-button"
                  onClick={() => handleScrollToAnchor(note.anchorId)}
                >
                  <span className="annotation-line" aria-hidden="true" />
                  <span className="annotation-dot" aria-hidden="true" />
                </button>
                <div className="annotation-note-body">
                  <div className="annotation-note-title">
                    <span>Linked comment</span>
                    {noteByAnchor.get(note.anchorId) ? (
                      <button
                        type="button"
                        className="annotation-jump"
                        onClick={() => handleScrollToAnchor(note.anchorId)}
                      >
                        Jump
                      </button>
                    ) : null}
                  </div>
                  {editingId === note.id ? (
                    <div className="annotation-editor">
                      <textarea
                        value={draftText}
                        onChange={(event) => setDraftText(event.target.value)}
                        rows={3}
                      />
                      <div className="annotation-actions">
                        <button
                          type="button"
                          className="annotation-secondary"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </button>
                        <button type="button" onClick={() => saveEditing(note.id)}>
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>{note.text}</p>
                  )}
                  {editingId === note.id ? null : (
                    <div className="annotation-actions">
                      <button
                        type="button"
                        className="annotation-secondary"
                        onClick={() => startEditing(note)}
                      >
                        Edit
                      </button>
                      <button type="button" className="annotation-danger" onClick={() => deleteNote(note.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default KamiAnnotationPanel;
