'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface DocType {
  id: string;
  name: string;
  description: string;
}

export default function DocTypesPage() {
  const [docTypes, setDocTypes] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchDocTypes();
  }, []);

  async function fetchDocTypes() {
    try {
      const { data, error } = await supabase
        .from('doc_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setDocTypes(data || []);
    } catch (error) {
      console.error('Error fetching doc types:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('doc_types')
        .insert([{ name: newName, description: newDescription }]);

      if (error) throw error;

      setNewName('');
      setNewDescription('');
      fetchDocTypes();
    } catch (error) {
      console.error('Error adding doc type:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this documentation type?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('doc_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchDocTypes();
    } catch (error) {
      console.error('Error deleting doc type:', error);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Documentation Types</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold">Add New Type</h2>
        <div>
          <Input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
        </div>
        <div>
          <Textarea
            placeholder="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Add Documentation Type</Button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Types</h2>
          <div className="space-y-4">
            {docTypes.map((docType) => (
              <div
                key={docType.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{docType.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {docType.description}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleDelete(docType.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 