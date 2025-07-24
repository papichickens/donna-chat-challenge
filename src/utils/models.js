// models.js — Define structured meeting types and AI preparation functions

/**
 * @typedef {Object} Meeting
 * @property {number} id - Unique meeting identifier
 * @property {string} time - ISO 8601 timestamp
 * @property {string} with - Person you are meeting with
 * @property {string} company - Company name
 * @property {string} topic - Topic of discussion
 */

/**
 * @typedef {Object} LoggedMeeting
 * @property {string} person - Person you met with
 * @property {string} notes - Summary of discussion
 * @property {string} timestamp - ISO 8601 log timestamp
 */

/**
 * Creates a sample Meeting array (hardcoded meetings)
 * @returns {Meeting[]}
 */
export function getSampleMeetings() {
  return [
    {
      id: 1,
      time: "2025-07-18T14:00:00Z",
      with: "John Doe",
      company: "Corp Corp",
      topic: "Exploring Donna for sales enablement",
    },
    {
      id: 2,
      time: "2025-07-18T16:00:00Z",
      with: "Jane Smith",
      company: "Biz Inc.",
      topic: "Demo scheduling",
    },
  ];
}

// /**
//  * Prepares a LoggedMeeting object from form input
//  * @param {FormData} formData
//  * @returns {LoggedMeeting}
//  */
// export function parseLoggedMeeting(formData) {
//   return {
//     person: formData.get("person"),
//     notes: formData.get("notes"),
//     timestamp: new Date().toISOString(),
//   };
// }

// /**
//  * Converts meeting data into a prompt-friendly string for LLM
//  * @param {LoggedMeeting} loggedMeeting
//  * @returns {string} Prompt string for AI
//  */
// export function formatLoggedMeetingForAI(loggedMeeting) {
//   return `Meeting Log:\n
// - Person: ${loggedMeeting.person}
// - Notes: ${loggedMeeting.notes}
// - Logged At: ${loggedMeeting.timestamp}`;
// }

// /**
//  * Converts a Meeting object into a user-facing chat response
//  * @param {Meeting} meeting
//  * @returns {string} Chat response
//  */
// export function generateMeetingSummary(meeting) {
//   const localTime = new Date(meeting.time).toLocaleString();
//   return `You have a meeting at ${localTime} with ${meeting.with} from ${meeting.company} about "${meeting.topic}".`;
// }