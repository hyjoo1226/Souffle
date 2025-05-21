import { UserProvider } from "@/contexts/UserContext";
import AppWithContext from "./AppWithContext"; // 따로 분리한 내부 App

function App() {
  return (
    <UserProvider>
      <AppWithContext />
    </UserProvider>
  );
}

export default App;
