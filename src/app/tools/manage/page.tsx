'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/database';

export default function ManageTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    route: '',
    icon_url: '',
    enabled: true
  });
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    fetchTools();
  }, [user, router]);

  const fetchTools = async () => {
    try {
      const { data } = await supabase
        .from('tools')
        .select('*')
        .order('name');

      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const { error: submitError } = await supabase
        .from('tools')
        .insert([formData]);

      if (submitError) throw submitError;

      setFormData({
        name: '',
        description: '',
        route: '',
        icon_url: '',
        enabled: true
      });
      setShowForm(false);
      fetchTools();
    } catch (err) {
      setError('Failed to create tool');
      console.error(err);
    }
  };

  const handleToggleEnabled = async (tool: Tool) => {
    try {
      const { error: updateError } = await supabase
        .from('tools')
        .update({ enabled: !tool.enabled })
        .eq('id', tool.id);

      if (updateError) throw updateError;

      setTools(tools.map(t =>
        t.id === tool.id ? { ...t, enabled: !t.enabled } : t
      ));
    } catch (error) {
      console.error('Error updating tool:', error);
    }
  };

  const handleDelete = async (toolId: string) => {
    if (!window.confirm('Are you sure you want to delete this tool?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', toolId);

      if (error) throw error;

      setTools(tools.filter(tool => tool.id !== toolId));
    } catch (error) {
      console.error('Error deleting tool:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Manage Tools
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add New Tool'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900 p-4 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="route" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Route
              </label>
              <input
                type="text"
                id="route"
                value={formData.route}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="icon_url" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Icon URL
              </label>
              <input
                type="url"
                id="icon_url"
                value={formData.icon_url}
                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                Enabled
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Create Tool
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {tool.name}
                </h2>
                {tool.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {tool.description}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Route: /tools/{tool.route}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleEnabled(tool)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    tool.enabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}
                >
                  {tool.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  onClick={() => handleDelete(tool.id)}
                  className="px-3 py-1 text-sm font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {tools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No tools available. Click "Add New Tool" to create one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 