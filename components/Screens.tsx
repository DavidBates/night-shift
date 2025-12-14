import React, { useState, useEffect } from 'react';
import { StaticOverlay } from './StaticOverlay';
import { AnimatronicName, GameSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { ArrowLeft, Play, Settings } from 'lucide-react';

export const StartScreen: React.FC<{
    onStart: (night: number) => void;
    onCustom: () => void;
}> = ({ onStart, onCustom }) => (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden font-mono text-slate-200">
        <StaticOverlay />
        <div className="z-10 text-center space-y-6 animate-in fade-in duration-1000">
            <h1 className="text-7xl font-black tracking-widest text-slate-100 glitch-text" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                NIGHT SHIFT
            </h1>
            <p className="text-xl text-slate-500">Facility Security</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-8 px-4">
                <button
                    onClick={() => onStart(1)}
                    className="px-8 py-3 border border-slate-600 hover:bg-slate-800 hover:border-slate-400 transition-all text-lg group relative overflow-hidden"
                >
                    NEW GAME
                </button>
                <button
                    onClick={onCustom}
                    className="px-8 py-3 border border-yellow-900 text-yellow-500 hover:bg-yellow-950/30 hover:border-yellow-600 hover:text-yellow-400 transition-all text-lg flex items-center justify-center gap-2"
                >
                    <Settings size={18} /> CUSTOM NIGHT
                </button>
            </div>
        </div>
        <div className="absolute bottom-8 text-xs text-slate-700">
            HEADPHONES RECOMMENDED
        </div>
    </div>
);

export const CustomSetupScreen: React.FC<{
    onStart: (settings: GameSettings) => void;
    onBack: () => void;
}> = ({ onStart, onBack }) => {
    const [settings, setSettings] = useState<GameSettings>({
        ...DEFAULT_SETTINGS,
        night: 6 // Custom night identifier
    });

    const handleChange = (key: keyof GameSettings, value: number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-y-auto font-mono text-slate-200 p-4">
            <StaticOverlay />
            <div className="z-10 w-full max-w-2xl bg-slate-900/80 border border-slate-700 p-8 rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="flex items-center justify-between mb-8 border-b border-slate-700 pb-4">
                    <h2 className="text-3xl font-bold text-yellow-500">CUSTOM NIGHT CONFIG</h2>
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Animatronics */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-400 border-b border-slate-700 pb-2">AI LEVELS (0-20)</h3>

                        <div className="bg-blue-950/30 p-4 rounded border border-blue-900/50">
                            <label className="flex justify-between mb-2 font-bold text-blue-400">
                                <span>UNIT-01 (BLUE)</span>
                                <span>{settings.blueAI}</span>
                            </label>
                            <input
                                type="range" min="0" max="20"
                                value={settings.blueAI}
                                onChange={(e) => handleChange('blueAI', parseInt(e.target.value))}
                                className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="bg-red-950/30 p-4 rounded border border-red-900/50">
                            <label className="flex justify-between mb-2 font-bold text-red-400">
                                <span>UNIT-02 (RED)</span>
                                <span>{settings.redAI}</span>
                            </label>
                            <input
                                type="range" min="0" max="20"
                                value={settings.redAI}
                                onChange={(e) => handleChange('redAI', parseInt(e.target.value))}
                                className="w-full accent-red-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Game Settings */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-400 border-b border-slate-700 pb-2">FACILITY SETTINGS</h3>

                        <div>
                            <label className="flex justify-between mb-2 text-slate-300">
                                <span>STARTING POWER</span>
                                <span className={settings.startingPower < 50 ? 'text-red-500' : 'text-green-500'}>{settings.startingPower}%</span>
                            </label>
                            <input
                                type="range" min="10" max="100" step="10"
                                value={settings.startingPower}
                                onChange={(e) => handleChange('startingPower', parseInt(e.target.value))}
                                className="w-full accent-green-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="flex justify-between mb-2 text-slate-300">
                                <span>NIGHT DURATION</span>
                                <span className="text-yellow-500">{Math.round(settings.hourLengthMs / 1000)}s / HOUR</span>
                            </label>
                            <input
                                type="range" min="2000" max="15000" step="1000"
                                value={settings.hourLengthMs}
                                onChange={(e) => handleChange('hourLengthMs', parseInt(e.target.value))}
                                className="w-full accent-yellow-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <p className="text-xs text-slate-500 mt-2 text-right">Standard: 8s</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onStart(settings)}
                    className="w-full py-4 bg-slate-100 hover:bg-white text-black font-black text-2xl tracking-widest rounded flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                    <Play fill="black" /> START SHIFT
                </button>
            </div>
        </div>
    );
};

export const NightIntro: React.FC<{ night: number }> = ({ night }) => (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center font-mono text-white animate-in fade-in duration-1000">
        <h1 className="text-6xl font-bold mb-4">12:00 AM</h1>
        <div className="w-24 h-1 bg-white mb-4"></div>
        <h2 className="text-3xl text-slate-400 tracking-widest">{night === 6 ? 'CUSTOM NIGHT' : `NIGHT ${night}`}</h2>
        <div className="absolute bottom-10 text-slate-600 animate-pulse">Loading Assets...</div>
    </div>
);

export const Jumpscare: React.FC<{
    source: AnimatronicName | null;
    onGameOver: () => void;
}> = ({ source, onGameOver }) => (
    <div className="h-screen w-full bg-black flex items-center justify-center relative overflow-hidden z-50">
        <div className={`absolute inset-0 ${source === 'blue' ? 'bg-blue-900' : 'bg-red-900'} animate-pulse duration-75`}></div>
        <div className="z-10 relative w-full h-full flex items-center justify-center animate-bounce duration-75">
            <div className={`w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] ${source === 'blue' ? 'bg-blue-950' : 'bg-red-950'} rounded-full shadow-2xl flex flex-col items-center justify-center relative transform scale-125`}>
                <div className="absolute top-[20%] w-full flex justify-center gap-8 md:gap-16">
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-black rounded-full border-4 md:border-8 border-white flex items-center justify-center overflow-hidden">
                        <div className="w-4 h-4 md:w-6 md:h-6 bg-red-600 shadow-[0_0_25px_red] animate-ping"></div>
                    </div>
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-black rounded-full border-4 md:border-8 border-white flex items-center justify-center overflow-hidden">
                        <div className="w-4 h-4 md:w-6 md:h-6 bg-red-600 shadow-[0_0_25px_red] animate-ping"></div>
                    </div>
                </div>
                <div className="absolute bottom-[20%] w-48 h-24 md:w-72 md:h-40 bg-black border-4 md:border-8 border-white rounded-b-[3rem] md:rounded-b-[4rem] overflow-hidden flex flex-col justify-center items-center">
                    <div className="w-full h-full bg-red-900/50 animate-pulse"></div>
                </div>
            </div>
        </div>
        <div className="absolute bottom-10 z-50">
            <button onClick={onGameOver} className="text-white border px-4 py-2 hover:bg-white hover:text-black">GAME OVER</button>
        </div>
    </div>
);

export const WinScreen: React.FC<{
    night: number;
    onNextNight: () => void;
    onMenu: () => void;
}> = ({ night, onNextNight, onMenu }) => {
    useEffect(() => {
        const file = Math.random() < 0.5 ? '1.mp3' : '2.mp3';
        const audio = new Audio(`./media/${file}`);
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Audio play failed:", e));

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-center font-mono space-y-4 animate-in fade-in duration-500">
            <h1 className="text-8xl font-bold text-white mb-4 animate-bounce">6:00 AM</h1>
            <p className="text-green-400 text-3xl mb-8">SHIFT COMPLETE</p>

            {night < 7 ? (
                <>
                    <p className="text-slate-500 mb-8">Preparing Night {night + 1}...</p>
                    <button
                        onClick={onNextNight}
                        className="px-8 py-3 bg-white text-black font-bold text-xl hover:scale-110 transition-transform"
                    >
                        START NIGHT {night + 1}
                    </button>
                </>
            ) : (
                <button
                    onClick={onMenu}
                    className="px-8 py-3 border border-white text-white font-bold text-xl hover:bg-white hover:text-black transition-colors"
                >
                    RETURN TO MENU
                </button>
            )}
        </div>
    );
};

export const EndingScreen: React.FC<{
    onReturn: () => void;
}> = ({ onReturn }) => (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-center font-mono space-y-6">
        <h1 className="text-6xl font-bold text-yellow-500 mb-4">CONGRATULATIONS</h1>
        <p className="text-white text-xl max-w-lg">You have survived all 7 nights at the facility.</p>
        <div className="text-4xl">🏆</div>
        <p className="text-slate-500 text-sm">Paycheck: $120.00</p>
        <button onClick={onReturn} className="mt-12 text-white border-b hover:border-transparent transition-colors">Return to Menu</button>
    </div>
);