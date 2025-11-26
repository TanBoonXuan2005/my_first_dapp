import React, { useEffect, useState } from 'react';
import './Background.css';

const ASSETS = [
    '/assets/animation_frames/B-Cells/B-Cell_Idle(Neutral Form).png',
    '/assets/animation_frames/Flu Virus/Flu-virus.png',
    '/assets/animation_frames/Macrophage/Macrophage_Idle(Neutral).png'
];

const Background = () => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Generate random particles
        const particleCount = 15;
        const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
            id: i,
            src: ASSETS[Math.floor(Math.random() * ASSETS.length)],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: `${Math.random() * 60 + 40}px`, // 40px to 100px
            animationDuration: `${Math.random() * 20 + 10}s`, // 10s to 30s
            animationDelay: `${Math.random() * -30}s`, // Start at random times
            opacity: Math.random() * 0.15 + 0.05, // 0.05 to 0.2
            rotation: Math.random() * 360
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="dynamic-background">
            <div className="bg-overlay"></div>
            {particles.map((p) => (
                <img
                    key={p.id}
                    src={p.src}
                    className="bg-particle"
                    alt=""
                    style={{
                        left: p.left,
                        top: p.top,
                        width: p.size,
                        height: p.size,
                        opacity: p.opacity,
                        animationDuration: p.animationDuration,
                        animationDelay: p.animationDelay,
                        transform: `rotate(${p.rotation}deg)`
                    }}
                />
            ))}
        </div>
    );
};

export default Background;
