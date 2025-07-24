import fs from 'fs/promises';
const filePath = './src/data/meetings.json';

export async function getAllMeetings() {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function addLoggedMeeting(newMeeting) {
  const data = await getAllMeetings();
  data.logged.push(newMeeting);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function addUpcomingMeeting(newMeeting) {
  const data = await getAllMeetings();
  data.upcoming.push(newMeeting);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
