import { Routes, Route, Outlet } from "react-router-dom";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import Home from "./pages/Home";
import Debugger from "./pages/Debugger";
import Test from "./pages/Test";
import BallsTokenPage from "./pages/contracts/BallsToken";
import StarsTokenPage from "./pages/contracts/StarsToken";
import TeaNftPage from "./pages/contracts/TeaNft";
import TeaGamePage from "./pages/contracts/TeaGame";

const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/contracts/balls" element={<BallsTokenPage />} />
        <Route path="/contracts/stars" element={<StarsTokenPage />} />
        <Route path="/contracts/tea-nft" element={<TeaNftPage />} />
        <Route path="/contracts/tea-game" element={<TeaGamePage />} />
        <Route path="/debug" element={<Debugger />} />
        <Route path="/debug/:contractName" element={<Debugger />} />
        <Route path="/test" element={<Test />} />
      </Route>
    </Routes>
  );
}

export default App;
