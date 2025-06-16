"use client";

import { baseUrl } from "@/utils/constant";
import { useEffect, useState } from "react";

type SpecialEvent = {
  id: number;
  title: string;
  content: string;
  image: string;
};

export default function SpecialEventsDashboard() {
  const [events, setEvents] = useState<SpecialEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValidImageUrl = (url: string) => {
    // Enhanced validation to handle both localhost and remote URLs
    return (
      typeof url === "string" &&
      url.trim() !== "" &&
      (/^https?:\/\/.+\.(jpeg|jpg|gif|png|webp|bmp|svg)(\?.*)?$/i.test(url) ||
        /^https?:\/\/.+\/uploads\/.+\.(jpeg|jpg|gif|png|webp|bmp|svg)(\?.*)?$/i.test(
          url
        ))
    );
  };

  // Function to normalize image URLs
  const normalizeImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";

    // If it's a localhost URL and we're not on localhost, replace with baseUrl
    // This handles cases where dev backend URLs are stored in DB but frontend is deployed
    if (
      imageUrl.includes("localhost:5001") &&
      !window.location.href.includes("localhost")
    ) {
      return imageUrl.replace("http://localhost:5001", baseUrl);
    }

    return imageUrl;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/special-event`);
        const data = await res.json();
        if (data.success) {
          console.log("API response data (raw):", data.data);
          // Normalize image URLs when setting events
          const normalizedEvents = data.data.map((event: SpecialEvent) => ({
            ...event,
            image: normalizeImageUrl(event.image),
          }));
          setEvents(normalizedEvents);
        } else {
          alert(data.message || "Failed to fetch events.");
        }
      } catch (error) {
        console.error("Fetch events error:", error);
        alert("Error fetching events.");
      }
    };
    fetchEvents();
  }, []);

  // Enhanced debugging for the events state and image URLs
  useEffect(() => {
    console.log("=== DEBUGGING EVENTS STATE ===");
    console.log("Current events state (after fetch/update):", events);
    console.log("baseUrl:", baseUrl);
    console.log("window.location.href:", window.location.href);

    if (events.length > 0) {
      events.forEach((event, index) => {
        console.log(`\n--- Event ${index} (ID: ${event.id}) ---`);
        console.log(`  Title: ${event.title}`);
        console.log(`  Content: ${event.content}`);
        console.log(`  Raw Image URL: "${event.image}"`);
        console.log(`  Normalized URL: "${normalizeImageUrl(event.image)}"`);
        console.log(
          `  URL Type: ${
            event.image.includes("localhost") ? "localhost" : "remote"
          }`
        );
        console.log(
          `  isValidImageUrl result: ${isValidImageUrl(event.image)}`
        );

        // Test if URL is accessible (only if it's a valid-looking URL)
        if (isValidImageUrl(event.image)) {
          const testImg = new Image();
          testImg.onload = () =>
            console.log(`✅ Image ${event.id} is accessible`);
          testImg.onerror = () =>
            console.log(`❌ Image ${event.id} failed to load`);
          testImg.src = event.image;
        } else {
          console.log(`ℹ️ Image ${event.id} not tested as URL is invalid.`);
        }
      });
    } else {
      console.log("Events array is empty.");
    }
    console.log("=== END DEBUGGING ===\n");
  }, [events]);

  const handleSubmit = async () => {
    if (!title || !content || !image) {
      alert("Please fill all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("image", image);

    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/special-event`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert("Event created successfully!");
        setShowForm(false);
        setTitle("");
        setContent("");
        setImage(null);

        // Normalize the new event's image URL before adding to state
        const normalizedEvent = {
          ...data.data,
          image: normalizeImageUrl(data.data.image),
        };
        setEvents((prev) => [normalizedEvent, ...prev]);
      } else {
        alert(data.message || "Failed to create event.");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error creating event.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    eventId: number,
    imageUrl: string
  ) => {
    const target = e.target as HTMLImageElement;
    console.error(`❌ Image loading failed for event ${eventId}:`);
    console.error(`  URL: ${imageUrl}`);
    console.error(`  Error:`, e);

    // Provide a generic broken image placeholder
    target.onerror = null; // Prevent infinite loop if the fallback also fails
    target.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e0e0e0'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-size='12' fill='%23888'%3EImage Error%3C/text%3E%3C/svg%3E";
  };

  return (
    <div className="p-4 md:px-2 w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <h1 className="text-black text-xl font-bold">Special Events</h1>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={() => setShowForm(true)}
        >
          Create Special Events
        </button>
      </div>

      {/* Debug Section - Keep this during development to quickly identify URL issues */}
      {events.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
          <h3 className="font-bold text-yellow-800 mb-2">
            🐛 Debug Info (Helpful for diagnosing image loading)
          </h3>
          <div className="text-sm text-yellow-700">
            <p>
              <strong>Total Events:</strong> {events.length}
            </p>
            <p>
              <strong>Base URL (from constant):</strong> {baseUrl}
            </p>
            <p>
              <strong>Current Frontend URL:</strong> {window.location.href}
            </p>
            <p>
              <strong>Sample Image URLs (first 3, as seen by frontend):</strong>
            </p>
            <ul className="list-disc list-inside ml-4">
              {events.slice(0, 3).map((event) => (
                <li key={event.id} className="break-all">
                  Event {event.id}: {event.image}
                  <br />
                  <span className="text-xs">
                    Valid Regex: {isValidImageUrl(event.image) ? "✅" : "❌"} |
                    Normalized: {normalizeImageUrl(event.image)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Create Event Form */}
      {showForm && (
        <div className="bg-white border border-gray-300 p-4 rounded-md mb-6 space-y-4 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">
            New Special Event
          </h2>

          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-700">Title</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-700">Content</label>
            <textarea
              className="border border-gray-300 rounded px-3 py-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-700">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Submit"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-md shadow p-4 border border-purple-200 relative overflow-hidden flex flex-col h-[200px]"
          >
            {/* View Button */}
            <div className="absolute top-2 right-2 z-10">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded-md text-xs">
                View Details
              </button>
            </div>

            {/* Event info */}
            <h4 className="text-sm font-semibold text-gray-700 mb-1 z-10">
              {event.title}
            </h4>
            <p className="text-xl font-bold text-indigo-700 z-10">{event.id}</p>

            {/* Image container with blanking logic and error handling */}
            <div className="absolute bottom-3 left-3 w-38 h-26 rounded-md bg-gray-300 overflow-hidden border-2 border-red-500">
              {/* Debug overlay for the image container */}
              <div className="absolute top-0 left-0 text-xs text-red-600 bg-white p-1 z-20 opacity-80">
                Debug: ID-{event.id}
              </div>

              {event.image ? (
                isValidImageUrl(event.image) ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageError(e, event.id, event.image)}
                    onLoad={() =>
                      console.log(
                        `✅ Image loaded successfully for event ${event.id}: ${event.image}`
                      )
                    }
                  />
                ) : (
                  // Case: URL exists but is syntactically invalid/unrecognized
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-xs font-bold text-center p-1">
                      Invalid URL (Blank)
                    </span>
                  </div>
                )
              ) : (
                // Case: Image URL is empty or null
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold text-center p-1">
                    No Image URL (Blank)
                  </span>
                </div>
              )}
            </div>

            {/* Bottom right content */}
            <div className="absolute bottom-2 right-2 z-10 text-right">
              <p className="text-gray-600 text-xs">{event.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
