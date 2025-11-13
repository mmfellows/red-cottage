import { useState } from 'react';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import './BookingForm.css';

function BookingForm({ onBookingAdded }) {
  const [guestName, setGuestName] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [isPossibleStay, setIsPossibleStay] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState(null);

  // Check if two date ranges overlap
  const datesOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };

  // Check for conflicts with existing reservations
  const checkForConflicts = async (newCheckIn, newCheckOut) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef);
      const querySnapshot = await getDocs(q);

      // Parse new dates as local dates
      const [newStartYear, newStartMonth, newStartDay] = newCheckIn.split('-').map(Number);
      const [newEndYear, newEndMonth, newEndDay] = newCheckOut.split('-').map(Number);
      const newStart = new Date(newStartYear, newStartMonth - 1, newStartDay);
      const newEnd = new Date(newEndYear, newEndMonth - 1, newEndDay);

      for (const doc of querySnapshot.docs) {
        const booking = doc.data();

        // Parse existing dates as local dates
        const [existingStartYear, existingStartMonth, existingStartDay] = booking.checkIn.split('-').map(Number);
        const [existingEndYear, existingEndMonth, existingEndDay] = booking.checkOut.split('-').map(Number);
        const existingStart = new Date(existingStartYear, existingStartMonth - 1, existingStartDay);
        const existingEnd = new Date(existingEndYear, existingEndMonth - 1, existingEndDay);

        if (datesOverlap(newStart, newEnd, existingStart, existingEnd)) {
          return {
            conflict: true,
            details: {
              guest: booking.guestName,
              checkIn: booking.checkIn,
              checkOut: booking.checkOut
            }
          };
        }
      }

      return { conflict: false };
    } catch (err) {
      console.error('Error checking conflicts:', err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setConflict(null);

    // Validation
    if (!guestName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!checkIn || !checkOut) {
      setError('Please select both check-in and check-out dates');
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      setError('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);

    try {
      // Check for conflicts
      const conflictResult = await checkForConflicts(checkIn, checkOut);

      if (conflictResult.conflict) {
        setConflict(conflictResult.details);
        setError(
          `Conflict detected! ${conflictResult.details.guest} has already booked ` +
          `from ${new Date(conflictResult.details.checkIn).toLocaleDateString()} ` +
          `to ${new Date(conflictResult.details.checkOut).toLocaleDateString()}`
        );
        setLoading(false);
        return;
      }

      // Add booking to Firestore
      await addDoc(collection(db, 'bookings'), {
        guestName: guestName.trim(),
        checkIn,
        checkOut,
        isPossibleStay: isPossibleStay,
        createdAt: new Date().toISOString()
      });

      setSuccess('Reservation created successfully!');
      setGuestName('');
      setCheckIn('');
      setCheckOut('');
      setIsPossibleStay(false);

      // Notify parent component to refresh data
      if (onBookingAdded) {
        onBookingAdded();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <h2>Book Your Stay at Red Cottage</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="guestName">Your Name</label>
          <input
            type="text"
            id="guestName"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter your name"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="checkIn">Check-In Date</label>
          <input
            type="date"
            id="checkIn"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="checkOut">Check-Out Date</label>
          <input
            type="date"
            id="checkOut"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isPossibleStay}
              onChange={(e) => setIsPossibleStay(e.target.checked)}
              disabled={loading}
            />
            <span>Mark as Possible Stay</span>
          </label>
          <p className="checkbox-hint">Possible stays appear with a dotted outline and lighter color on the calendar</p>
        </div>

        {error && (
          <div className="message error">{error}</div>
        )}

        {success && (
          <div className="message success">{success}</div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Checking availability...' : 'Book Reservation'}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;
