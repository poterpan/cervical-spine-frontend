// src/components/LayerControl/index.js
"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const LayerControl = ({ layers, onLayerChange }) => {
  const [layerStates, setLayerStates] = useState(
    layers.reduce((acc, layer) => ({
      ...acc,
      [layer.id]: { visible: true, opacity: 1 }
    }), {})
  );

  const handleVisibilityChange = (layerId) => {
    setLayerStates(prev => {
      const newStates = {
        ...prev,
        [layerId]: { ...prev[layerId], visible: !prev[layerId].visible }
      };
      onLayerChange(newStates);
      return newStates;
    });
  };

  const handleOpacityChange = (layerId, value) => {
    setLayerStates(prev => {
      const newStates = {
        ...prev,
        [layerId]: { ...prev[layerId], opacity: value[0] }
      };
      onLayerChange(newStates);
      return newStates;
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        {layers.map(layer => (
          <div key={layer.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <Switch
                  checked={layerStates[layer.id].visible}
                  onCheckedChange={() => handleVisibilityChange(layer.id)}
                />
                <span>{layer.name}</span>
              </Label>
              <span className="text-sm text-gray-500">
                {Math.round(layerStates[layer.id].opacity * 100)}%
              </span>
            </div>
            <Slider
              disabled={!layerStates[layer.id].visible}
              value={[layerStates[layer.id].opacity]}
              onValueChange={(value) => handleOpacityChange(layer.id, value)}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LayerControl;