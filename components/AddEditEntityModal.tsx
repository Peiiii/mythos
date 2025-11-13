
import React, { useState, useEffect } from 'react';
import { EntityType, WorldEntity } from '../types';
import { generateEntityDescription } from '../services/geminiService';
import { LoadingSpinner, SparklesIcon, XIcon } from './icons';

interface AddEditEntityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entity: WorldEntity) => void;
    entityToEdit?: WorldEntity | null;
}

export const AddEditEntityModal: React.FC<AddEditEntityModalProps> = ({ isOpen, onClose, onSave, entityToEdit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<EntityType>(EntityType.CHARACTER);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (entityToEdit) {
            setName(entityToEdit.name);
            setDescription(entityToEdit.description);
            setType(entityToEdit.type);
        } else {
            setName('');
            setDescription('');
            setType(EntityType.CHARACTER);
        }
        setError(null);
    }, [entityToEdit, isOpen]);

    if (!isOpen) return null;

    const handleFleshOut = async () => {
        if (!name.trim()) {
            setError('Please provide a name first.');
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const newDescription = await generateEntityDescription(name, type);
            setDescription(newDescription);
        } catch (err) {
            setError('Failed to generate description. The muses are silent.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        if (!name.trim() || !description.trim()) {
            setError('Name and description cannot be empty.');
            return;
        }
        onSave({
            id: entityToEdit ? entityToEdit.id : `${Date.now()}-${name}`,
            name,
            description,
            type,
            image: entityToEdit?.image || null,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 mx-auto my-8" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">{entityToEdit ? 'Edit' : 'Add'} Entity</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="entity-type" className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                        <select
                            id="entity-type"
                            value={type}
                            onChange={(e) => setType(e.target.value as EntityType)}
                            disabled={!!entityToEdit}
                            className="w-full bg-gray-700 text-gray-200 px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none disabled:opacity-50"
                        >
                            <option value={EntityType.CHARACTER}>Character</option>
                            <option value={EntityType.LOCATION}>Location</option>
                            <option value={EntityType.ITEM}>Item</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="entity-name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                        <input
                            id="entity-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={`e.g., Elara, the Shadow Weaver`}
                            className="w-full bg-gray-700 text-gray-200 placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="entity-description" className="block text-sm font-medium text-gray-300">Description</label>
                            <button
                                onClick={handleFleshOut}
                                disabled={isGenerating || !name.trim()}
                                className="flex items-center gap-2 px-3 py-1 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <LoadingSpinner /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-4 h-4" /> Flesh out with AI
                                    </>
                                )}
                            </button>
                        </div>
                        <textarea
                            id="entity-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            placeholder="Describe the entity..."
                            className="w-full bg-gray-700 text-gray-200 placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
                <div className="p-6 bg-gray-900/50 rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors">Save Entity</button>
                </div>
            </div>
        </div>
    );
};
