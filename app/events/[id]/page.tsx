'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDatabase, ref, get } from 'firebase/database';
import Image from 'next/image';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaMapMarkerAlt, FaMicrophone, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa';

import Sidebar from '@/components/Sidebar';
import Mobilenav from '@/components/Mobilenav';

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  speakers: string[];
  imageUrl: string;
};

const EventDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch event details from Firebase
  const fetchEvent = useCallback(async () => {
    try {
      if (!params?.id) return;
      const db = getDatabase();
      const eventRef = ref(db, `events/${params.id}`);
      const snapshot = await get(eventRef);

      if (snapshot.exists()) {
        setEvent({ ...snapshot.val(), id: snapshot.key! });
      } else {
        setEvent(null);
        toast.error('Event not found');
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to fetch event details');
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // Centered milky spinner while loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white/30 backdrop-blur-md">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Event Not Found</h2>
        <p className="text-lg text-gray-600 mb-6">
          We couldn’t find the event you were looking for. It might have been removed or the link might be incorrect.
        </p>
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          onClick={() => router.push('/events')}
        >
          View All Events
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Sidebar />
      <div className="max-w-3xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-bold mb-4 text-center text-blue-700 animate-fadeIn">
          {event.title}
        </h1>
        <p className="text-lg text-gray-600 text-center mb-4">
          <FaCalendarAlt className="inline mr-2 text-blue-700" />
          {new Date(event.date).toLocaleString()}
        </p>
        <div className="relative w-full h-64 mb-8 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={event.imageUrl || '/images/default-event.jpg'}
            alt={event.title || 'Event Image'}
            layout="fill"
            objectFit="cover"
            className="rounded-lg hover:scale-105 transition-transform duration-300"
          />
        </div>
        <p className="text-xl text-gray-800 mb-6 leading-relaxed animate-slideIn">{event.description}</p>

        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-2 text-red-950">
            <FaMicrophone className="inline mr-2" /> Speakers
          </h3>
          <ul>
            {event.speakers && event.speakers.length > 0 ? (
              event.speakers.map((speaker, idx) => (
                <li key={idx} className="text-lg text-gray-700 py-1 animate-slideInDelay">{speaker}</li>
              ))
            ) : (
              <span className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">No speakers available</span>
            )}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-2 text-blue-700">
            <FaMapMarkerAlt className="inline mr-2" /> Location
          </h3>
          <p className="text-lg text-gray-700 animate-slideIn">{event.location}</p>
        </div>

        <button
          className="bg-green-900 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-lg hover:shadow-xl mt-8 w-full animate-bounce"
          onClick={() => router.push(`/events/${event.id}/tickets`)}
        >
          <FaTicketAlt className="inline mr-2" /> Purchase Tickets
        </button>
      </div>

      <Mobilenav />
    </div>
  );
};

export default EventDetailPage;
