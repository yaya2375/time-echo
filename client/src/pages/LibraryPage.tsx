import { useEffect } from 'react';
import { usePersonaStore } from '../stores/usePersonaStore';
import PersonaList from '../components/persona/PersonaList';

export default function LibraryPage() {
  const { personas, isLoading, loadPersonas, deletePersona } = usePersonaStore();

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-sm font-medium text-wechat-text-secondary mb-4">所有分身</h2>
      {personas.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-sm text-wechat-text-secondary">还没有创建任何分身</p>
        </div>
      ) : (
        <PersonaList personas={personas} onDelete={deletePersona} loading={isLoading} />
      )}
    </div>
  );
}
