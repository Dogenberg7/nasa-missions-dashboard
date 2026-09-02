import { createRoot } from 'react-dom/client';
import { StrictMode, Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routing";
import './index.css';

document.addEventListener('DOMContentLoaded', () => {
    document.body.innerHTML = '<div id="app"></div>';

    const root = createRoot(document.getElementById('app'));
    root.render(
        <StrictMode>
            <ThemeProvider>
                <Suspense fallback={<div/>}>
                    <RouterProvider router={router}/>
                </Suspense>
            </ThemeProvider>
        </StrictMode>
    );
});