import React, { useState } from 'react';
import { PlayerData } from '../App';

interface ManaType {
  symbol: string;
  color: string;
  display: string;
  bgColor: string; // Tailwind bg color class
}

interface LandType {
  type: string;
  produces: string;
  symbol: string;
  bgColor: string; // Tailwind bg color class
}

interface PlayerProps {
  player: PlayerData;
  isActive: boolean;
  onUpdate: (updatedData: Partial<PlayerData>) => void;
  onRemove: () => void;
}

const MANA_TYPES: ManaType[] = [
  { symbol: 'W', color: 'white', display: '☀️', bgColor: 'bg-yellow-100/90 text-gray-900' },
  { symbol: 'U', color: 'blue', display: '💧', bgColor: 'bg-blue-200/90 text-gray-900' },
  { symbol: 'B', color: 'black', display: '💀', bgColor: 'bg-gray-400/90 text-gray-900' },
  { symbol: 'R', color: 'red', display: '🔥', bgColor: 'bg-red-200/90 text-gray-900' },
  { symbol: 'G', color: 'green', display: '🌳', bgColor: 'bg-green-200/90 text-gray-900' },
  { symbol: 'C', color: 'colorless', display: '💎', bgColor: 'bg-gray-200/90 text-gray-900' }
];

const LAND_TYPES: LandType[] = [
  { type: 'Plains', produces: 'W', symbol: '☀️', bgColor: 'bg-yellow-100/90 text-gray-900' },
  { type: 'Island', produces: 'U', symbol: '💧', bgColor: 'bg-blue-200/90 text-gray-900' },
  { type: 'Swamp', produces: 'B', symbol: '💀', bgColor: 'bg-gray-400/90 text-gray-900' },
  { type: 'Mountain', produces: 'R', symbol: '🔥', bgColor: 'bg-red-200/90 text-gray-900' },
  { type: 'Forest', produces: 'G', symbol: '🌳', bgColor: 'bg-green-200/90 text-gray-900' },
  { type: 'Wastes', produces: 'C', symbol: '💎', bgColor: 'bg-gray-200/90 text-gray-900' }
];

function Player({ player, isActive, onUpdate, onRemove }: PlayerProps) {
  const [nameEditing, setNameEditing] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(player.name);

  const updateLife = (amount: number) => {
    onUpdate({ life: player.life + amount });
  };

  const addLand = (landType: LandType) => {
    const newLand = { 
      id: Date.now(), 
      type: landType.type, 
      tapped: false, 
      produces: landType.produces 
    };
    onUpdate({ lands: [...player.lands, newLand] });
  };

  const removeLand = (landId: number) => {
    onUpdate({ lands: player.lands.filter(land => land.id !== landId) });
  };

  const toggleLand = (landId: number) => {
    const updatedLands = player.lands.map(land => {
      if (land.id === landId) {
        if (!land.tapped) {
          // When tapping a land, add mana to the pool
          const updatedManaPool = { ...player.manaPool };
          updatedManaPool[land.produces as keyof typeof updatedManaPool]++;
          onUpdate({ manaPool: updatedManaPool });
        }
        return { ...land, tapped: !land.tapped };
      }
      return land;
    });
    onUpdate({ lands: updatedLands });
  };

  const useMana = (manaType: string) => {
    if (player.manaPool[manaType as keyof typeof player.manaPool] > 0) {
      const updatedManaPool = { ...player.manaPool };
      updatedManaPool[manaType as keyof typeof updatedManaPool]--;
      onUpdate({ manaPool: updatedManaPool });
    }
  };

  const finishNameEdit = () => {
    onUpdate({ name: newName });
    setNameEditing(false);
  };

  return (
    <div className={`backdrop-blur-sm rounded-xl p-5 w-80 transition-all duration-300 shadow-xl ${
      isActive 
        ? 'border-2 border-amber-400 bg-gray-800/70 ring-4 ring-amber-400/30' 
        : 'bg-gray-800/50 border border-gray-700'
    }`}>
      <div className="flex justify-between items-center mb-5">
        {nameEditing ? (
          <div className="w-full">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={finishNameEdit}
              onKeyPress={(e) => e.key === 'Enter' && finishNameEdit()}
              autoFocus
              className="text-xl font-bold w-[85%] p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
        ) : (
          <h2 
            onClick={() => setNameEditing(true)}
            className="text-xl font-bold cursor-pointer hover:text-amber-300 transition-colors duration-200"
          >
            {player.name}
          </h2>
        )}
        <button 
          className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl transition-all duration-200 transform hover:scale-110 active:scale-95"
          onClick={onRemove}
        >
          ×
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="relative flex items-center">
          <button 
            onClick={() => updateLife(-1)}
            className="bg-gradient-to-r from-red-600 to-red-500 text-white w-11 h-11 rounded-full text-xl flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 -mr-2 z-10"
          >
            -
          </button>
          <div className="flex-shrink-0 bg-gray-700 rounded-full px-6 py-3 shadow-inner border border-gray-600">
            <span className="text-3xl font-bold min-w-[60px] text-center text-white">{player.life}</span>
          </div>
          <button 
            onClick={() => updateLife(1)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white w-11 h-11 rounded-full text-xl flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 -ml-2 z-10"
          >
            +
          </button>
        </div>
      </div>

      <div className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
        <h3 className="text-center font-bold mb-3 text-amber-300">Lands</h3>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {LAND_TYPES.map(land => (
            <button 
              key={land.type} 
              onClick={() => addLand(land)}
              className={`border border-gray-600 rounded-lg p-2 text-xl cursor-pointer transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-sm ${land.bgColor}`}
            >
              {land.symbol}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {player.lands.map(land => {
            const landType = LAND_TYPES.find(l => l.type === land.type);
            return (
              <div 
                key={land.id} 
                className={`w-10 h-16 border border-gray-600 rounded-lg flex items-center justify-center relative text-2xl cursor-pointer bg-gray-800 hover:bg-gray-700 ${
                  land.tapped ? 'transform rotate-90 opacity-70' : 'hover:scale-105'
                } transition-all duration-300`}
                onClick={() => toggleLand(land.id)}
              >
                {landType?.symbol}
                <button 
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white border-none rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLand(land.id);
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
        <h3 className="text-center font-bold mb-3 text-amber-300">Mana Pool</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {MANA_TYPES.map(mana => (
            <div 
              key={mana.symbol} 
              className={`flex flex-col items-center border border-gray-600 rounded-lg p-2 min-w-[45px] shadow-sm ${mana.bgColor}`}
            >
              <span className="text-xl">{mana.display}</span>
              <span className="font-bold text-lg my-1">{player.manaPool[mana.symbol as keyof typeof player.manaPool]}</span>
              <button 
                className={`rounded-lg px-2 py-1 text-xs text-white transition-all duration-200 ${
                  player.manaPool[mana.symbol as keyof typeof player.manaPool] === 0 
                    ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                    : 'bg-gray-700 hover:bg-gray-600 cursor-pointer transform hover:scale-105 active:scale-95'
                }`}
                onClick={() => useMana(mana.symbol)}
                disabled={player.manaPool[mana.symbol as keyof typeof player.manaPool] === 0}
              >
                Use
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Player; 