# Red Cottage Booking App

A family vacation home booking system for Red Cottage in Maine.

## Features

- **Booking System**: Add reservations with guest name, check-in, and check-out dates
- **Conflict Detection**: Automatically prevents overlapping reservations and displays warning messages
- **Visual Calendar**: Shows bookings for June through October with color-coded guests
- **Firestore Database**: All bookings are stored in Firebase Firestore
- **Automatic Color Assignment**: Each family member is assigned a unique color on the calendar

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Click on "Web" to add a web app to your project
4. Copy the Firebase configuration object

### 3. Configure Firebase

Open `src/firebase.js` and replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (or production mode with appropriate rules)
4. Select a location and click "Enable"

### 5. Configure Firestore Rules (Optional but Recommended)

In the Firestore Database section, go to "Rules" and update:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{booking} {
      allow read, write: if true;
    }
  }
}
```

**Note**: For production, you should implement proper security rules.

### 6. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

1. **Make a Reservation**:
   - Enter your name
   - Select check-in and check-out dates
   - Click "Book Reservation"

2. **View Bookings**:
   - The calendar displays all bookings for June through October
   - Each guest is assigned a unique color
   - Hover over a booked date to see the guest name

3. **Conflict Prevention**:
   - If you try to book dates that overlap with an existing reservation, you'll see an error message
   - The system will show you the conflicting reservation details

## Technology Stack

- **React** - Frontend framework
- **Vite** - Build tool and dev server
- **Firebase Firestore** - NoSQL database for storing bookings
- **CSS** - Custom styling

## Project Structure

```
src/
├── components/
│   ├── BookingForm.jsx       # Booking form component
│   ├── BookingForm.css        # Booking form styles
│   ├── Calendar.jsx           # Calendar display component
│   └── Calendar.css           # Calendar styles
├── firebase.js                # Firebase configuration
├── App.jsx                    # Main app component
├── App.css                    # Main app styles
├── index.css                  # Global styles
└── main.jsx                   # Entry point
```

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Deploying to Firebase Hosting (Optional)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

---

**Red Cottage** • Maine • Family Vacation Home
