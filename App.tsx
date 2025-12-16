import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, Battery, X, Monitor, Home } from 'lucide-react';
import { ViewType, AnimatronicsState, GameStateRef, AnimatronicName, GameSettings } from './types';
import { HOUR_DURATION_MS, getAggression, DEFAULT_SETTINGS } from './constants';
import { StaticOverlay } from './components/StaticOverlay';
import { Office } from './components/Office';
import { CameraSystem } from './components/CameraSystem';
import { StartScreen, CustomSetupScreen, NightIntro, Jumpscare, WinScreen, EndingScreen } from './components/Screens';

// Google Analytics helper function
const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, eventParams);
    }
};

const NightShift = () => {
    // --- Game State ---
    const [view, setView] = useState<ViewType>('start');
    const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Simulation State
    const [time, setTime] = useState(0); // 0 = 12AM, 6 = 6AM
    const [power, setPower] = useState(100);
    const [usage, setUsage] = useState(1);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [currentCam, setCurrentCam] = useState(1); // 1-6
    const [cameraStatic, setCameraStatic] = useState(false);

    // Office State (Visual)
    const [leftDoorClosed, setLeftDoorClosed] = useState(false);
    const [rightDoorClosed, setRightDoorClosed] = useState(false);
    const [leftLightOn, setLeftLightOn] = useState(false);
    const [rightLightOn, setRightLightOn] = useState(false);

    // Logic Refs (For Game Loop to avoid dependency resets)
    const gameStateRef = useRef<GameStateRef>({
        leftDoorClosed: false,
        rightDoorClosed: false,
        leftLightOn: false,
        rightLightOn: false,
        cameraOpen: false,
        isSettingsOpen: false,
        view: 'start',
        power: 100,
        time: 0,
        animatronics: {
            blue: { location: 0, path: [0, 1, 3, 5, 7], name: "Unit-01" },
            red: { location: 0, path: [0, 2, 4, 6, 7], name: "Unit-02" }
        }
    });

    // Sync state to refs
    useEffect(() => {
        gameStateRef.current.leftDoorClosed = leftDoorClosed;
        gameStateRef.current.rightDoorClosed = rightDoorClosed;
        gameStateRef.current.leftLightOn = leftLightOn;
        gameStateRef.current.rightLightOn = rightLightOn;
        gameStateRef.current.cameraOpen = cameraOpen;
        gameStateRef.current.isSettingsOpen = isSettingsOpen;
        gameStateRef.current.view = view;
        gameStateRef.current.power = power;
        gameStateRef.current.time = time;
    }, [leftDoorClosed, rightDoorClosed, leftLightOn, rightLightOn, cameraOpen, isSettingsOpen, view, power, time]);

    // Enemy State
    const [animatronics, setAnimatronics] = useState<AnimatronicsState>({
        blue: { location: 0, path: [0, 1, 3, 5, 7], name: "Unit-01" },
        red: { location: 0, path: [0, 2, 4, 6, 7], name: "Unit-02" }
    });

    const [jumpscareSource, setJumpscareSource] = useState<AnimatronicName | null>(null);

    // Audio Refs
    const audioCtxRef = useRef<AudioContext | null>(null);
    const ambienceNodeRef = useRef<{ stop: () => void } | null>(null);
    const droneNodeRef = useRef<{ setIntensity: (t: number) => void; stop: () => void } | null>(null);
    const staticNodeRef = useRef<{ stop: () => void } | null>(null);

    // --- AUDIO ENGINE ---

    const initAudio = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    const playSound = useCallback((type: 'switch' | 'scare' | 'blip' | 'door' | 'keys' | 'flashlight') => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const t = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'switch') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, t);
            osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            osc.start(t);
            osc.stop(t + 0.1);
        } else if (type === 'scare') {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc.type = 'sawtooth';
            osc2.type = 'sawtooth';

            osc.frequency.setValueAtTime(100, t);
            osc.frequency.linearRampToValueAtTime(800, t + 0.1);
            osc2.frequency.setValueAtTime(150, t);
            osc2.frequency.linearRampToValueAtTime(750, t + 0.1);

            gain.gain.setValueAtTime(0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 2);
            gain2.gain.setValueAtTime(0.5, t);
            gain2.gain.exponentialRampToValueAtTime(0.01, t + 2);

            osc.start(t);
            osc2.start(t);
            osc.stop(t + 2);
            osc2.stop(t + 2);
        } else if (type === 'blip') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, t);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc.start(t);
            osc.stop(t + 0.05);
        } else if (type === 'door') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100, t);
            osc.frequency.exponentialRampToValueAtTime(20, t + 0.3);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc.start(t);
            osc.stop(t + 0.3);
        } else if (type === 'flashlight') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(1000, t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
            osc.start(t);
            osc.stop(t + 0.05);
        } else if (type === 'keys') {
            // Simple high pitched jingle simulation
            const playTing = (timeOffset: number, freq: number) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.connect(g);
                g.connect(ctx.destination);
                o.frequency.value = freq;
                o.type = 'sine';
                g.gain.setValueAtTime(0.05, t + timeOffset);
                g.gain.exponentialRampToValueAtTime(0.001, t + timeOffset + 0.1);
                o.start(t + timeOffset);
                o.stop(t + timeOffset + 0.1);
            };
            playTing(0, 1500);
            playTing(0.05, 1800);
            playTing(0.1, 1600);
            playTing(0.15, 2000);
        }
    }, []);

    const toggleAmbience = useCallback((shouldPlay: boolean) => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;

        // 1. Fan/Room Noise (Brownian-ish)
        if (shouldPlay && !ambienceNodeRef.current) {
            const bufferSize = 2 * ctx.sampleRate;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 120;

            const gain = ctx.createGain();
            gain.gain.value = 0.05;

            noise.connect(filter).connect(gain).connect(ctx.destination);
            noise.start();
            ambienceNodeRef.current = { stop: () => noise.stop() };
        } else if (!shouldPlay && ambienceNodeRef.current) {
            ambienceNodeRef.current.stop();
            ambienceNodeRef.current = null;
        }

        // 2. Creepy Musical Drone (Increases intensity with time)
        if (shouldPlay && !droneNodeRef.current) {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const osc3 = ctx.createOscillator(); // High tension string

            const gainNode = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc1.type = 'sawtooth';
            osc2.type = 'sawtooth';
            osc3.type = 'sine';

            osc1.frequency.value = 55; // A1
            osc2.frequency.value = 56; // A1 slightly sharp (beating)
            osc3.frequency.value = 440; // A4

            filter.type = 'lowpass';
            filter.frequency.value = 200;

            gainNode.gain.value = 0.1;

            osc1.connect(filter);
            osc2.connect(filter);
            osc3.connect(filter); // Maybe filter high string less? Connect directly to gain for clarity.
            // Re-route osc3
            osc3.disconnect();
            const gainHigh = ctx.createGain();
            gainHigh.gain.value = 0; // Starts silent
            osc3.connect(gainHigh).connect(gainNode);

            filter.connect(gainNode).connect(ctx.destination);

            osc1.start();
            osc2.start();
            osc3.start();

            droneNodeRef.current = {
                stop: () => {
                    osc1.stop();
                    osc2.stop();
                    osc3.stop();
                    droneNodeRef.current = null;
                },
                setIntensity: (hour: number) => {
                    // As hour increases (0-6):
                    // 1. Filter opens up (200Hz -> 600Hz)
                    // 2. Detune increases (beat frequency speeds up)
                    // 3. High dissonant note fades in
                    const t = ctx.currentTime;
                    filter.frequency.linearRampToValueAtTime(200 + (hour * 80), t + 1);
                    osc2.frequency.linearRampToValueAtTime(56 + (hour * 0.5), t + 1);
                    gainHigh.gain.linearRampToValueAtTime(hour * 0.005, t + 1);
                }
            };
        } else if (!shouldPlay && droneNodeRef.current) {
            droneNodeRef.current.stop();
        }

    }, []);

    const toggleStaticSound = useCallback((shouldPlay: boolean) => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;

        if (shouldPlay && !staticNodeRef.current) {
            const bufferSize = ctx.sampleRate;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            const gain = ctx.createGain();
            gain.gain.value = 0.02;

            noise.connect(gain).connect(ctx.destination);
            noise.start();
            staticNodeRef.current = { stop: () => noise.stop() };
        } else if (!shouldPlay && staticNodeRef.current) {
            staticNodeRef.current.stop();
            staticNodeRef.current = null;
        }
    }, []);

    // Update drone intensity when time changes
    useEffect(() => {
        if (view === 'game' && droneNodeRef.current) {
            droneNodeRef.current.setIntensity(time);
        }
    }, [time, view]);

    // --- Actions ---

    const startGame = (settings: GameSettings) => {
        setGameSettings(settings);
        setView('game');
        setTime(0);
        setPower(settings.startingPower);
        setUsage(1);
        setCameraOpen(false);
        setLeftDoorClosed(false);
        setRightDoorClosed(false);
        setLeftLightOn(false);
        setRightLightOn(false);
        setIsSettingsOpen(false);
        toggleAmbience(true);

        // Reset Animatronics
        const initialAnimatronics = {
            blue: { location: 0, path: [0, 1, 3, 5, 7], name: "Unit-01" },
            red: { location: 0, path: [0, 2, 4, 6, 7], name: "Unit-02" }
        };
        setAnimatronics(initialAnimatronics);
        gameStateRef.current.animatronics = initialAnimatronics;
    };

    const startNightSequence = (nightNum: number) => {
        // Configure default settings for standard nights
        const aggression = getAggression(nightNum);
        const settings: GameSettings = {
            ...DEFAULT_SETTINGS,
            night: nightNum,
            blueAI: aggression.blue,
            redAI: aggression.red,
        };

        initAudio();
        setGameSettings(settings);
        setView('night_intro');

        // Delay start to show intro
        setTimeout(() => {
            startGame(settings);
        }, 4000);
    };

    const startCustomNight = (settings: GameSettings) => {
        initAudio();
        setGameSettings(settings);
        setView('night_intro');
        setTimeout(() => {
            startGame(settings);
        }, 4000);
    };

    const returnToTitle = () => {
        setView('start');
        setIsSettingsOpen(false);
        toggleAmbience(false);
        toggleStaticSound(false);
    };

    const handleWin = () => {
        toggleAmbience(false);
        toggleStaticSound(false);
        // Track night success event
        trackEvent('night_success', {
            night: gameSettings.night,
            night_type: gameSettings.night === 6 ? 'custom' : 'standard',
        });
        if (gameSettings.night < 5) {
            setView('win');
        } else {
            setView('ending');
        }
    };

    const continueGame = () => {
        startNightSequence(gameSettings.night + 1);
    };

    const toggleDoor = (side: 'left' | 'right') => {
        if (power <= 0) return;
        playSound('door');
        if (side === 'left') setLeftDoorClosed(!leftDoorClosed);
        else setRightDoorClosed(!rightDoorClosed);
    };

    const toggleLight = (side: 'left' | 'right') => {
        if (power <= 0) return;
        playSound('switch');
        if (side === 'left') {
            setLeftLightOn(!leftLightOn);
            if (rightLightOn) setRightLightOn(false);
        } else {
            setRightLightOn(!rightLightOn);
            if (leftLightOn) setLeftLightOn(false);
        }
    };

    const toggleCamera = () => {
        if (power <= 0) return;
        playSound('switch');
        const newState = !cameraOpen;
        setCameraOpen(newState);
        toggleStaticSound(newState);
        setLeftLightOn(false);
        setRightLightOn(false);
    };

    // --- GAME LOOPS ---

    // 1. Core Loop (Time, Power, AI Logic)
    useEffect(() => {
        if (view !== 'game') return;

        // Use settings from state
        const { blueAI, redAI, hourLengthMs } = gameSettings;
        const aiTickRate = Math.max(2000, 5000 - (gameSettings.night * 500));

        // AI Logic Tick
        const aiInterval = setInterval(() => {
            const state = gameStateRef.current;
            if (state.isSettingsOpen || state.view !== 'game' || state.power <= 0) return;

            setAnimatronics(prev => {
                const next = {
                    blue: { ...prev.blue },
                    red: { ...prev.red }
                };
                let moved = false;

                (['blue', 'red'] as AnimatronicName[]).forEach(key => {
                    const enemy = next[key];
                    const aiLevel = key === 'blue' ? blueAI : redAI;

                    // Roll for movement (1-20 scale)
                    const roll = Math.floor(Math.random() * 20) + 1;

                    // Move if roll <= AI Level
                    if (roll <= aiLevel) {
                        const path = enemy.path;
                        const currentIndex = path.indexOf(enemy.location);

                        if (enemy.location === 7) {
                            // AT DOOR - ATTACK LOGIC
                            const blocked = key === 'blue' ? state.leftDoorClosed : state.rightDoorClosed;

                            if (!blocked) {
                                // NOT BLOCKED -> JUMPSCARE
                                setJumpscareSource(key);
                                setView('jumpscare');
                                toggleAmbience(false);
                                toggleStaticSound(false);
                                playSound('scare');
                                // Track night failure event
                                trackEvent('night_failure', {
                                    night: gameSettings.night,
                                    night_type: gameSettings.night === 6 ? 'custom' : 'standard',
                                    cause: 'door_attack',
                                    animatronic: key,
                                });
                            } else {
                                // BLOCKED -> RETREAT
                                enemy.location = path[0]; // Back to stage
                                moved = true;
                                playSound('door');
                            }
                        } else if (currentIndex > 0) {
                            // Random movement: 75% advance, 25% retreat
                            const moveForward = Math.random() > 0.25;
                            if (moveForward && currentIndex < path.length - 1) {
                                enemy.location = path[currentIndex + 1];
                            } else {
                                enemy.location = path[currentIndex - 1]; // Retreat
                            }
                            moved = true;
                        } else {
                            // At stage (index 0), must move forward
                            enemy.location = path[1];
                            moved = true;
                        }
                    }
                });

                // Sync ref
                gameStateRef.current.animatronics = next;

                if (moved && state.cameraOpen) {
                    setCameraStatic(true);
                    playSound('blip');
                    setTimeout(() => setCameraStatic(false), 500);
                }

                return next;
            });
        }, aiTickRate);

        // Time/Power Tick (Runs every 1s)
        const gameInterval = setInterval(() => {
            const state = gameStateRef.current;
            if (state.isSettingsOpen || state.view !== 'game') return;

            // Update Time
            setTime(t => {
                const increment = 1000 / hourLengthMs;
                const newTime = t + increment;

                if (newTime >= 6) {
                    handleWin();
                    return 6;
                }
                return newTime;
            });

            // Drain Power
            let drain = 0.15 + (gameSettings.night * 0.05); // Base drain increases by night difficulty
            if (state.leftDoorClosed) drain += 0.3;
            if (state.rightDoorClosed) drain += 0.3;
            if (state.leftLightOn) drain += 0.5;
            if (state.rightLightOn) drain += 0.5;
            if (state.cameraOpen) drain += 0.3;

            setUsage(Math.ceil(drain * 4));

            setPower(p => {
                const newP = p - drain;
                if (newP <= 0) {
                    // BLACKOUT
                    setCameraOpen(false);
                    toggleStaticSound(false);
                    setLeftDoorClosed(false);
                    setRightDoorClosed(false);
                    setLeftLightOn(false);
                    setRightLightOn(false);
                    if (p > 0) playSound('switch');
                    return 0;
                }
                return newP;
            });

            // Blackout Jumpscare Chance (20% per tick if power is 0)
            if (state.power <= 0) {
                if (Math.random() < 0.2) {
                    setJumpscareSource('blue');
                    setView('jumpscare');
                    toggleAmbience(false);
                    playSound('scare');
                    // Track night failure event
                    trackEvent('night_failure', {
                        night: gameSettings.night,
                        night_type: gameSettings.night === 6 ? 'custom' : 'standard',
                        cause: 'power_outage',
                        animatronic: 'blue',
                    });
                }
            }

        }, 1000);

        return () => {
            clearInterval(aiInterval);
            clearInterval(gameInterval);
        };
    }, [view, gameSettings, playSound, toggleAmbience, toggleStaticSound]);

    // --- Main Views ---

    if (view === 'start') {
        return <StartScreen onStart={startNightSequence} onCustom={() => setView('custom_setup')} />;
    }

    if (view === 'custom_setup') {
        return <CustomSetupScreen onStart={startCustomNight} onBack={() => setView('start')} />;
    }

    if (view === 'night_intro') {
        return <NightIntro night={gameSettings.night} />;
    }

    if (view === 'jumpscare') {
        return <Jumpscare source={jumpscareSource} onGameOver={returnToTitle} />;
    }

    if (view === 'win') {
        return <WinScreen night={gameSettings.night} onNextNight={continueGame} onMenu={returnToTitle} />;
    }

    if (view === 'ending') {
        return <EndingScreen onReturn={returnToTitle} />;
    }

    // --- GAME UI ---
    return (
        <div
            className="h-screen w-full bg-black relative overflow-hidden select-none font-mono cursor-crosshair touch-none"
        >
            {/* SETTINGS MODAL */}
            {isSettingsOpen && (
                <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg w-80 text-center shadow-2xl">
                        <h2 className="text-2xl text-white mb-6 flex items-center justify-center gap-2">
                            <Settings className="w-6 h-6 text-slate-400" /> PAUSED
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-600 transition-colors"
                            >
                                RESUME
                            </button>
                            <button
                                onClick={returnToTitle}
                                className="w-full py-3 bg-red-900/50 hover:bg-red-900 text-red-200 rounded border border-red-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <Home size={18} /> ABORT SHIFT
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOP HUD */}
            <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-start z-30 pointer-events-none">
                <div className="flex flex-col gap-1 text-white">
                    <div className="text-4xl font-black tracking-widest">{Math.floor(time) === 0 ? 12 : Math.floor(time)} AM</div>
                    <div className="text-lg font-bold text-slate-400">{gameSettings.night === 6 ? 'CUSTOM' : `Night ${gameSettings.night}`}</div>
                </div>

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="pointer-events-auto p-2 text-slate-500 hover:text-white transition-colors"
                >
                    <Settings size={28} />
                </button>
            </div>

            {/* PANNING CONTAINER & OFFICE */}
            <Office
                leftDoorClosed={leftDoorClosed}
                rightDoorClosed={rightDoorClosed}
                leftLightOn={leftLightOn}
                rightLightOn={rightLightOn}
                toggleDoor={toggleDoor}
                toggleLight={toggleLight}
                animatronics={animatronics}
                isSettingsOpen={isSettingsOpen}
                cameraOpen={cameraOpen}
                playSound={playSound}
            />

            {/* BOTTOM UI (Fixed) */}
            <div className="fixed bottom-4 left-4 z-50 text-white font-mono bg-black/80 backdrop-blur p-4 rounded-xl border border-slate-600 shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                    <Battery className={`w-8 h-8 ${power < 20 ? 'text-red-500 animate-pulse' : 'text-green-500'}`} />
                    <span className="text-3xl font-bold">{Math.floor(power)}%</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold tracking-wider">
                    <span>USAGE:</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`w-6 h-4 rounded-sm ${i <= usage ? (usage > 3 ? 'bg-red-500' : 'bg-green-500') : 'bg-slate-800'}`}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CAMERA SYSTEM (Overlay) */}
            {cameraOpen && (
                <CameraSystem
                    currentCam={currentCam}
                    setCurrentCam={setCurrentCam}
                    animatronics={animatronics}
                    cameraStatic={cameraStatic}
                    setCameraStatic={setCameraStatic}
                    playSound={playSound}
                    night={gameSettings.night}
                />
            )}

            {/* CAMERA FLIP BUTTON (Fixed) */}
            <div className="fixed bottom-0 right-4 md:right-10 z-[55] w-48 md:w-80 h-14 md:h-16 group">
                <button
                    onClick={toggleCamera}
                    className="w-full h-full bg-slate-800/90 backdrop-blur border-t-4 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white hover:h-20 transition-all flex items-center justify-center gap-3 rounded-t-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                >
                    {cameraOpen ? <X size={24} /> : <Monitor size={24} />}
                    <span className="font-black text-lg md:text-xl tracking-widest">{cameraOpen ? 'CLOSE' : 'MONITOR'}</span>
                </button>
            </div>

            <StaticOverlay />
        </div>
    );
};

export default NightShift;