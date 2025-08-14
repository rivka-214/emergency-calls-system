// App.jsx
import { CallProvider } from "./contexts/CallContext";
import AppRouter from "./routes/Router"; // הנתיב החדש שלך


function App() {
  return (
   
      <CallProvider>
        <AppRouter />
      </CallProvider>
   
  );
}

export default App;
// import VolunteerCallWatcher from "./components/VolunteerCallWatcher"
// import CallPopupModal from "./components/CallPopupModal"
// import { CallProvider } from "./contexts/CallContext"
// import AppRouter from "./routes/Router"
// import { useState } from "react"
// import { respondToCall } from "./services/volunteer.service"

// function App() {
//   const [currentCall, setCurrentCall] = useState(null)

//   const handleRespondToCall = async (callId: string, response: string) => {
//     try {
//       await respondToCall(Number(callId), response as "going" | "cant")
//       setCurrentCall(null)
//     } catch (error) {
//       console.error("Failed to respond to call:", error)
//     }
//   }

//   return (
//     <CallProvider>
//       <VolunteerCallWatcher />
//       <CallPopupModal call={currentCall} onClose={() => setCurrentCall(null)} respondToCall={handleRespondToCall} />
//       <AppRouter />
//     </CallProvider>
//   )
// }

// export default App
