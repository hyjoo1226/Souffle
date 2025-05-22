import { useEffect } from "react";
import { UserProvider } from "@/contexts/UserContext";
import AppWithContext from "./AppWithContext"; // 따로 분리한 내부 App

function App() {
  useEffect(() => {
    const splash = document.getElementById("splash");
    if (splash) splash.remove();
  }, []);

  return (
    <UserProvider>
      <AppWithContext />
    </UserProvider>
  );
}

export default App;
