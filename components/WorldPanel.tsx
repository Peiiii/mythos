
import React, { useState } from 'react';
import { WorldEntity, EntityType } from '../types';
import { UsersIcon, MapPinIcon, BoxIcon, PlusIcon, ImageIcon, EyeIcon } from './icons';

interface WorldPanelProps {
    entities: WorldEntity[];
    onAddEntity: () => void;
    onEditEntity: (entity: WorldEntity) => void;
    onVisualize: (entity: WorldEntity) => void;
}

const EntityCard: React.FC<{ entity: WorldEntity; onEdit: () => void; onVisualize: () => void; }> = ({ entity, onEdit, onVisualize }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div 
            className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-cyan-400 transition-all duration-300 relative group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onEdit}
        >
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-white pr-10">{entity.name}</h3>
                {entity.image && <EyeIcon className="w-5 h-5 text-sky-400 flex-shrink-0" />}
            </div>
            <p className="text-gray-400 text-sm mt-2 line-clamp-3">{entity.description}</p>
             {isHovered && !entity.image && (
                <button
                    onClick={(e) => { e.stopPropagation(); onVisualize(); }}
                    className="absolute top-2 right-2 p-2 bg-gray-700 rounded-full text-amber-400 hover:bg-gray-600 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title={`Visualize ${entity.name}`}
                >
                    <ImageIcon className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};


const EntitySection: React.FC<{ title: string; icon: React.ReactNode; entities: WorldEntity[]; onEditEntity: (entity: WorldEntity) => void; onVisualize: (entity: WorldEntity) => void; }> = ({ title, icon, entities, onEditEntity, onVisualize }) => (
    <div>
        <h3 className="text-xl font-bold text-cyan-300/80 mb-3 flex items-center gap-2">{icon} {title}</h3>
        {entities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entities.map(e => <EntityCard key={e.id} entity={e} onEdit={() => onEditEntity(e)} onVisualize={() => onVisualize(e)} />)}
            </div>
        ) : (
            <p className="text-gray-500 italic text-center py-4 border-2 border-dashed border-gray-700 rounded-lg">No {title.toLowerCase()} added yet.</p>
        )}
    </div>
);


export const WorldPanel: React.FC<WorldPanelProps> = ({ entities, onAddEntity, onEditEntity, onVisualize }) => {
    const characters = entities.filter(e => e.type === EntityType.CHARACTER);
    const locations = entities.filter(e => e.type === EntityType.LOCATION);
    const items = entities.filter(e => e.type === EntityType.ITEM);

    return (
        <div className="flex-grow flex flex-col h-full bg-gray-800/60 p-4 rounded-b-lg rounded-tr-lg">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-white">World Bible</h2>
                <button 
                    onClick={onAddEntity}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors duration-200"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Entity
                </button>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-8">
                <EntitySection 
                    title="Characters" 
                    icon={<UsersIcon className="w-6 h-6" />} 
                    entities={characters}
                    onEditEntity={onEditEntity}
                    onVisualize={onVisualize}
                />
                <EntitySection 
                    title="Locations" 
                    icon={<MapPinIcon className="w-6 h-6" />}
                    entities={locations}
                    onEditEntity={onEditEntity}
                    onVisualize={onVisualize}
                />
                <EntitySection 
                    title="Items" 
                    icon={<BoxIcon className="w-6 h-6" />}
                    entities={items}
                    onEditEntity={onEditEntity}
                    onVisualize={onVisualize}
                />
            </div>
        </div>
    );
};
