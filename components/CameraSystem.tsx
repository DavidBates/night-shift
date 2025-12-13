import React from 'react';
import { StaticOverlay, HeavyStatic } from './StaticOverlay';
import { AnimatronicsState, PlaySoundFunction } from '../types';

interface CameraSystemProps {
  currentCam: number;
  setCurrentCam: (id: number) => void;
  animatronics: AnimatronicsState;
  cameraStatic: boolean;
  setCameraStatic: (isStatic: boolean) => void;
  playSound: PlaySoundFunction;
  night: number;
}

const RoomView: React.FC<{
  id: number;
  animatronics: AnimatronicsState;
  cameraStatic: boolean;
}> = ({ id, animatronics, cameraStatic }) => {
  const units: string[] = [];
  if (animatronics.blue.location === id) units.push('blue');
  if (animatronics.red.location === id) units.push('red');

  return (
    <div className="w-full h-full bg-black relative border-4 border-slate-800 overflow-hidden flex items-center justify-center">
      {cameraStatic && <HeavyStatic />}
      <div className={`text-slate-700 font-bold text-6xl opacity-20 select-none`}>CAM {id}</div>

      {units.includes('blue') && (
        <div className="absolute top-1/4 left-1/4 animate-in fade-in duration-500">
          <div className="w-32 h-64 bg-slate-900 rounded-t-3xl shadow-2xl relative flex flex-col items-center pt-8">
            <div className="w-24 h-24 bg-blue-900/50 rounded-full flex gap-4 items-center justify-center mb-2">
              <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white] animate-pulse"></div>
              <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white] animate-pulse delay-75"></div>
            </div>
            <div className="w-20 h-4 bg-red-900/40 rounded-full"></div>
          </div>
        </div>
      )}
      {units.includes('red') && (
        <div className="absolute top-1/4 right-1/4 animate-in fade-in duration-500">
          <div className="w-32 h-64 bg-slate-900 rounded-t-3xl shadow-2xl relative flex flex-col items-center pt-8">
            <div className="w-24 h-24 bg-red-900/50 rounded-full flex gap-4 items-center justify-center mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_15px_yellow] animate-pulse"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_15px_yellow] animate-pulse delay-75"></div>
            </div>
            <div className="w-20 h-10 border-b-4 border-slate-800 rounded-full"></div>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 text-white font-mono text-xl animate-pulse flex items-center gap-2">
        <div className="w-4 h-4 bg-red-600 rounded-full"></div> REC
      </div>
      <StaticOverlay />
    </div>
  );
};

const MapButton: React.FC<{
  id: number;
  x: string;
  y: string;
  label: string;
  currentCam: number;
  onClick: () => void;
}> = ({ id, x, y, label, currentCam, onClick }) => (
  <button
    onClick={onClick}
    className={`absolute w-16 h-10 border-2 text-xs font-bold transition-colors ${currentCam === id ? 'bg-green-500/50 border-green-400 text-white' : 'bg-slate-800/80 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
    style={{ left: x, top: y }}
  >
    {label}
  </button>
);

export const CameraSystem: React.FC<CameraSystemProps> = ({
  currentCam, setCurrentCam, animatronics, cameraStatic, setCameraStatic, playSound, night
}) => {
  return (
    <div className="fixed inset-0 md:inset-4 z-40 bg-black border-4 border-slate-600 shadow-2xl flex flex-col md:flex-row rounded-none md:rounded-lg overflow-hidden animate-in zoom-in duration-200">
      <div className="flex-1 relative bg-slate-900 min-h-[50vh]">
        <RoomView id={currentCam} animatronics={animatronics} cameraStatic={cameraStatic} />
      </div>

      {/* Map Sidebar */}
      <div className="w-full md:w-72 bg-slate-800 border-t md:border-t-0 md:border-l border-slate-600 relative p-4 flex flex-col shrink-0">
        <div className="text-center text-white mb-2 md:mb-4 border-b border-slate-600 pb-2 font-bold tracking-widest text-sm md:text-base">CAMERA SYSTEM</div>
        <div className="relative h-48 md:h-64 w-full bg-slate-900 rounded border border-slate-700 opacity-90 shadow-inner">
          {/* Map Nodes */}
          <MapButton
            id={1} x="10%" y="10%" label="CAM 1"
            currentCam={currentCam}
            onClick={() => { playSound('blip'); setCurrentCam(1); setCameraStatic(true); setTimeout(() => setCameraStatic(false), 200); }}
          />
          <MapButton
            id={3} x="10%" y="40%" label="CAM 3"
            currentCam={currentCam}
            onClick={() => { playSound('blip'); setCurrentCam(3); setCameraStatic(true); setTimeout(() => setCameraStatic(false), 200); }}
          />
          <MapButton
            id={5} x="10%" y="70%" label="CAM 5"
            currentCam={currentCam}
            onClick={() => { playSound('blip'); setCurrentCam(5); setCameraStatic(true); setTimeout(() => setCameraStatic(false), 200); }}
          />

          <MapButton
            id={0} x="40%" y="10%" label="STAGE"
            currentCam={currentCam}
            onClick={() => { playSound('blip'); setCurrentCam(0); setCameraStatic(true); setTimeout(() => setCameraStatic(false), 200); }}
          />

          <MapButton
            id={2} x="70%" y="10%" label="CAM 2"
            currentCam={currentCam}
            onClick={() => { playSound('blip'); setCurrentCam(2); setCameraStatic(true); setTimeout(() => setCameraStatic(false), 200); }}
          />
          <MapButton
            id={4} x="70%" y="40%" label="CAM 4"
            currentCam={currentCam}
            onClick={() => { playSound('blip'); setCurrentCam(4); setCameraStatic(true); setTimeout(() => setCameraStatic(false), 200); }}
          />
          <MapButton
            id={6} x="70%" y="70%" label="CAM 6"
            currentCam={currentCam}
            onClick={() => { playSound('blip'); setCurrentCam(6); setCameraStatic(true); setTimeout(() => setCameraStatic(false), 200); }}
          />

          <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-slate-500 tracking-widest">YOU</div>
        </div>

        <div className="mt-auto text-slate-500 text-[10px] md:text-xs space-y-1 md:space-y-2 pt-2 md:pt-0 grid grid-cols-3 md:block gap-2 md:gap-0">
          <div className="flex flex-col md:flex-row justify-between"><span>AUDIO:</span> <span className="text-green-500">ONLINE</span></div>
          <div className="flex flex-col md:flex-row justify-between"><span>VIDEO:</span> <span className="text-green-500">ONLINE</span></div>
          <div className="flex flex-col md:flex-row justify-between"><span>AI LEVEL:</span> <span className="text-red-500">{night * 2}/20</span></div>
        </div>
      </div>
    </div>
  );
};