import { redirect } from "react-router-dom";

export async function logMeetingAction({ request }) {
  const formData = await request.formData(); // Get form data
  const data = Object.fromEntries(formData); // Convert to object
  console.log("LOGGED MEETING", data); // Log it (mock submission)

  // TODO: Save to local state, send to backend, or file

  return redirect("/meetings"); // Redirect user after submit
}