import { Outlet, Link } from "react-router-dom";

const Root = () => {
  return (
    <div>
      <h1>Donna Assistant</h1>
      <nav>
        <Link to="/chat">Chat</Link> | <Link to="/meetings">Meetings</Link> | <Link to="/log">Log Meeting</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

export default Root;
