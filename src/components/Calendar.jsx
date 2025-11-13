import { useState, useEffect } from 'react';
import EditBookingModal from './EditBookingModal';
import './Calendar.css';

function Calendar({ bookings, userColors, onBookingUpdated }) {
  const [editingBooking, setEditingBooking] = useState(null);
  // Determine which year to show
  // If we're past October, show next year's season
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();
  const displayYear = currentMonth >= 10 ? currentYear + 1 : currentYear; // If November (10) or later, show next year

  const months = [
    { name: 'June', number: 5 },
    { name: 'July', number: 6 },
    { name: 'August', number: 7 },
    { name: 'September', number: 8 },
    { name: 'October', number: 9 }
  ];

  // Get the bookings for a specific date
  const getBookingsForDate = (date) => {
    return bookings.filter(booking => {
      // Parse date strings as local dates (YYYY-MM-DD format)
      const [checkInYear, checkInMonth, checkInDay] = booking.checkIn.split('-').map(Number);
      const [checkOutYear, checkOutMonth, checkOutDay] = booking.checkOut.split('-').map(Number);

      const checkIn = new Date(checkInYear, checkInMonth - 1, checkInDay);
      const checkOut = new Date(checkOutYear, checkOutMonth - 1, checkOutDay);
      const currentDate = new Date(date);

      // Set all times to midnight for accurate comparison
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      // Include both check-in and check-out dates
      return currentDate >= checkIn && currentDate <= checkOut;
    });
  };

  // Check if a date is a check-in date for a booking
  const isCheckInDate = (date, booking) => {
    const [checkInYear, checkInMonth, checkInDay] = booking.checkIn.split('-').map(Number);
    const checkIn = new Date(checkInYear, checkInMonth - 1, checkInDay);
    const currentDate = new Date(date);

    checkIn.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    return currentDate.getTime() === checkIn.getTime();
  };

  // Check if a date is a check-out date for a booking
  const isCheckOutDate = (date, booking) => {
    const [checkOutYear, checkOutMonth, checkOutDay] = booking.checkOut.split('-').map(Number);
    const checkOut = new Date(checkOutYear, checkOutMonth - 1, checkOutDay);
    const currentDate = new Date(date);

    checkOut.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    return currentDate.getTime() === checkOut.getTime();
  };

  // Generate calendar days for a month
  const generateMonthDays = (year, monthNumber) => {
    const firstDay = new Date(year, monthNumber, 1);
    const lastDay = new Date(year, monthNumber + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add the actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // Get all bookings for a specific guest
  const getGuestBookings = (guestName) => {
    return bookings
      .filter(booking => booking.guestName === guestName)
      .map(booking => ({
        checkIn: new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        checkOut: new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isPossibleStay: booking.isPossibleStay || false
      }));
  };

  // Handle clicking on a guest to edit their booking
  const handleGuestClick = (guestName) => {
    const guestBooking = bookings.find(booking => booking.guestName === guestName);
    if (guestBooking) {
      setEditingBooking(guestBooking);
    }
  };

  return (
    <div className="calendar-container">
      <h2>Red Cottage Booking Calendar</h2>

      {/* Legend */}
      {Object.keys(userColors).length > 0 && (
        <div className="calendar-legend">
          <h3>Guests:</h3>
          <div className="legend-items">
            {Object.entries(userColors).map(([name, color]) => {
              const guestBookingDates = getGuestBookings(name);
              return (
                <div
                  key={name}
                  className="legend-item clickable"
                  onClick={() => handleGuestClick(name)}
                  title="Click to edit booking"
                >
                  <span
                    className="legend-color"
                    style={{ backgroundColor: color }}
                  ></span>
                  <div className="legend-info">
                    <span className="guest-name-legend">{name}</span>
                    <div className="booking-dates">
                      {guestBookingDates.map((dates, idx) => (
                        <span key={idx} className="date-range">
                          {dates.checkIn} - {dates.checkOut}
                          {dates.isPossibleStay && <span className="possible-label"> (Possible)</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="calendar-months">
        {months.map(month => {
          const days = generateMonthDays(displayYear, month.number);

          return (
            <div key={month.name} className="month-container">
              <h3>{month.name} {displayYear}</h3>
              <div className="calendar-grid">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="day-header">{day}</div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                  }

                  const date = new Date(displayYear, month.number, day);
                  const dateBookings = getBookingsForDate(date);
                  const hasBooking = dateBookings.length > 0;
                  const booking = dateBookings[0]; // Get first booking for this date

                  const isCheckIn = hasBooking && booking && isCheckInDate(date, booking);
                  const isCheckOut = hasBooking && booking && isCheckOutDate(date, booking);
                  const isPossible = hasBooking && booking && booking.isPossibleStay;

                  // Helper function to lighten a hex color
                  const lightenColor = (hex, percent = 50) => {
                    const num = parseInt(hex.replace('#', ''), 16);
                    const r = Math.min(255, Math.floor((num >> 16) + ((255 - (num >> 16)) * percent / 100)));
                    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + ((255 - ((num >> 8) & 0x00FF)) * percent / 100)));
                    const b = Math.min(255, Math.floor((num & 0x0000FF) + ((255 - (num & 0x0000FF)) * percent / 100)));
                    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                  };

                  const backgroundColor = hasBooking && booking
                    ? (isPossible
                        ? lightenColor(userColors[booking.guestName] || '#ddd', 60)
                        : userColors[booking.guestName] || '#ddd')
                    : 'transparent';

                  return (
                    <div
                      key={day}
                      className={`calendar-day ${hasBooking ? 'booked' : ''} ${isPossible ? 'possible-stay' : ''} ${isCheckIn ? 'check-in' : ''} ${isCheckOut ? 'check-out' : ''}`}
                      style={{
                        backgroundColor: backgroundColor
                      }}
                      title={hasBooking && booking ? `${booking.guestName}${isPossible ? ' (Possible Stay)' : ''}` : ''}
                    >
                      <span className="day-number">{day}</span>
                      {hasBooking && booking && (
                        <>
                          <span className="guest-name">{booking.guestName}</span>
                          {isCheckIn && <span className="date-label">Check In</span>}
                          {isCheckOut && <span className="date-label">Check Out</span>}
                        </>
                      )}
                    </div>
                  );

                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Booking Modal */}
      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          userColor={userColors[editingBooking.guestName]}
          onClose={() => setEditingBooking(null)}
          onBookingUpdated={onBookingUpdated}
        />
      )}
    </div>
  );
}

export default Calendar;
