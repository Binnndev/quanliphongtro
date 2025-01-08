import { Routes, Route } from "react-dom";
import { Home, Login } from "./containers/public";
import { path } from "./ultils/constant";
function app() {
  return (
    <div className="h-screen w-screen bg-primary">
      <Routes>
        <Route path={path.Home} element={<Home />} />
        <Route path={path.Login} element={<Login />} />
      </Routes>
    </div>
  );
}

export default app;
