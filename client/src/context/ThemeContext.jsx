import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(
        () => localStorage.getItem('theme') ?? 'light'
    );

    const [compareList, setCompareList] = useState(
        () => JSON.parse(localStorage.getItem('compareList') ?? '[]')
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }, [compareList]);

    const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

    const addToCompare = (slug) => setCompareList((list) => (
        list.includes(slug) ? list : [...list, slug]
    ));

    const removeFromCompare = (slug) => setCompareList((list) => list.filter((s) => s !== slug));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, compareList, addToCompare, removeFromCompare }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);