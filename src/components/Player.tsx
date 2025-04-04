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
  { symbol: 'W', color: 'white', display: '☀️', bgColor: 'bg-yellow-50' },
  { symbol: 'U', color: 'blue', display: '💧', bgColor: 'bg-blue-100' },
  { symbol: 'B', color: 'black', display: '💀', bgColor: 'bg-gray-300' },
  { symbol: 'R', color: 'red', display: '🔥', bgColor: 'bg-red-100' },
  { symbol: 'G', color: 'green', display: '🌳', bgColor: 'bg-green-100' },
  { symbol: 'C', color: 'colorless', display: '💎', bgColor: 'bg-gray-200' }
];

const LAND_TYPES: LandType[] = [
  { type: 'Plains', produces: 'W', symbol: '☀️', bgColor: 'bg-yellow-50' },
  { type: 'Island', produces: 'U', symbol: '💧', bgColor: 'bg-blue-100' },
  { type: 'Swamp', produces: 'B', symbol: '💀', bgColor: 'bg-gray-300' },
  { type: 'Mountain', produces: 'R', symbol: '🔥', bgColor: 'bg-red-100' },
  { type: 'Forest', produces: 'G', symbol: '🌳', bgColor: 'bg-green-100' },
  { type: 'Wastes', produces: 'C', symbol: '💎', bgColor: 'bg-gray-200' }
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
    <div className={`bg-gray-100 rounded-lg shadow-md p-4 w-80 transition-all duration-300 ${isActive ? 'border-2 border-yellow-400 bg-yellow-50' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        {nameEditing ? (
          <div className="w-full">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={finishNameEdit}
              onKeyPress={(e) => e.key === 'Enter' && finishNameEdit()}
              autoFocus
              className="text-xl font-bold w-[85%] p-1 border border-gray-300 rounded"
            />
          </div>
        ) : (
          <h2 
            onClick={() => setNameEditing(true)}
            className="text-xl font-bold cursor-pointer"
          >
            {player.name}
          </h2>
        )}
        <button 
          className="bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xl"
          onClick={onRemove}
        >
          ×
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 mb-5">
        <button 
          onClick={() => updateLife(-1)}
          className="bg-gray-800 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center"
        >
          -
        </button>
        <span className="text-2xl font-bold min-w-[60px] text-center">{player.life}</span>
        <button 
          onClick={() => updateLife(1)}
          className="bg-gray-800 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center"
        >
          +
        </button>
      </div>

      <div className="mb-5">
        <h3 className="text-center font-bold mb-2">Lands</h3>
        <div className="flex flex-wrap justify-center gap-1 mb-4">
          {LAND_TYPES.map(land => (
            <button 
              key={land.type} 
              onClick={() => addLand(land)}
              className={`border border-gray-300 rounded p-1 text-xl cursor-pointer ${land.bgColor}`}
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
                className={`w-10 h-16 border border-gray-500 rounded flex items-center justify-center relative text-2xl cursor-pointer bg-white ${land.tapped ? 'transform rotate-90 bg-gray-200' : ''} transition-transform duration-300`}
                onClick={() => toggleLand(land.id)}
              >
                {landType?.symbol}
                <button 
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white border-none rounded-full text-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
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

      <div>
        <h3 className="text-center font-bold mb-2">Mana Pool</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {MANA_TYPES.map(mana => (
            <div 
              key={mana.symbol} 
              className={`flex flex-col items-center border border-gray-300 rounded p-1 min-w-[40px] ${mana.bgColor}`}
            >
              <span className="text-xl">{mana.display}</span>
              <span className="font-bold text-lg my-1">{player.manaPool[mana.symbol as keyof typeof player.manaPool]}</span>
              <button 
                className={`bg-gray-800 text-white rounded px-2 py-1 text-xs ${player.manaPool[mana.symbol as keyof typeof player.manaPool] === 0 ? 'bg-gray-500 cursor-not-allowed' : 'cursor-pointer'}`}
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