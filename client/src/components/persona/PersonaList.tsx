import type { PersonaListItem } from '@time-echo/shared';
import PersonaCard from './PersonaCard';

interface PersonaListProps {
  personas: PersonaListItem[];
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export default function PersonaList({ personas, onDelete, loading }: PersonaListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (personas.length === 0) return null;

  return (
    <div className="space-y-3">
      {personas.map((p) => (
        <PersonaCard key={p.id} persona={p} onDelete={onDelete} />
      ))}
    </div>
  );
}
