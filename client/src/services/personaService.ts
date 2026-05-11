import http from './http';
import type { Persona, PersonaListItem, CreatePersonaInput, GeneratePersonaInput } from '@time-echo/shared';

export async function listPersonas(): Promise<PersonaListItem[]> {
  const res = await http.get('/personas');
  return res.data.data;
}

export async function getPersona(id: string): Promise<Persona> {
  const res = await http.get(`/personas/${id}`);
  return res.data.data;
}

export async function createPersona(input: CreatePersonaInput): Promise<Persona> {
  const res = await http.post('/personas', input);
  return res.data.data;
}

export async function updatePersonaLayer(id: string, layer: string, content: Record<string, unknown>): Promise<void> {
  await http.patch(`/personas/${id}`, { layer, content });
}

export async function generatePersona(id: string, input: GeneratePersonaInput): Promise<Persona> {
  const res = await http.post(`/personas/${id}/generate`, input);
  return res.data.data;
}

export async function deletePersona(id: string): Promise<void> {
  await http.delete(`/personas/${id}`);
}
