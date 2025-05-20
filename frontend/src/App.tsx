import { useEffect, useState } from "react";
import { UserProvider } from "@/contexts/UserContext";
import AppWithContext from "./AppWithContext"; // 따로 분리한 내부 App
import Splash from "./components/common/Splash";

function App() {
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const timer = setTimeout(() => setLoading(false), 1200);
  //   return () => clearTimeout(timer);
  // }, []);

  // if (loading) {
  //   return <Splash />;
  // }
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
