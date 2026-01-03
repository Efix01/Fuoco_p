
import React, { useEffect, useState } from 'react';
import logocf from '../Logocf.svg';

interface WelcomeProps {
    onEnter: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onEnter }) => {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        // Reveal button after initial logo animation
        const timer = setTimeout(() => {
            setShowButton(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 h-dvh w-screen overflow-hidden z-[100] bg-slate-950 flex flex-col items-center justify-center p-4 animate-out fade-out duration-1000 fill-mode-forwards" style={{ animationPlayState: 'paused' }}>

            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[80px]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center space-y-8">
                {/* LOGO ANIMATION */}
                <div className="relative w-40 h-40 md:w-56 md:h-56 animate-in zoom-in-50 duration-1000 ease-out">
                    <img
                        src={logocf}
                        alt="CFVA Logo"
                        className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(249,115,22,0.3)] filter brightness-110"
                    />
                    {/* Ripple Effect Ring */}
                    <div className="absolute inset-0 rounded-full border border-orange-500/30 animate-ping opacity-20"></div>
                </div>

                {/* TEXT ANIMATION */}
                <div className="text-center space-y-2 animate-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                        CFVA
                    </h1>
                    <p className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 uppercase tracking-[0.2em]">
                        Fuoco Prescritto
                    </p>
                    <div className="h-0.5 w-12 bg-slate-700 mx-auto mt-4 rounded-full"></div>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest pt-2">
                        SISTEMA TATTICO GAUF V.1.0
                    </p>
                </div>

                {/* ENTER BUTTON with Fade In */}
                <div className={`transition-all duration-1000 ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <button
                        onClick={onEnter}
                        className="group relative px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Entra nel Sistema
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </button>
                </div>
            </div>

            {/* Footer Branding */}
            <div className="absolute bottom-8 text-center animate-in fade-in duration-1000 delay-700 fill-mode-both">
                <p className="text-sm text-slate-600 font-bold uppercase tracking-widest">
                    Regione Autonoma della Sardegna
                </p>
            </div>
        </div>
    );
};

export default Welcome;
