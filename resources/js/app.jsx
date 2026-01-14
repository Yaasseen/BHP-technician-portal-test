import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import Login from "./Pages/Auth/Login";
import axios from "axios";
import { Spin } from "antd";
import { ScheduleProvider } from "./context/ScheduleContext";

function App() {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const response = await axios.get("/user");
            console.log(response);

            if (response.status != 200) {
                throw new Error("Failed to fetch data");
            }
            setUser(response.data);
            Object.keys(response.data).length == 0
                ? setIsLoggedIn(false)
                : setIsLoggedIn(true);
        } catch (error) {
            if (error.status && error.status == 401) {
                setIsLoggedIn(false);
            } else {
                console.log(error);
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <div className="text-center text-lg font-semibold">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div>
            {isLoggedIn ? (
                <HomePage onLoggedOut={() => fetchData()} user={user} />
            ) : (
                <Login onLoggedIn={() => fetchData()} />
            )}
        </div>
    );
}

export default App;

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(
    <ScheduleProvider>
        <App />
    </ScheduleProvider>
);
