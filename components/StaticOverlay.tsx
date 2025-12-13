import React from 'react';
import { NOISE_SVG_URL, HEAVY_NOISE_SVG_URL } from '../constants';

export const StaticOverlay = () => (
  <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay z-50" 
       style={{backgroundImage: `url("${NOISE_SVG_URL}")`}}>
  </div>
);

export const HeavyStatic = () => (
  <div className="absolute inset-0 z-40 bg-black/50 pointer-events-none">
      <div className="w-full h-full opacity-30 animate-pulse"
           style={{backgroundImage: `url("${HEAVY_NOISE_SVG_URL}")`, backgroundSize: '100px 100px'}}>
      </div>
  </div>
);