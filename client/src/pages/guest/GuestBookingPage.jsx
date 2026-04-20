import { CalendarCheck2, Clock4 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client";
import SectionCard from "../../components/ui/SectionCard";
import { useAuth } from "../../context/AuthContext";

const initialBookingState = {
  restaurant: "",
  table: "",
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  bookingDate: "",
  timeSlot: "",
  guestCount: 2,
  occasion: "",
  specialRequest: "",
};

const initialReservationState = {
  restaurant: "",
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  reservationDate: "",
  timeSlot: "",
  guestCount: 2,
  areaPreference: "",
  specialRequest: "",
};

const getBookingDefaults = (user) => ({
  ...initialBookingState,
  guestName: user?.name || "",
  guestEmail: user?.email || "",
  guestPhone: user?.phone || "",
});

const getReservationDefaults = (user) => ({
  ...initialReservationState,
  guestName: user?.name || "",
  guestEmail: user?.email || "",
  guestPhone: user?.phone || "",
});

const GuestBookingPage = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [tables, setTables] = useState([]);
  const [bookingForm, setBookingForm] = useState(getBookingDefaults(user));
  const [reservationForm, setReservationForm] = useState(getReservationDefaults(user));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const [restaurantResponse, tableResponse] = await Promise.all([api.get("/restaurants"), api.get("/tables")]);
      setRestaurants(restaurantResponse.data);
      setTables(tableResponse.data);
    };

    loadData().catch(() => setError("Unable to load restaurants and tables for booking."));
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setBookingForm((current) => ({ ...getBookingDefaults(user), ...current }));
    setReservationForm((current) => ({ ...getReservationDefaults(user), ...current }));
  }, [user]);

  const availableTables = useMemo(
    () =>
      tables.filter(
        (table) => (!bookingForm.restaurant || String(table.restaurant?._id || table.restaurant) === String(bookingForm.restaurant)) && table.isAvailable
      ),
    [bookingForm.restaurant, tables]
  );

  const handleBookingChange = (event) => {
    const { name, value } = event.target;
    setBookingForm((current) => ({ ...current, [name]: value }));
  };

  const handleReservationChange = (event) => {
    const { name, value } = event.target;
    setReservationForm((current) => ({ ...current, [name]: value }));
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/bookings", { ...bookingForm, status: "pending", source: "web", guestCount: Number(bookingForm.guestCount) });
      setMessage("Table booking submitted successfully. Demo entry created in the booking module.");
      setBookingForm(getBookingDefaults(user));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit booking.");
    }
  };

  const submitReservation = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/reservations", {
        ...reservationForm,
        status: "pending",
        guestCount: Number(reservationForm.guestCount),
      });
      setMessage("Reservation submitted successfully. Demo entry created in the reservation module.");
      setReservationForm(getReservationDefaults(user));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit reservation.");
    }
  };

  return (
    <section className="px-6 py-12 md:px-10 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
            Booking Module
          </div>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Book Tables and Manage Reservations</h1>
          <p className="mx-auto mt-4 max-w-3xl text-slate-300">
            A clean, responsive guest-facing booking flow connected to the admin booking and reservation dashboards.
          </p>
          {user?.role === "guest" ? (
            <Link to="/my-activity" className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
              Manage My Bookings and Reservations
            </Link>
          ) : null}
        </div>

        {message ? <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{message}</div> : null}
        {error ? <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Table Booking"
            subtitle="Choose a restaurant, date, and table for a guest booking entry."
            action={
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <CalendarCheck2 className="h-5 w-5" />
              </div>
            }
          >
            <form onSubmit={submitBooking} className="grid gap-4 md:grid-cols-2">
              <select name="restaurant" value={bookingForm.restaurant} onChange={handleBookingChange} className="input-shell">
                <option value="">Select restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
              <select name="table" value={bookingForm.table} onChange={handleBookingChange} className="input-shell">
                <option value="">Auto-assign or choose table</option>
                {availableTables.map((table) => (
                  <option key={table._id} value={table._id}>
                    {table.tableNumber} - {table.capacity} seats
                  </option>
                ))}
              </select>
              <input name="guestName" value={bookingForm.guestName} onChange={handleBookingChange} className="input-shell" placeholder="Guest name" />
              <input name="guestEmail" type="email" value={bookingForm.guestEmail} onChange={handleBookingChange} className="input-shell" placeholder="Guest email" />
              <input name="guestPhone" value={bookingForm.guestPhone} onChange={handleBookingChange} className="input-shell" placeholder="Phone number" />
              <input name="guestCount" type="number" value={bookingForm.guestCount} onChange={handleBookingChange} className="input-shell" placeholder="Guest count" />
              <input name="bookingDate" type="date" value={bookingForm.bookingDate} onChange={handleBookingChange} className="input-shell" />
              <input name="timeSlot" type="time" value={bookingForm.timeSlot} onChange={handleBookingChange} className="input-shell" />
              <input name="occasion" value={bookingForm.occasion} onChange={handleBookingChange} className="input-shell md:col-span-2" placeholder="Occasion" />
              <textarea
                name="specialRequest"
                value={bookingForm.specialRequest}
                onChange={handleBookingChange}
                className="input-shell min-h-[120px] md:col-span-2"
                placeholder="Special request"
              />
              <button type="submit" className="btn-primary md:col-span-2">
                Submit Booking
              </button>
            </form>
          </SectionCard>

          <SectionCard
            title="Advance Reservation"
            subtitle="Capture future reservations and area preferences for the reservation management module."
            action={
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Clock4 className="h-5 w-5" />
              </div>
            }
          >
            <form onSubmit={submitReservation} className="grid gap-4 md:grid-cols-2">
              <select name="restaurant" value={reservationForm.restaurant} onChange={handleReservationChange} className="input-shell">
                <option value="">Select restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
              <input name="guestCount" type="number" value={reservationForm.guestCount} onChange={handleReservationChange} className="input-shell" placeholder="Guest count" />
              <input name="guestName" value={reservationForm.guestName} onChange={handleReservationChange} className="input-shell" placeholder="Guest name" />
              <input name="guestEmail" type="email" value={reservationForm.guestEmail} onChange={handleReservationChange} className="input-shell" placeholder="Guest email" />
              <input name="guestPhone" value={reservationForm.guestPhone} onChange={handleReservationChange} className="input-shell" placeholder="Phone number" />
              <input name="areaPreference" value={reservationForm.areaPreference} onChange={handleReservationChange} className="input-shell" placeholder="Indoor / Patio / Sea View" />
              <input name="reservationDate" type="date" value={reservationForm.reservationDate} onChange={handleReservationChange} className="input-shell" />
              <input name="timeSlot" type="time" value={reservationForm.timeSlot} onChange={handleReservationChange} className="input-shell" />
              <textarea
                name="specialRequest"
                value={reservationForm.specialRequest}
                onChange={handleReservationChange}
                className="input-shell min-h-[120px] md:col-span-2"
                placeholder="Special request"
              />
              <button type="submit" className="btn-primary md:col-span-2">
                Submit Reservation
              </button>
            </form>
          </SectionCard>
        </div>
      </div>
    </section>
  );
};

export default GuestBookingPage;
