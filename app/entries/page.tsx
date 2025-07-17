'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Plus, Search, Filter, Calendar, MapPin, Star, Edit, Trash2, AlertTriangle, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { IPhoto } from '@/models/JournalEntry';

interface Entry {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: {
    name: string;
  };
  trail: {
    difficulty: string;
    distance?: number;
  };
  rating: number;
  tags: string[];
  photos: IPhoto[];
}

export default function EntriesPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingEntry, setDeletingEntry] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<Entry | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(difficulty && { difficulty })
      });

      const response = await fetch(`/api/entries?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  }, [search, difficulty, page]);

  useEffect(() => {
    if (isSignedIn) {
      fetchEntries();
    }
  }, [isSignedIn, fetchEntries]);

  const handleDeleteClick = (entry: Entry) => {
    setEntryToDelete(entry);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    const entryId = entryToDelete._id;
    const entryTitle = entryToDelete.title;

    // Show a beautiful toast before confirmation
    const toastId = toast.loading(
      `Preparing to delete &quot;${entryTitle}&quot;...`,
      {
        style: {
          background: '#3b82f6',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      }
    );

    // Wait a moment for the toast to be visible
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dismiss the loading toast
    toast.dismiss(toastId);

    setDeletingEntry(entryId);
    setShowDeleteModal(false);
    setEntryToDelete(null);

    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the entry from the local state
        setEntries(entries.filter(entry => entry._id !== entryId));
        
        // Show success toast
        toast.success(`&quot;${entryTitle}&quot; has been deleted successfully!`, {
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      } else {
        toast.error('Failed to delete entry. Please try again.', {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry. Please try again.', {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } finally {
      setDeletingEntry(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setEntryToDelete(null);
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your journal</h2>
        <p className="text-gray-600 mb-6">Create an account to start documenting your hiking adventures.</p>
        <Link
          href="/"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Journal</h1>
            <p className="text-gray-600">
              Your hiking adventures and outdoor experiences
            </p>
          </div>
          <Link
            href="/entries/new"
            className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Entries List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No entries yet</h3>
            <p className="text-gray-600 mb-6">
              Start documenting your hiking adventures by creating your first entry.
            </p>
            <Link
              href="/entries/new"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Your First Entry
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 entry-title">
                        {entry.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < entry.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3" style={{ fontWeight: 500 }}>
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(entry.date).toLocaleDateString()}
                      <MapPin className="h-4 w-4 ml-3 mr-1" />
                      {entry.location.name}
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2 entry-description" style={{ fontWeight: 500 }}>
                      {entry.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        entry.trail.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        entry.trail.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        entry.trail.difficulty === 'hard' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {entry.trail.difficulty}
                      </span>
                      
                      {entry.trail.distance && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {entry.trail.distance} mi
                        </span>
                      )}
                      
                      {entry.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs" style={{ fontWeight: 500 }}>
                          {tag}
                        </span>
                      ))}
                      
                      {entry.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs" style={{ fontWeight: 500 }}>
                          +{entry.tags.length - 3} more
                        </span>
                      )}

                      {entry.photos && entry.photos.length > 0 && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold flex items-center">
                          <Camera className="h-3 w-3 mr-1" />
                          {entry.photos.length} photo{entry.photos.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:ml-4 flex flex-col space-y-2">
                    <Link
                      href={`/entries/${entry._id}`}
                      className="text-green-600 hover:text-green-700 font-semibold"
                    >
                      View Details →
                    </Link>
                    <div className="flex space-x-2">
                      <Link
                        href={`/entries/${entry._id}/edit`}
                        className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(entry)}
                        disabled={deletingEntry === entry._id}
                        className="flex items-center text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deletingEntry === entry._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && entryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Entry
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete <span className="font-semibold text-gray-900">&quot;{entryToDelete.title}&quot;</span>? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 