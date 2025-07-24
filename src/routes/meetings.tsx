import { useLoaderData } from "react-router-dom";
import { useState } from "react";

export async function loader() {
  const response = await fetch("http://localhost:3001/upcoming-meetings");
  const data = await response.json();
  return data;
}

const Meetings = () => {
  const meetings = useLoaderData();
  const [formData, setFormData] = useState({
    with: "",
    company: "",
    topic: "",
    time: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isoTime = new Date(formData.time).toISOString();
    const meetingWithId = { ...formData, id: Date.now(), time: isoTime };

    await fetch("http://localhost:3001/add-upcoming-meeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meetingWithId),
    });

    window.location.reload(); // to refresh the updated list
  };

  return (
    <div>
      <h2>Upcoming Meetings</h2>
      <ul>
        {meetings.map((m) => {
          const formattedTime = new Date(m.time).toLocaleString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <li key={m.id}>
              {formattedTime} — {m.with} ({m.company}): {m.topic}
            </li>
          );
        })}
      </ul>

      <h3>Add New Meeting</h3>
      <form onSubmit={handleSubmit}>
        <label>
          With: <input name="with" value={formData.with} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Company: <input name="company" value={formData.company} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Topic: <input name="topic" value={formData.topic} onChange={handleChange} />
        </label>
        <br />
        <label>
          Time (ISO): <input name="time" type="datetime-local" value={formData.time} onChange={handleChange} required />
        </label>
        <br />
        <button type="submit">Add Meeting</button>
      </form>
    </div>
  );
};

export default Meetings;