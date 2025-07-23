import { useLoaderData } from "react-router-dom";
import { getSampleMeetings } from "../utils/models";

export function loader() {
  return getSampleMeetings();
}

const  Meetings= () => {
  const meetings = useLoaderData();
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
    </div>
  );
}

export default Meetings;