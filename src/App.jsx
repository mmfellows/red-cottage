import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import BookingForm from './components/BookingForm';
import Calendar from './components/Calendar';
import './App.css';

function App() {
  const [bookings, setBookings] = useState([]);
  const [userColors, setUserColors] = useState({});
  const [loading, setLoading] = useState(true);

  // Predefined color palette for different users
  const colorPalette = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B195', // Peach
    '#6C5B7B', // Plum
  ];

  // Assign colors to users
  const assignUserColors = (bookingsList) => {
    const colors = {};
    const uniqueUsers = [...new Set(bookingsList.map(b => b.guestName))];

    uniqueUsers.forEach((user, index) => {
      colors[user] = colorPalette[index % colorPalette.length];
    });

    return colors;
  };

  // Fetch bookings from Firestore
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, orderBy('checkIn', 'asc'));
      const querySnapshot = await getDocs(q);

      const bookingsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setBookings(bookingsList);
      setUserColors(assignUserColors(bookingsList));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏡 Red Cottage Bookings</h1>
        <p>Family Vacation Home - Maine</p>
      </header>

      <main className="app-main">
        <BookingForm onBookingAdded={fetchBookings} />

        {loading ? (
          <div className="loading">Loading bookings...</div>
        ) : (
          <Calendar bookings={bookings} userColors={userColors} onBookingUpdated={fetchBookings} />
        )}
      </main>

      <footer className="app-footer">
        <p>Red Cottage • Maine • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
