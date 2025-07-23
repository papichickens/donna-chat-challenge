import { Form } from "react-router-dom";
import { logMeetingAction } from "../actions/logMeetingAction";

export const action = logMeetingAction;

export default function LogMeeting() {
  return (
    <div>
      <h2>Log a Meeting</h2>
      <Form method="post">
        <label>
          Who did you meet with? <textarea name="person" required />
        </label>
        <br />
        <label>
          What did you talk about? <textarea name="notes" required />
        </label>
        <br />
        <button type="submit">Submit</button>
      </Form>
    </div>
  );
}