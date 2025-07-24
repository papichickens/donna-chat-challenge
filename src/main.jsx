import React from "react";
import ReactDOM from "react-dom/client";
import {
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

import Root from "./routes/root";
import Meetings, { loader as meetingsLoader } from "./routes/meetings";
import LogMeeting, { action as logMeetingAction } from "./routes/logMeeting";
import Chat from "./routes/chat";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "meetings",
        element: <Meetings />,
        loader: meetingsLoader,
      },
      {
        path: "log",
        element: <LogMeeting />,
        action: logMeetingAction,
      },
      {
        path: "chat",
        element: <Chat />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);