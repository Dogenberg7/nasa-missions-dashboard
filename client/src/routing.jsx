import {createBrowserRouter} from "react-router-dom";
import Home from "./routes/Home/Home.jsx";
import Missions from "./routes/Missions/Missions.jsx";
import MissionDetail from "./routes/MissionDetail/MissionDetail.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home/>
    },
    {
        path: "/Missions",
        element: <Missions/>
    },
    {
        path: "/missions/:slug",
        element: <MissionDetail/>
    }
]);