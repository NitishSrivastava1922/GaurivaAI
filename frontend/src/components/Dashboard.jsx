import SideBar from "./SideBar.jsx";
import ChatArea from "./ChatArea.jsx";
import Artifact from "./Artifact.jsx";

function Dashboard() {
  return (
    <div className="h-screen w-screen flex bg-black text-white overflow-hidden">
      <SideBar />
      <ChatArea />
      <Artifact />
    </div>
  );
}

export default Dashboard;
