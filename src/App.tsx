import { Button, Icon, Layout } from "@stellar/design-system";
import "./App.module.css";
import ConnectAccount from "./components/ConnectAccount.tsx";
import {
  Routes,
  Route,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Debugger from "./pages/Debugger.tsx";
import Test from "./pages/Test.tsx";
import BallsTokenPage from "./pages/contracts/BallsToken";
import StarsTokenPage from "./pages/contracts/StarsToken";
import TeaNftPage from "./pages/contracts/TeaNft";
import TeaGamePage from "./pages/contracts/TeaGame";

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      to: "/",
      label: "Home",
      match: (path: string) => path === "/",
    },
    {
      to: "/contracts/balls",
      label: "BALLS Token",
      match: (path: string) => path.startsWith("/contracts/balls"),
    },
    {
      to: "/contracts/stars",
      label: "STARS Token",
      match: (path: string) => path.startsWith("/contracts/stars"),
    },
    {
      to: "/contracts/tea-nft",
      label: "Tea NFT",
      match: (path: string) => path.startsWith("/contracts/tea-nft"),
    },
    {
      to: "/contracts/tea-game",
      label: "Tea Game",
      match: (path: string) => path.startsWith("/contracts/tea-game"),
    },
    {
      to: "/debug",
      label: "Debugger",
      icon: <Icon.Code02 size="md" />,
      match: (path: string) => path.startsWith("/debug"),
    },
  ];

  return (
    <main>
      <Layout.Header
        projectId="Stellar Tea"
        projectTitle="Stellar Tea"
        contentRight={
          <>
            <nav
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {navItems.map(({ to, label, icon, match }) => {
                const isActive = match(location.pathname);
                return (
                  <Button
                    key={to}
                    variant="tertiary"
                    size="md"
                    disabled={isActive}
                    onClick={() => {
                      if (!isActive) {
                        void navigate(to);
                      }
                    }}
                  >
                    {icon}
                    {icon ? (
                      <span style={{ marginLeft: "0.35rem" }}>{label}</span>
                    ) : (
                      label
                    )}
                  </Button>
                );
              })}
            </nav>
            <ConnectAccount />
          </>
        }
      />
      <Outlet />
      <Layout.Footer>
        <span>
          © {new Date().getFullYear()} Stellar Tea. Licensed under the{" "}
          <a
            href="http://www.apache.org/licenses/LICENSE-2.0"
            target="_blank"
            rel="noopener noreferrer"
          >
            Apache License, Version 2.0
          </a>
          .
        </span>
      </Layout.Footer>
    </main>
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
