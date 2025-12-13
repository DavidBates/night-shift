import React, { useRef, useState, useEffect } from 'react';
import { Lock, Unlock, Lightbulb, ChevronLeft, ChevronRight, Flashlight, KeyRound } from 'lucide-react';
import { AnimatronicsState, PlaySoundFunction } from '../types';

interface OfficeProps {
    leftDoorClosed: boolean;
    rightDoorClosed: boolean;
    leftLightOn: boolean;
    rightLightOn: boolean;
    toggleDoor: (side: 'left' | 'right') => void;
    toggleLight: (side: 'left' | 'right') => void;
    animatronics: AnimatronicsState;
    isSettingsOpen: boolean;
    cameraOpen: boolean;
    playSound: PlaySoundFunction;
}

const AnimatronicAtDoor: React.FC<{ type: 'blue' | 'red' }> = ({ type }) => (
    <div className={`absolute w-40 h-80 z-10 flex flex-col items-center justify-center animate-in zoom-in duration-75 ${type === 'blue' ? 'right-[-80px]' : 'left-[-80px]'}`} style={{ top: '30%' }}>
        <div className={`w-32 h-32 rounded-full mb-4 flex items-center justify-center gap-6 ${type === 'blue' ? 'bg-blue-950 shadow-[0_0_50px_blue]' : 'bg-red-950 shadow-[0_0_50px_red]'}`}>
            <div className={`w-4 h-4 rounded-full shadow-[0_0_20px_white] ${type === 'blue' ? 'bg-white' : 'bg-yellow-400'}`}></div>
            <div className={`w-4 h-4 rounded-full shadow-[0_0_20px_white] ${type === 'blue' ? 'bg-white' : 'bg-yellow-400'}`}></div>
        </div>
        <div className="w-48 h-64 bg-black rounded-t-3xl opacity-90"></div>
    </div>
);

export const Office: React.FC<OfficeProps> = ({
    leftDoorClosed,
    rightDoorClosed,
    leftLightOn,
    rightLightOn,
    toggleDoor,
    toggleLight,
    animatronics,
    isSettingsOpen,
    cameraOpen,
    playSound
}) => {
    const officeRef = useRef<HTMLDivElement>(null);
    const [panTarget, setPanTarget] = useState<number | null>(null); // 0 (left) to 1 (right)

    // Fidget States
    const [flashlightOn, setFlashlightOn] = useState(false);
    const [keysJiggling, setKeysJiggling] = useState(false);

    // Mouse Move Logic (Desktop)
    const handleMouseMove = (e: React.MouseEvent) => {
        if (window.matchMedia('(pointer: coarse)').matches) return; // Disable on touch devices
        if (!cameraOpen && officeRef.current && !isSettingsOpen) {
            const width = window.innerWidth;
            const x = e.clientX;
            const percentage = x / width;
            updatePan(percentage);
        }
    };

    const updatePan = (percentage: number) => {
        if (officeRef.current) {
            const width = window.innerWidth;
            const maxShift = width * 0.25; // 25vw hidden
            const shift = -(percentage * maxShift);
            officeRef.current.style.transform = `translateX(${shift}px)`;
        }
    };

    // Touch Logic (Swipe)
    const touchStart = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStart.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStart.current === null) return;

        const currentX = e.touches[0].clientX;
        const diff = touchStart.current - currentX;

        // Sensitivity threshold
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Swiped Left -> Go Right
                setPanTarget(1);
            } else {
                // Swiped Right -> Go Left
                setPanTarget(0);
            }
            touchStart.current = null; // Reset
        }
    };

    const toggleFlashlight = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        playSound('flashlight');
        setFlashlightOn(!flashlightOn);
    };

    const jiggleKeys = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        if (keysJiggling) return;
        playSound('keys');
        setKeysJiggling(true);
        setTimeout(() => setKeysJiggling(false), 500);
    };

    return (
        <div
            className="w-full h-full relative"
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
        >
            <div
                ref={officeRef}
                className="w-[125vw] h-full flex relative will-change-transform transition-transform duration-300 ease-out"
                style={{ transform: 'translateX(-12.5vw)' }}
            >

                {/* --- Left Door Area --- */}
                <div className="w-[20vw] h-full bg-neutral-900 border-r border-neutral-800 relative flex flex-col justify-center items-center shadow-[10px_0_50px_black]">
                    <div className={`absolute inset-0 bg-black transition-all duration-100 ${leftDoorClosed ? 'h-full opacity-100 z-20' : 'h-0 opacity-0'}`} style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1a1a1a 0, #1a1a1a 10px, #0f0f0f 10px, #0f0f0f 20px)' }}></div>

                    {/* Light Effect */}
                    <div className={`absolute right-[-100px] top-0 bottom-0 w-64 pointer-events-none transition-opacity duration-75 ${leftLightOn ? 'opacity-30 bg-yellow-100 mix-blend-overlay' : 'opacity-0'}`}></div>

                    {/* ENEMY REVEAL */}
                    {leftLightOn && animatronics.blue.location === 7 && <AnimatronicAtDoor type="blue" />}

                    {/* Buttons */}
                    <div className="z-30 flex flex-col gap-6 bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-2xl scale-75 md:scale-110">
                        <button
                            onPointerDown={(e) => { e.preventDefault(); toggleDoor('left'); }}
                            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all active:scale-95 ${leftDoorClosed ? 'bg-red-900 border-red-500 text-red-100' : 'bg-green-900 border-green-600 text-green-100'}`}
                        >
                            {leftDoorClosed ? <Lock size={32} /> : <Unlock size={32} />}
                        </button>
                        <button
                            onPointerDown={(e) => { e.preventDefault(); toggleLight('left'); }}
                            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all active:scale-95 ${leftLightOn ? 'bg-yellow-200 border-white text-yellow-900 shadow-[0_0_20px_yellow]' : 'bg-slate-700 border-slate-500 text-slate-400'}`}
                        >
                            <Lightbulb size={32} />
                        </button>
                    </div>
                </div>

                {/* --- Main Desk --- */}
                <div className="flex-1 relative flex flex-col items-center justify-end pb-0 bg-gradient-to-b from-slate-900/50 to-black overflow-hidden">
                    {/* Dark Hallway Perspective */}
                    <div className="absolute inset-0 flex pointer-events-none">
                        <div className="flex-1 bg-gradient-to-r from-black via-transparent to-transparent opacity-90"></div>
                        <div className="flex-1 bg-gradient-to-l from-black via-transparent to-transparent opacity-90"></div>
                    </div>

                    {/* Flashlight Spot Effect on Back Wall */}
                    {flashlightOn && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-white/10 blur-3xl rounded-full pointer-events-none animate-pulse mix-blend-overlay"></div>
                    )}
                    {flashlightOn && (
                        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-100/20 blur-xl rounded-full pointer-events-none mix-blend-screen"></div>
                    )}

                    {/* Fan & Decorations */}
                    <div className="w-[95%] md:w-full max-w-5xl h-48 md:h-64 bg-slate-800 rounded-t-[40px] md:rounded-t-[150px] border-t-4 md:border-t-8 border-slate-700 shadow-2xl relative z-10 flex justify-center items-center">
                        {/* Desk Texture Gradient */}
                        <div className="absolute inset-0 rounded-t-[40px] md:rounded-t-[150px] bg-gradient-to-b from-slate-700/50 to-slate-900/80 pointer-events-none"></div>

                        {/* Poster on Wall (Replaces Celebrate) */}
                        <div className="absolute -top-48 md:-top-80 left-1/4 w-32 md:w-48 h-48 md:h-72 rotate-[-5deg] flex items-center justify-center transition-opacity duration-300" style={{ opacity: flashlightOn ? 0.9 : 0.05 }}>
                            <img
                                src="./media/fnaf_celebrate.png"
                                alt="Celebrate Poster"
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </div>

                        <div className="absolute -top-8 md:-top-12 left-28 md:left-32 w-24 md:w-40 h-16 md:h-32 bg-slate-900 rounded-lg transform -skew-x-12 border border-slate-600 flex items-center justify-center shadow-lg">
                            <div className="text-slate-500 text-[8px] md:text-xs text-center p-1 md:p-2 leading-relaxed font-mono">
                                SECURITY<br />PROTOCOL<br />MANUAL
                            </div>
                        </div>

                        {/* Fidget: Flashlight */}
                        <div
                            className="absolute -top-6 md:-top-12 right-24 md:right-1/3 cursor-pointer group transform rotate-12 active:scale-95 transition-transform z-20"
                            onPointerDown={toggleFlashlight}
                        >
                            <div className={`w-24 md:w-32 h-6 md:h-8 rounded-full shadow-lg flex items-center border border-slate-900 ${flashlightOn ? 'bg-slate-600' : 'bg-slate-700'}`}>
                                <div className={`w-6 md:w-8 h-6 md:h-8 rounded-full border-2 border-slate-600 ${flashlightOn ? 'bg-yellow-200 shadow-[0_0_15px_yellow]' : 'bg-slate-800'}`}></div>
                                <div className="flex-1"></div>
                                <div className="w-2 h-4 bg-slate-900 rounded-sm mr-4"></div>
                            </div>
                        </div>

                        {/* Fidget: Keys */}
                        <div
                            className={`absolute bottom-16 md:bottom-32 right-8 md:right-1/4 cursor-pointer p-4 group transition-transform z-20 ${keysJiggling ? 'animate-bounce' : 'hover:scale-105'}`}
                            onPointerDown={jiggleKeys}
                        >
                            <div className="relative">
                                <KeyRound className="text-yellow-600 w-10 md:w-12 h-10 md:h-12 transform -rotate-45 drop-shadow-lg" strokeWidth={1.5} />
                                <KeyRound className="text-yellow-700 w-10 md:w-12 h-10 md:h-12 absolute top-2 left-2 transform -rotate-12 drop-shadow-lg" strokeWidth={1.5} />
                                <div className="absolute -top-1 -left-1 w-4 h-4 border-2 border-yellow-800 rounded-full"></div>
                            </div>
                        </div>


                        {/* Animated Fan */}
                        <div className="absolute -top-20 md:-top-40 right-4 md:right-48 w-24 md:w-32 h-32 md:h-48 flex flex-col items-center scale-75 md:scale-100 origin-bottom">
                            <div className="w-28 md:w-32 h-28 md:h-32 border-4 md:border-8 border-slate-600 rounded-full relative animate-spin bg-slate-800/50 backdrop-blur-sm" style={{ animationDuration: '0.2s' }}>
                                <div className="absolute inset-0 bg-slate-500 opacity-10 rounded-full"></div>
                                <div className="absolute top-0 left-12 w-2 md:w-4 h-28 md:h-32 bg-slate-400/50"></div>
                                <div className="absolute top-12 left-0 w-28 md:w-32 h-2 md:h-4 bg-slate-400/50"></div>
                            </div>
                            <div className="w-3 md:w-4 h-12 md:h-16 bg-slate-700"></div>
                            <div className="w-20 md:w-24 h-4 md:h-6 bg-slate-800 rounded-full shadow-xl border border-slate-600"></div>
                        </div>

                        <div className="text-slate-500/50 font-bold text-sm md:text-lg tracking-[0.5em] mt-10 z-10">FACILITY DESK 04</div>
                    </div>
                </div>

                {/* --- Right Door Area --- */}
                <div className="w-[20vw] h-full bg-neutral-900 border-l border-neutral-800 relative flex flex-col justify-center items-center shadow-[-10px_0_50px_black]">
                    <div className={`absolute inset-0 bg-black transition-all duration-100 ${rightDoorClosed ? 'h-full opacity-100 z-20' : 'h-0 opacity-0'}`} style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #1a1a1a 0, #1a1a1a 10px, #0f0f0f 10px, #0f0f0f 20px)' }}></div>

                    {/* Light Effect */}
                    <div className={`absolute left-[-100px] top-0 bottom-0 w-64 pointer-events-none transition-opacity duration-75 ${rightLightOn ? 'opacity-30 bg-yellow-100 mix-blend-overlay' : 'opacity-0'}`}></div>

                    {/* ENEMY REVEAL */}
                    {rightLightOn && animatronics.red.location === 7 && <AnimatronicAtDoor type="red" />}

                    {/* Buttons */}
                    <div className="z-30 flex flex-col gap-6 bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-2xl scale-75 md:scale-110">
                        <button
                            onPointerDown={(e) => { e.preventDefault(); toggleDoor('right'); }}
                            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all active:scale-95 ${rightDoorClosed ? 'bg-red-900 border-red-500 text-red-100' : 'bg-green-900 border-green-600 text-green-100'}`}
                        >
                            {rightDoorClosed ? <Lock size={32} /> : <Unlock size={32} />}
                        </button>
                        <button
                            onPointerDown={(e) => { e.preventDefault(); toggleLight('right'); }}
                            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all active:scale-95 ${rightLightOn ? 'bg-yellow-200 border-white text-yellow-900 shadow-[0_0_20px_yellow]' : 'bg-slate-700 border-slate-500 text-slate-400'}`}
                        >
                            <Lightbulb size={32} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Look Controls - Restored but non-blocking */}
            <div className="absolute inset-0 pointer-events-none flex justify-between z-40 md:hidden">
                <button
                    className="w-16 h-24 bg-slate-800/50 border-r-2 border-slate-600 rounded-r-xl pointer-events-auto flex items-center justify-center opacity-50 active:opacity-80 active:bg-slate-700 mt-auto mb-32 backdrop-blur-sm"
                    onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); setPanTarget(0); }}
                >
                    <ChevronLeft className="text-white w-8 h-8" />
                </button>
                <button
                    className="w-16 h-24 bg-slate-800/50 border-l-2 border-slate-600 rounded-l-xl pointer-events-auto flex items-center justify-center opacity-50 active:opacity-80 active:bg-slate-700 mt-auto mb-32 backdrop-blur-sm"
                    onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); setPanTarget(1); }}
                >
                    <ChevronRight className="text-white w-8 h-8" />
                </button>
            </div>
        </div>
    );
};