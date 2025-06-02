"use client";

import { baseUrl } from "@/utils/constant";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

type SpecialEvent = {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
};

export default function SpecialEventManagement() {
  const [events, setEvents] = useState<SpecialEvent[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<SpecialEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/special-event`);
      const data = await res.json();
      if (res.ok) setEvents(data.data || []);
      else setError("Failed to load events.");
    } catch {
      setError("Error fetching events.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Create new event
  const handleCreate = async () => {
    if (!image || !title.trim() || !content.trim()) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("image", image);

      const res = await fetch(`${baseUrl}/api/special-event`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setShowCreateModal(false);
        resetForm();
        fetchEvents();
      } else {
        setError("Failed to create event.");
      }
    } catch {
      setError("Error creating event.");
    } finally {
      setLoading(false);
    }
  };

  // Update existing event
  const handleUpdate = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      const res = await fetch(
        `${baseUrl}/api/special-event/${selectedEvent.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (res.ok) {
        setShowEditModal(false);
        setSelectedEvent(null);
        resetForm();
        fetchEvents();
      } else {
        setError("Failed to update event.");
      }
    } catch {
      setError("Error updating event.");
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const handleDelete = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/special-event/${selectedEvent.id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setShowDeleteModal(false);
        setSelectedEvent(null);
        fetchEvents();
      } else {
        setError("Failed to delete event.");
      }
    } catch {
      setError("Error deleting event.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImage(null);
    setError("");
  };

  const openEditModal = (event: SpecialEvent) => {
    setSelectedEvent(event);
    setTitle(event.title);
    setContent(event.content);
    setShowEditModal(true);
    setError("");
  };

  const openDeleteModal = (event: SpecialEvent) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
    setError("");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Special Events</h1>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={18} />
          Add Event
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white shadow rounded-lg p-4 border border-gray-200"
          >
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-40 object-cover rounded"
            />
            <h2 className="mt-2 font-semibold text-lg">{event.title}</h2>
            <p className="text-sm text-gray-600 mb-4">{event.content}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => openEditModal(event)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => openDeleteModal(event)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {showCreateModal ? "Add Event" : "Edit Event"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedEvent(null);
                  resetForm();
                }}
              >
                <X />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="block w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="block w-full border p-2 rounded"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedEvent(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={showCreateModal ? handleCreate : handleUpdate}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading
                    ? showCreateModal
                      ? "Saving..."
                      : "Updating..."
                    : showCreateModal
                    ? "Save"
                    : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">Delete Event</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedEvent(null);
                }}
              >
                <X />
              </button>
            </div>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedEvent.title}</strong>?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
