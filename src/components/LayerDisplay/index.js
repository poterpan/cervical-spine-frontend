// src/components/LayerDisplay/index.js
"use client";

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';

const LayerDisplay = ({ layers, layerStates }) => {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden">
      {layers.map(layer => (
        layerStates[layer.id].visible && (
          <div
            key={layer.id}
            className="absolute inset-0"
            style={{
              opacity: layerStates[layer.id].opacity,
              zIndex: layer.zIndex
            }}
          >
            <Image
              src={layer.imageUrl}
              alt={layer.name}
              fill
              unoptimized
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )
      ))}
    </div>
  );
};

export default LayerDisplay;