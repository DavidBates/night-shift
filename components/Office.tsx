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
  <div className={`absolute w-40 h-80 z-10 flex flex-col items-center justify-center animate-in zoom-in duration-75 ${type === 'blue' ? 'right-[-80px]' : 'left-[-80px]'}`} style={{top: '30%'}}>
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

  // Touch/Button Logic (Mobile)
  useEffect(() => {
    if (panTarget === null || !officeRef.current) return;
    
    let animationFrameId: number;
    
    const animate = () => {
        updatePan(panTarget);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [panTarget]);

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
    >
      <div 
            ref={officeRef}
            className="w-[125vw] h-full flex relative will-change-transform transition-transform duration-300 ease-out"
            style={{ transform: 'translateX(-12.5vw)' }} 
        >
            
            {/* --- Left Door Area --- */}
            <div className="w-[20vw] h-full bg-neutral-900 border-r border-neutral-800 relative flex flex-col justify-center items-center shadow-[10px_0_50px_black]">
                <div className={`absolute inset-0 bg-black transition-all duration-100 ${leftDoorClosed ? 'h-full opacity-100 z-20' : 'h-0 opacity-0'}`} style={{backgroundImage: 'repeating-linear-gradient(45deg, #1a1a1a 0, #1a1a1a 10px, #0f0f0f 10px, #0f0f0f 20px)'}}></div>
                
                {/* Light Effect */}
                <div className={`absolute right-[-100px] top-0 bottom-0 w-64 pointer-events-none transition-opacity duration-75 ${leftLightOn ? 'opacity-30 bg-yellow-100 mix-blend-overlay' : 'opacity-0'}`}></div>

                {/* ENEMY REVEAL */}
                {leftLightOn && animatronics.blue.location === 7 && <AnimatronicAtDoor type="blue" />}

                {/* Buttons */}
                <div className="z-30 flex flex-col gap-6 bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-2xl scale-75 md:scale-110">
                    <button 
                        onMouseDown={() => toggleDoor('left')}
                        onTouchStart={() => toggleDoor('left')}
                        className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all active:scale-95 ${leftDoorClosed ? 'bg-red-900 border-red-500 text-red-100' : 'bg-green-900 border-green-600 text-green-100'}`}
                    >
                        {leftDoorClosed ? <Lock size={32}/> : <Unlock size={32}/>}
                    </button>
                    <button 
                        onMouseDown={() => toggleLight('left')}
                        onTouchStart={() => toggleLight('left')}
                        className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all active:scale-95 ${leftLightOn ? 'bg-yellow-200 border-white text-yellow-900 shadow-[0_0_20px_yellow]' : 'bg-slate-700 border-slate-500 text-slate-400'}`}
                    >
                        <Lightbulb size={32} />
                    </button>
                </div>
            </div>

            {/* --- Main Desk --- */}
            <div className="flex-1 relative flex flex-col items-center justify-end pb-0 bg-gradient-to-b from-slate-900/50 to-black">
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
                <div className="w-full max-w-5xl h-64 bg-slate-800 rounded-t-[150px] border-t-8 border-slate-700 shadow-2xl relative z-10 flex justify-center items-center">
                    <div className="absolute -top-64 left-1/4 w-32 h-48 bg-slate-900/50 rotate-[-5deg] border border-slate-700/30 flex items-center justify-center">
                        <span className="text-slate-800 text-4xl font-black opacity-20">CELEBRATE!</span>
                    </div>

                    <div className="absolute -top-12 left-32 w-40 h-32 bg-slate-900 rounded-lg transform -skew-x-12 border border-slate-600 flex items-center justify-center shadow-lg">
                        <div className="text-slate-600 text-xs text-center p-2 leading-relaxed">
                            SECURITY<br/>PROTOCOL<br/>MANUAL
                        </div>
                    </div>
                    
                    {/* Fidget: Flashlight */}
                    <div 
                        className="absolute -top-12 right-1/3 cursor-pointer group transform rotate-12 active:scale-95 transition-transform"
                        onMouseDown={toggleFlashlight}
                        onTouchStart={toggleFlashlight}
                    >
                         <div className={`w-32 h-8 rounded-full shadow-lg flex items-center ${flashlightOn ? 'bg-slate-600' : 'bg-slate-700'}`}>
                             <div className={`w-8 h-8 rounded-full border-2 border-slate-600 ${flashlightOn ? 'bg-yellow-200 shadow-[0_0_15px_yellow]' : 'bg-slate-800'}`}></div>
                             <div className="flex-1"></div>
                             <div className="w-2 h-4 bg-slate-900 rounded-sm mr-4"></div>
                         </div>
                    </div>

                    {/* Fidget: Keys */}
                    <div 
                        className={`absolute bottom-32 right-1/4 cursor-pointer p-4 group transition-transform ${keysJiggling ? 'animate-bounce' : 'hover:scale-105'}`}
                        onMouseDown={jiggleKeys}
                        onTouchStart={jiggleKeys}
                    >
                         <div className="relative">
                             <KeyRound className="text-yellow-600 w-12 h-12 transform -rotate-45 drop-shadow-lg" strokeWidth={1.5} />
                             <KeyRound className="text-yellow-700 w-12 h-12 absolute top-2 left-2 transform -rotate-12 drop-shadow-lg" strokeWidth={1.5} />
                             <div className="absolute -top-1 -left-1 w-4 h-4 border-2 border-yellow-800 rounded-full"></div>
                         </div>
                    </div>


                    {/* Animated Fan */}
                    <div className="absolute -top-40 right-48 w-32 h-48 flex flex-col items-center">
                         <div className="w-32 h-32 border-8 border-slate-500 rounded-full relative animate-spin" style={{animationDuration: '0.2s'}}>
                             <div className="absolute inset-0 bg-slate-600 opacity-20 rounded-full"></div>
                             <div className="absolute top-0 left-12 w-4 h-32 bg-slate-400"></div>
                             <div className="absolute top-12 left-0 w-32 h-4 bg-slate-400"></div>
                         </div>
                         <div className="w-4 h-16 bg-slate-700"></div>
                         <div className="w-24 h-6 bg-slate-800 rounded-full shadow-xl"></div>
                    </div>

                    <div className="text-slate-500 font-bold text-lg tracking-[0.5em] mt-10">FACILITY DESK 04</div>
                </div>
            </div>

            {/* --- Right Door Area --- */}
            <div className="w-[20vw] h-full bg-neutral-900 border-l border-neutral-800 relative flex flex-col justify-center items-center shadow-[-10px_0_50px_black]">
                 <div className={`absolute inset-0 bg-black transition-all duration-100 ${rightDoorClosed ? 'h-full opacity-100 z-20' : 'h-0 opacity-0'}`} style={{backgroundImage: 'repeating-linear-gradient(-45deg, #1a1a1a 0, #1a1a1a 10px, #0f0f0f 10px, #0f0f0f 20px)'}}></div>

                {/* Light Effect */}
                <div className={`absolute left-[-100px] top-0 bottom-0 w-64 pointer-events-none transition-opacity duration-75 ${rightLightOn ? 'opacity-30 bg-yellow-100 mix-blend-overlay' : 'opacity-0'}`}></div>

                {/* ENEMY REVEAL */}
                {rightLightOn && animatronics.red.location === 7 && <AnimatronicAtDoor type="red" />}

                {/* Buttons */}
                <div className="z-30 flex flex-col gap-6 bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-2xl scale-75 md:scale-110">
                    <button 
                        onMouseDown={() => toggleDoor('right')}
                        onTouchStart={() => toggleDoor('right')}
                        className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all active:scale-95 ${rightDoorClosed ? 'bg-red-900 border-red-500 text-red-100' : 'bg-green-900 border-green-600 text-green-100'}`}
                    >
                        {rightDoorClosed ? <Lock size={32}/> : <Unlock size={32}/>}
                    </button>
                    <button 
                         onMouseDown={() => toggleLight('right')}
                         onTouchStart={() => toggleLight('right')}
                         className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all active:scale-95 ${rightLightOn ? 'bg-yellow-200 border-white text-yellow-900 shadow-[0_0_20px_yellow]' : 'bg-slate-700 border-slate-500 text-slate-400'}`}
                    >
                        <Lightbulb size={32} />
                    </button>
                </div>
            </div>
        </div>

        {/* Mobile Look Controls - Visible on smaller screens or touch */}
        <div className="absolute inset-0 pointer-events-none flex justify-between z-20 md:hidden">
            <button 
                className="w-24 h-full bg-gradient-to-r from-black/50 to-transparent pointer-events-auto flex items-center justify-start pl-2 opacity-50 active:opacity-80"
                onTouchStart={() => setPanTarget(0)}
                onMouseDown={() => setPanTarget(0)}
            >
                <ChevronLeft className="text-white w-12 h-12" />
            </button>
            <button 
                className="w-24 h-full bg-gradient-to-l from-black/50 to-transparent pointer-events-auto flex items-center justify-end pr-2 opacity-50 active:opacity-80"
                onTouchStart={() => setPanTarget(1)}
                onMouseDown={() => setPanTarget(1)}
            >
                <ChevronRight className="text-white w-12 h-12" />
            </button>
        </div>
    </div>
  );
};