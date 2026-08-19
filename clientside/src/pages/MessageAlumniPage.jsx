import { useState } from "react";

const alumni = [
  { id: 1, name: "Carlyle, Elizabeth", email: "elizabeth.carlyle@example.com" },
  { id: 2, name: "DeWitt, Cooper", email: "cooper.dewitt@example.com" },
  { id: 3, name: "Edwards, Nathaniel", email: "nathaniel.edwards@example.com" },
  { id: 4, name: "Marr, Brian", email: "brian.marr@example.com" }
];

const templates = {
  "Donation Request": "Dear alumni,\n\nWe are reaching out to invite your support for our next school community project.",
  "Reunion Invitation": "Dear alumni,\n\nYou are warmly invited to our upcoming Rototuna alumni reunion.",
  "Community Update": "Dear alumni,\n\nHere is the latest update from the Rototuna alumni community."
};

function MessageAlumniPage() {
  const [selectedRecipients, setSelectedRecipients] = useState(alumni);
  const [template, setTemplate] = useState("Donation Request");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState(templates["Donation Request"]);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [attachment, setAttachment] = useState("");
  const [status, setStatus] = useState("");

  const removeRecipient = (recipientId) => {
    setSelectedRecipients((current) => current.filter(({ id }) => id !== recipientId));
  };

  const changeTemplate = (event) => {
    const nextTemplate = event.target.value;
    setTemplate(nextTemplate);
    setMessage(templates[nextTemplate]);
  };

  const handleSubmit = (event, action) => {
    event.preventDefault();
    setStatus(`${action} prepared for ${selectedRecipients.length} alumni.`);
  };

  return (
    <main className="message-alumni-page">
      <div className="message-alumni-header">
        <div>
          <p className="events-eyebrow">Alumni communications</p>
          <h1>Message Alumni</h1>
        </div>
        <button className="message-history-link" type="button" onClick={() => setStatus("Message history will appear here.")}>
          View message history
        </button>
      </div>

      <form className="message-composer" onSubmit={(event) => handleSubmit(event, "Message")}>
        <section className="recipient-section">
          <div className="recipient-heading">
            <h2>Sending message to:</h2>
            <span>{selectedRecipients.length} selected</span>
          </div>
          <div className="recipient-layout">
            <div className="recipient-list">
              {selectedRecipients.map((recipient) => (
                <span className="recipient-chip" key={recipient.id}>
                  {recipient.name}
                  <button type="button" aria-label={`Remove ${recipient.name}`} onClick={() => removeRecipient(recipient.id)}>
                    x
                  </button>
                </span>
              ))}
            </div>
            <div className="copy-fields">
              <input type="email" placeholder="CC" value={cc} onChange={(event) => setCc(event.target.value)} />
              <input type="email" placeholder="BCC" value={bcc} onChange={(event) => setBcc(event.target.value)} />
            </div>
          </div>
        </section>

        <div className="sender-fields">
          <input type="text" placeholder="Sender name" aria-label="Sender name" />
          <input type="email" placeholder="Sender email" aria-label="Sender email" />
        </div>

        <section className="compose-panel">
          <div className="compose-main">
            <label htmlFor="message-subject">Subject:</label>
            <input id="message-subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
            <label htmlFor="compose-message">Compose message:</label>
            <textarea id="compose-message" rows="9" value={message} onChange={(event) => setMessage(event.target.value)} />
          </div>
          <aside className="template-panel">
            <label htmlFor="message-template">Choose template</label>
            <select id="message-template" value={template} onChange={changeTemplate}>
              {Object.keys(templates).map((templateName) => (
                <option key={templateName}>{templateName}</option>
              ))}
            </select>
            <div className="template-actions">
              <button type="button" onClick={() => setMessage(templates[template])}>Edit</button>
              <button type="button" onClick={() => setStatus("Template download started.")}>Download</button>
            </div>
            <label className="attachment-button">
              Attach file +
              <input type="file" onChange={(event) => setAttachment(event.target.files?.[0]?.name || "")} />
            </label>
            {attachment && <span className="attachment-name">{attachment}</span>}
          </aside>
        </section>

        <section className="message-actions">
          <div className="schedule-fields">
            <label htmlFor="schedule-date">Schedule send date</label>
            <input id="schedule-date" type="datetime-local" value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} />
          </div>
          <div className="message-buttons">
            <button className="message-button cancel" type="button" onClick={() => setStatus("Draft cleared.")}>Cancel</button>
            <button className="message-button outline" type="button" onClick={(event) => handleSubmit(event, "Test send")}>Test send</button>
            <button className="message-button green" type="button" onClick={(event) => handleSubmit(event, "Draft")}>Save to drafts</button>
            <button className="message-button green" type="submit">Send to queue</button>
          </div>
        </section>
        {status && <p className="message-status" role="status">{status}</p>}
      </form>
    </main>
  );
}

export default MessageAlumniPage;
