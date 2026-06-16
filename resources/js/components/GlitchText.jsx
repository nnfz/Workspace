import React, { useState, useEffect } from 'react';

const SYMBOLS = '!<>-_\\\\/[]{}—=+*^?#_@';

export default function GlitchText({ text, className }) {
    const [displayText, setDisplayText] = useState(text);

    useEffect(() => {
        let timeoutId;
        let isMounted = true;

        const triggerGlitch = () => {
            if (!isMounted) return;

            // 40% chance to glitch at this tick
            if (Math.random() < 0.4) {
                const chars = text.split('');
                const numGlitches = Math.floor(Math.random() * 3) + 1; // 1 to 3 letters

                for (let i = 0; i < numGlitches; i++) {
                    const randIndex = Math.floor(Math.random() * chars.length);
                    const randSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                    if (chars[randIndex] !== ' ') {
                        chars[randIndex] = randSymbol;
                    }
                }

                setDisplayText(chars.join(''));

                // Revert back quickly (50ms - 150ms)
                setTimeout(() => {
                    if (isMounted) setDisplayText(text);
                }, 650 + Math.random() * 100);
            }

            // Schedule the next check (every 300ms - 2000ms)
            timeoutId = setTimeout(triggerGlitch, 300 + Math.random() * 1700);
        };

        triggerGlitch();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [text]);

    return <h1 className={className}>{displayText}</h1>;
}
