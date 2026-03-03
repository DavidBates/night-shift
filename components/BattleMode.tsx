import React, { useEffect, useRef, useState } from 'react';

// Simple map definition: 1 is wall, 0 is empty space.
// 24x24 map
const mapWidth = 24;
const mapHeight = 24;
const worldMap: number[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Screen size for rendering
const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;

interface Enemy {
    id: number;
    x: number;
    y: number;
    hp: number;
    color: number; // ABGR format representation
    state: 'wander' | 'follow';
    targetX?: number;
    targetY?: number;
}

interface BattleModeProps {
    onExit: () => void;
}

export const BattleMode: React.FC<BattleModeProps> = ({ onExit }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bgmRef = useRef<HTMLAudioElement | null>(null);
    const [isFiring, setIsFiring] = useState(false);
    const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });

    // Player state refs (to avoid stale closures in animation loop)
    const playerRef = useRef({
        posX: 2.5,
        posY: 8.5,
        dirX: 0.0,
        dirY: 1.0,
        planeX: 0.66,
        planeY: 0.0,
        moveSpeed: 0.05,
        rotSpeed: 0.04
    });

    // Input state
    const keys = useRef<{ [key: string]: boolean }>({});
    const justFiredRef = useRef(false);

    // Enemies
    const enemiesRef = useRef<Enemy[]>([
        { id: 1, x: 10.5, y: 10.5, hp: 2, color: 0xFFFF0000, state: 'wander' }, // Blue
        { id: 2, x: 14.5, y: 14.5, hp: 2, color: 0xFF0000FF, state: 'wander' }, // Red
        { id: 3, x: 18.5, y: 10.5, hp: 2, color: 0xFF00FFFF, state: 'wander' }, // Yellow
    ]);

    // Mobile controls state
    const joystickRef = useRef({ active: false, dx: 0, dy: 0 });

    // Audio setup
    useEffect(() => {
        if (!bgmRef.current) {
            const audio = new Audio('./media/battle/background_1.mp3');
            audio.loop = true;
            audio.volume = 0.5;
            bgmRef.current = audio;
        }

        const bgm = bgmRef.current;
        bgm.play().catch(e => console.error("BGM play failed:", e));

        return () => {
            bgm.pause();
            bgm.currentTime = 0;
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.code] = true;
            if (e.code === 'Space' && !isFiring) {
                setIsFiring(true);
                justFiredRef.current = true;
                playGunShot();
                setTimeout(() => setIsFiring(false), 100);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keys.current[e.code] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isFiring]);

    // Main game loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Buffer to draw before pushing to canvas for better performance, maybe unnecessary but good practice
        const imgData = ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
        const buf = new Uint32Array(imgData.data.buffer);
        const zBuffer = new Float32Array(SCREEN_WIDTH);

        let animationFrameId: number;

        const gameLoop = () => {
            // 1. INPUT HANDLING
            const p = playerRef.current;

            // Combine keyboard and mobile inputs
            let moveForward = keys.current['KeyW'] || keys.current['ArrowUp'] ? 1 : 0;
            let moveBackward = keys.current['KeyS'] || keys.current['ArrowDown'] ? 1 : 0;
            let rotateLeft = keys.current['KeyA'] || keys.current['ArrowLeft'] ? 1 : 0;
            let rotateRight = keys.current['KeyD'] || keys.current['ArrowRight'] ? 1 : 0;

            // Joystick overrides
            if (joystickRef.current.active) {
                if (joystickRef.current.dy < -20) moveForward = 1;
                if (joystickRef.current.dy > 20) moveBackward = 1;
                if (joystickRef.current.dx < -20) rotateLeft = 1;
                if (joystickRef.current.dx > 20) rotateRight = 1;
            }

            // Movement
            if (moveForward) {
                if (worldMap[Math.floor(p.posX + p.dirX * p.moveSpeed)][Math.floor(p.posY)] === 0) p.posX += p.dirX * p.moveSpeed;
                if (worldMap[Math.floor(p.posX)][Math.floor(p.posY + p.dirY * p.moveSpeed)] === 0) p.posY += p.dirY * p.moveSpeed;
            }
            if (moveBackward) {
                if (worldMap[Math.floor(p.posX - p.dirX * p.moveSpeed)][Math.floor(p.posY)] === 0) p.posX -= p.dirX * p.moveSpeed;
                if (worldMap[Math.floor(p.posX)][Math.floor(p.posY - p.dirY * p.moveSpeed)] === 0) p.posY -= p.dirY * p.moveSpeed;
            }

            // Rotation (using 2D rotation matrix)
            if (rotateRight) {
                const oldDirX = p.dirX;
                p.dirX = p.dirX * Math.cos(-p.rotSpeed) - p.dirY * Math.sin(-p.rotSpeed);
                p.dirY = oldDirX * Math.sin(-p.rotSpeed) + p.dirY * Math.cos(-p.rotSpeed);
                const oldPlaneX = p.planeX;
                p.planeX = p.planeX * Math.cos(-p.rotSpeed) - p.planeY * Math.sin(-p.rotSpeed);
                p.planeY = oldPlaneX * Math.sin(-p.rotSpeed) + p.planeY * Math.cos(-p.rotSpeed);
            }
            if (rotateLeft) {
                const oldDirX = p.dirX;
                p.dirX = p.dirX * Math.cos(p.rotSpeed) - p.dirY * Math.sin(p.rotSpeed);
                p.dirY = oldDirX * Math.sin(p.rotSpeed) + p.dirY * Math.cos(p.rotSpeed);
                const oldPlaneX = p.planeX;
                p.planeX = p.planeX * Math.cos(p.rotSpeed) - p.planeY * Math.sin(p.rotSpeed);
                p.planeY = oldPlaneX * Math.sin(p.rotSpeed) + p.planeY * Math.cos(p.rotSpeed);
            }

            // 2. RAYCASTING

            // Clear buffer (Floor & Ceiling)
            // Top half is ceiling (dark gray), Bottom half is floor (darker red-brown for doom vibe)
            for (let y = 0; y < SCREEN_HEIGHT; y++) {
                const color = y < SCREEN_HEIGHT / 2 ? 0xFF222222 : 0xFF181515;
                for (let x = 0; x < SCREEN_WIDTH; x++) {
                    buf[y * SCREEN_WIDTH + x] = color;
                }
            }

            for (let x = 0; x < SCREEN_WIDTH; x++) {
                // calculate ray position and direction
                const cameraX = 2 * x / SCREEN_WIDTH - 1; // x-coordinate in camera space
                const rayDirX = p.dirX + p.planeX * cameraX;
                const rayDirY = p.dirY + p.planeY * cameraX;

                // which box of the map we're in
                let mapX = Math.floor(p.posX);
                let mapY = Math.floor(p.posY);

                // length of ray from current position to next x or y-side
                let sideDistX, sideDistY;

                // length of ray from one x or y-side to next x or y-side
                const deltaDistX = (rayDirX === 0) ? 1e30 : Math.abs(1 / rayDirX);
                const deltaDistY = (rayDirY === 0) ? 1e30 : Math.abs(1 / rayDirY);
                let perpWallDist;

                // what direction to step in x or y-direction (either +1 or -1)
                let stepX, stepY;

                let hit = 0; // was there a wall hit?
                let side = 0; // was a NS or a EW wall hit?

                // calculate step and initial sideDist
                if (rayDirX < 0) {
                    stepX = -1;
                    sideDistX = (p.posX - mapX) * deltaDistX;
                } else {
                    stepX = 1;
                    sideDistX = (mapX + 1.0 - p.posX) * deltaDistX;
                }
                if (rayDirY < 0) {
                    stepY = -1;
                    sideDistY = (p.posY - mapY) * deltaDistY;
                } else {
                    stepY = 1;
                    sideDistY = (mapY + 1.0 - p.posY) * deltaDistY;
                }

                // perform DDA
                while (hit === 0) {
                    // jump to next map square, either in x-direction, or in y-direction
                    if (sideDistX < sideDistY) {
                        sideDistX += deltaDistX;
                        mapX += stepX;
                        side = 0;
                    } else {
                        sideDistY += deltaDistY;
                        mapY += stepY;
                        side = 1;
                    }
                    // Check if ray has hit a wall
                    if (worldMap[mapX] && worldMap[mapX][mapY] > 0) hit = 1;
                }

                // Calculate distance projected on camera direction (Euclidean distance would give fisheye effect!)
                if (side === 0) perpWallDist = (sideDistX - deltaDistX);
                else perpWallDist = (sideDistY - deltaDistY);

                // Calculate height of line to draw on screen
                const lineHeight = Math.floor(SCREEN_HEIGHT / perpWallDist);

                // calculate lowest and highest pixel to fill in current stripe
                let drawStart = -lineHeight / 2 + SCREEN_HEIGHT / 2;
                if (drawStart < 0) drawStart = 0;
                let drawEnd = lineHeight / 2 + SCREEN_HEIGHT / 2;
                if (drawEnd >= SCREEN_HEIGHT) drawEnd = SCREEN_HEIGHT - 1;

                // Choose wall color depending on coordinates and side
                // give x and y sides different brightness
                // Format for typed array is ABGR
                let color = 0xFF555555; // Default Grey wall
                if (worldMap[mapX][mapY] === 1) { // Normal wall
                    color = side === 1 ? 0xFF444444 : 0xFF666666;
                }

                // Draw the pixels of the stripe as a vertical line
                for (let y = Math.floor(drawStart); y < Math.floor(drawEnd); y++) {
                    buf[y * SCREEN_WIDTH + x] = color;
                }
                zBuffer[x] = perpWallDist;
            }

            // 3. SPRITE CASTING
            const enemies = enemiesRef.current;

            // AI Tick
            enemies.forEach(enemy => {
                if (enemy.hp <= 0) return;

                const dx = p.posX - enemy.x;
                const dy = p.posY - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 8) enemy.state = 'follow';
                else if (dist > 12) enemy.state = 'wander';

                const speed = 0.02;
                if (enemy.state === 'follow') {
                    const moveX = enemy.x + (dx / dist) * speed;
                    const moveY = enemy.y + (dy / dist) * speed;
                    if (worldMap[Math.floor(moveX)][Math.floor(enemy.y)] === 0) enemy.x = moveX;
                    if (worldMap[Math.floor(enemy.x)][Math.floor(moveY)] === 0) enemy.y = moveY;
                } else {
                    if (Math.random() < 0.02 || !enemy.targetX) {
                        enemy.targetX = enemy.x + (Math.random() - 0.5) * 4;
                        enemy.targetY = enemy.y + (Math.random() - 0.5) * 4;
                    }
                    if (enemy.targetX !== undefined && enemy.targetY !== undefined) {
                        const tdx = enemy.targetX - enemy.x;
                        const tdy = enemy.targetY - enemy.y;
                        const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
                        if (tdist > 0.1) {
                            const moveX = enemy.x + (tdx / tdist) * speed * 0.5;
                            const moveY = enemy.y + (tdy / tdist) * speed * 0.5;
                            if (worldMap[Math.floor(moveX)][Math.floor(enemy.y)] === 0) enemy.x = moveX;
                            if (worldMap[Math.floor(enemy.x)][Math.floor(moveY)] === 0) enemy.y = moveY;
                        }
                    }
                }
            });

            const sortedEnemies = [...enemies]
                .filter(e => e.hp > 0)
                .map(e => ({ ...e, distance: ((p.posX - e.x) ** 2 + (p.posY - e.y) ** 2) }))
                .sort((a, b) => b.distance - a.distance);

            let targetInCrosshair: number | null = null;

            for (let i = 0; i < sortedEnemies.length; i++) {
                const sprite = sortedEnemies[i];

                const spriteX = sprite.x - p.posX;
                const spriteY = sprite.y - p.posY;

                const invDet = 1.0 / (p.planeX * p.dirY - p.dirX * p.planeY);
                const transformX = invDet * (p.dirY * spriteX - p.dirX * spriteY);
                const transformY = invDet * (-p.planeY * spriteX + p.planeX * spriteY);

                const spriteScreenX = Math.floor((SCREEN_WIDTH / 2) * (1 + transformX / transformY));

                const spriteHeight = Math.abs(Math.floor(SCREEN_HEIGHT / transformY));
                let drawStartY = Math.max(0, Math.floor(-spriteHeight / 2 + SCREEN_HEIGHT / 2));
                let drawEndY = Math.min(SCREEN_HEIGHT - 1, Math.floor(spriteHeight / 2 + SCREEN_HEIGHT / 2));

                const spriteWidth = Math.abs(Math.floor(SCREEN_HEIGHT / transformY));
                let drawStartX = Math.max(0, Math.floor(-spriteWidth / 2 + spriteScreenX));
                let drawEndX = Math.min(SCREEN_WIDTH - 1, Math.floor(spriteWidth / 2 + spriteScreenX));

                for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
                    if (transformY > 0 && stripe > 0 && stripe < SCREEN_WIDTH && transformY < zBuffer[stripe]) {

                        if (stripe === Math.floor(SCREEN_WIDTH / 2)) {
                            targetInCrosshair = sprite.id;
                        }

                        for (let y = drawStartY; y < drawEndY; y++) {
                            buf[y * SCREEN_WIDTH + stripe] = sprite.color;
                        }
                    }
                }
            }

            if (justFiredRef.current) {
                if (targetInCrosshair !== null) {
                    const target = enemies.find(e => e.id === targetInCrosshair);
                    if (target) {
                        target.hp -= 1;
                        if (target.hp > 0) {
                            // Hit flash feedback (make them white briefly)
                            const initialColor = target.color;
                            target.color = 0xFFFFFFFF;
                            setTimeout(() => {
                                target.color = initialColor;
                            }, 100);
                        }
                    }
                }
                justFiredRef.current = false;
            }

            // Draw Buffer to Canvas
            ctx.putImageData(imgData, 0, 0);

            // Flash overlay if firing
            if (isFiring) {
                ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
                ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            }

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isFiring]);

    // Mobile Controls Handlers
    const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
        joystickRef.current.active = true;
        updateJoystick(e);
    };

    const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (joystickRef.current.active) updateJoystick(e);
    };

    const handleJoystickEnd = () => {
        joystickRef.current.active = false;
        joystickRef.current.dx = 0;
        joystickRef.current.dy = 0;
        setJoystickPos({ x: 0, y: 0 });
    };

    const updateJoystick = (e: React.TouchEvent | React.MouseEvent) => {
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const rawDx = clientX - centerX;
        const rawDy = clientY - centerY;

        // limit visual movement and logic to the base radius
        const maxRadius = 32;
        const distance = Math.hypot(rawDx, rawDy);

        const dx = distance > maxRadius ? (rawDx / distance) * maxRadius : rawDx;
        const dy = distance > maxRadius ? (rawDy / distance) * maxRadius : rawDy;

        joystickRef.current.dx = dx;
        joystickRef.current.dy = dy;
        setJoystickPos({ x: dx, y: dy });
    };

    const playGunShot = () => {
        const shot = new Audio('./media/battle/gun_blast.mp3');
        shot.volume = 0.6;
        shot.play().catch(e => console.error("Shot audio failed:", e));
    };

    const handleFire = () => {
        if (!isFiring) {
            setIsFiring(true);
            justFiredRef.current = true;
            playGunShot();
            setTimeout(() => setIsFiring(false), 100);
        }
    };

    return (
        <div className="h-screen w-full bg-black relative overflow-hidden font-mono select-none touch-none">

            {/* 3D Canvas */}
            <canvas
                ref={canvasRef}
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT}
                className="w-full h-full object-cover rendering-pixelated"
                style={{ imageRendering: 'pixelated' }}
            />

            {/* Retro CRT Overlay (reusing classes from main app if possible, or simple CSS) */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.8)_100%)]"></div>

            {/* Top UI */}
            <div className="absolute top-4 left-4 right-4 flex justify-between z-10 pointer-events-none text-red-500">
                <div className="text-2xl font-bold tracking-widest bg-black/50 px-3 py-1 border border-red-900">HEALTH: 100%</div>
                <button
                    onClick={onExit}
                    className="pointer-events-auto bg-black/50 border border-red-500 px-4 py-2 hover:bg-red-900/50 transition-colors text-white font-bold"
                >
                    ABORT MISSION
                </button>
            </div>

            {/* Weapon UI Overlay */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center justify-end">
                {/* Simple weapon drawn with CSS for now */}
                <div className={`w-32 h-48 bg-zinc-800 border-l border-t border-zinc-600 border-r-8 border-zinc-900 flex justify-center pt-4 transition-transform ${isFiring ? 'translate-y-4' : ''}`}>
                    <div className="w-8 h-full bg-black">
                        {/* Gun Barrel details */}
                        <div className="w-full h-8 bg-zinc-600 mt-4 rounded-b-full"></div>
                    </div>
                </div>
            </div>

            {/* Mobile Controls Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none flex justify-between items-end p-8 pb-16">
                {/* Joystick Base */}
                <div
                    className="w-32 h-32 rounded-full border-2 border-white/30 bg-black/20 pointer-events-auto flex items-center justify-center relative touch-none"
                    onTouchStart={handleJoystickStart}
                    onTouchMove={handleJoystickMove}
                    onTouchEnd={handleJoystickEnd}
                    onMouseDown={handleJoystickStart}
                    onMouseMove={handleJoystickMove}
                    onMouseUp={handleJoystickEnd}
                    onMouseLeave={handleJoystickEnd}
                >
                    <div
                        className="w-12 h-12 rounded-full bg-white/50 pointer-events-none"
                        style={{ transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` }}
                    ></div>
                </div>

                {/* Fire Button */}
                <button
                    className="w-24 h-24 rounded-full bg-red-600/50 border-4 border-red-500/80 pointer-events-auto active:bg-red-400/80 active:scale-95 transition-all text-white font-bold text-xl touch-none flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.5)]"
                    onTouchStart={handleFire}
                    onMouseDown={handleFire}
                >
                    FIRE
                </button>
            </div>

        </div>
    );
};
