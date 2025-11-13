import { useState, useEffect } from 'react';
import { doc, updateDoc, deleteDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import './EditBookingModal.css';

function EditBookingModal({ booking, onClose, onBookingUpdated, userColor }) {
  const [guestName, setGuestName] = useState(booking.guestName);
  const [checkIn, setCheckIn] = useState(booking.checkIn);
  const [checkOut, setCheckOut] = useState(booking.checkOut);
  const [isPossibleStay, setIsPossibleStay] = useState(booking.isPossibleStay || false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setGuestName(booking.guestName);
    setCheckIn(booking.checkIn);
    setCheckOut(booking.checkOut);
    setIsPossibleStay(booking.isPossibleStay || false);
  }, [booking]);

  // Check if two date ranges overlap
  const datesOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };

  // Check for conflicts with other reservations (excluding current booking)
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
        // Skip the current booking being edited
        if (doc.id === booking.id) continue;

        const existingBooking = doc.data();

        // Parse existing dates as local dates
        const [existingStartYear, existingStartMonth, existingStartDay] = existingBooking.checkIn.split('-').map(Number);
        const [existingEndYear, existingEndMonth, existingEndDay] = existingBooking.checkOut.split('-').map(Number);
        const existingStart = new Date(existingStartYear, existingStartMonth - 1, existingStartDay);
        const existingEnd = new Date(existingEndYear, existingEndMonth - 1, existingEndDay);

        if (datesOverlap(newStart, newEnd, existingStart, existingEnd)) {
          return {
            conflict: true,
            details: {
              guest: existingBooking.guestName,
              checkIn: existingBooking.checkIn,
              checkOut: existingBooking.checkOut
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!guestName.trim()) {
      setError('Please enter a name');
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
        // Parse dates as local dates to avoid timezone shifts
        const [conflictInYear, conflictInMonth, conflictInDay] = conflictResult.details.checkIn.split('-').map(Number);
        const [conflictOutYear, conflictOutMonth, conflictOutDay] = conflictResult.details.checkOut.split('-').map(Number);
        const conflictCheckIn = new Date(conflictInYear, conflictInMonth - 1, conflictInDay);
        const conflictCheckOut = new Date(conflictOutYear, conflictOutMonth - 1, conflictOutDay);

        setError(
          `Conflict detected! ${conflictResult.details.guest} has already booked ` +
          `from ${conflictCheckIn.toLocaleDateString()} ` +
          `to ${conflictCheckOut.toLocaleDateString()}`
        );
        setLoading(false);
        return;
      }

      // Update booking in Firestore
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        guestName: guestName.trim(),
        checkIn,
        checkOut,
        isPossibleStay: isPossibleStay,
        updatedAt: new Date().toISOString()
      });

      onBookingUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating booking:', err);
      setError('Failed to update reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${booking.guestName}'s reservation?`)) {
      return;
    }

    setLoading(true);

    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      await deleteDoc(bookingRef);
      onBookingUpdated();
      onClose();
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError('Failed to delete reservation. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderLeftColor: userColor }}>
          <h2>Edit Reservation</h2>
          <button className="close-button" onClick={onClose} disabled={loading}>
            &times;
          </button>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label htmlFor="edit-guestName">Guest Name</label>
            <input
              type="text"
              id="edit-guestName"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter guest name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-checkIn">Check-In Date</label>
            <input
              type="date"
              id="edit-checkIn"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-checkOut">Check-Out Date</label>
            <input
              type="date"
              id="edit-checkOut"
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

          <div className="modal-actions">
            <button
              type="button"
              className="delete-button"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Reservation
            </button>
            <div className="action-buttons">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBookingModal;
