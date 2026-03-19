document.addEventListener("DOMContentLoaded", () => {
  setupHomeForm();
  setupSearchResults();
  populateFlightDetails();
  populateBookingSummaries();
  setupSeatSelection();
  setupPassengerForm();
  setupPaymentForm();
  populateConfirmation();
});

function setupHomeForm() {
  const form = document.getElementById("home-booking-form");
  if (!form) return;

  const booking = getBookingData();

  setValue("from", booking.from || "Toronto (YYZ)");
  setValue("to", booking.to || "London (LHR)");
  setValue("departure", booking.departure || "2026-03-25");
  setValue("returnDate", booking.returnDate || "2026-04-02");
  setValue("passengers", booking.passengers || "2 Passengers");
  setValue("cabinClass", booking.cabinClass || "Economy");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    booking.from = document.getElementById("from").value.trim();
    booking.to = document.getElementById("to").value.trim();
    booking.departure = document.getElementById("departure").value;
    booking.returnDate = document.getElementById("returnDate").value;
    booking.passengers = document.getElementById("passengers").value;
    booking.cabinClass = document.getElementById("cabinClass").value;

    localStorage.setItem("bookingData", JSON.stringify(booking));
    window.location.href = "search-results.html";
  });
}

function setupSearchResults() {
  const buttons = document.querySelectorAll(".select-flight");
  const routeEl = document.getElementById("results-route");
  const metaEl = document.getElementById("results-meta");
  const booking = getBookingData();

  if (routeEl) {
    routeEl.textContent = `${booking.from || "Toronto (YYZ)"} → ${booking.to || "London (LHR)"}`;
  }

  if (metaEl) {
    const parts = [
      formatDateRange(booking.departure, booking.returnDate),
      booking.passengers || "1 Passenger",
      booking.cabinClass || "Economy",
    ];
    metaEl.textContent = parts.join(" · ");
  }

  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      booking.selectedFlightNumber = button.dataset.flightNumber;
      booking.selectedDepartureTime = button.dataset.departureTime;
      booking.selectedArrivalTime = button.dataset.arrivalTime;
      booking.selectedDuration = button.dataset.duration;
      booking.selectedPrice = button.dataset.price;
      localStorage.setItem("bookingData", JSON.stringify(booking));
    });
  });
}

function populateFlightDetails() {
  if (!document.getElementById("selected-flight-number")) return;

  const booking = getBookingData();
  const route = `${booking.from || "Toronto (YYZ)"} → ${booking.to || "London (LHR)"}`;
  const price = booking.selectedPrice || "$179";

  setText("selected-flight-number", `Flight ${booking.selectedFlightNumber || "SR 214"}`);
  setText("selected-departure-time", booking.selectedDepartureTime || "8:30 AM");
  setText("selected-arrival-time", booking.selectedArrivalTime || "10:15 AM");
  setText("selected-duration", booking.selectedDuration || "2h 45m · Nonstop");
  setText("selected-departure-city", booking.from || "Toronto (YYZ)");
  setText("selected-arrival-city", booking.to || "London (LHR)");
  setText("details-route", route);
  setText("details-dates", formatDateRange(booking.departure, booking.returnDate));
  setText("details-fare", price);
  setText("details-total", price);
}

function populateBookingSummaries() {
  const booking = getBookingData();
  const route = `${booking.from || "Toronto (YYZ)"} → ${booking.to || "London (LHR)"}`;
  const dates = formatDateRange(booking.departure, booking.returnDate);
  const passengers = booking.passengers || "1 Passenger";
  const cabinClass = booking.cabinClass || "Economy";
  const tripMeta = `${dates} · ${passengers} · ${cabinClass}`;

  setText("results-route", route);
  setText("results-meta", tripMeta);

  setText("passenger-summary-route", route);
  setText("passenger-summary-meta", tripMeta);

  setText("seat-summary-route", route);
  setText("seat-summary-dates", tripMeta);

  setText("addons-summary-route", route);
  setText("addons-summary-dates", tripMeta);

  setText("payment-summary-route", route);
  setText("payment-summary-dates", tripMeta);

  setText("details-route", route);
  setText("details-dates", tripMeta);
}

function setupSeatSelection() {
  const seats = document.querySelectorAll(".seat[data-seat]");
  const output = document.getElementById("selected-seat-output");
  const continueBtn = document.getElementById("continue-from-seat");
  const booking = getBookingData();

  if (seats.length && output) {
    if (booking.seat) {
      const selectedSeat = document.querySelector(`.seat[data-seat="${booking.seat}"]`);
      if (selectedSeat) {
        seats.forEach((s) => s.classList.remove("selected"));
        selectedSeat.classList.add("selected");
        output.textContent = `${booking.seat} — Standard Seat`;
      }
    }

    seats.forEach((seat) => {
      seat.addEventListener("click", () => {
        if (seat.classList.contains("unavailable")) return;

        seats.forEach((s) => s.classList.remove("selected"));
        seat.classList.add("selected");
        output.textContent = `${seat.dataset.seat} — Standard Seat`;

        const booking = getBookingData();
        booking.seat = seat.dataset.seat;
        localStorage.setItem("bookingData", JSON.stringify(booking));
      });
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "Add-ons.html";
    });
  }
}

function setupPassengerForm() {
  const form = document.getElementById("passenger-form");
  if (!form) return;

  const booking = getBookingData();

  setValue("title", booking.title || "Mr");
  setValue("firstName", booking.firstName || "");
  setValue("lastName", booking.lastName || "");
  setValue("dob", booking.dob || "");
  setValue("nationality", booking.nationality || "");
  setValue("passport", booking.passport || "");
  setValue("email", booking.email || "");
  setValue("phone", booking.phone || "");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    booking.title = document.getElementById("title").value;
    booking.firstName = document.getElementById("firstName").value.trim();
    booking.lastName = document.getElementById("lastName").value.trim();
    booking.dob = document.getElementById("dob").value;
    booking.nationality = document.getElementById("nationality").value.trim();
    booking.passport = document.getElementById("passport").value.trim();
    booking.email = document.getElementById("email").value.trim();
    booking.phone = document.getElementById("phone").value.trim();

    localStorage.setItem("bookingData", JSON.stringify(booking));
    window.location.href = "seat-selection.html";
  });
}

function setupPaymentForm() {
  const form = document.getElementById("payment-form");
  if (!form) return;

  const booking = getBookingData();

  setValue("cardName", booking.cardName || "");
  setValue("cardNumber", booking.cardNumber || "");
  setValue("expiry", booking.expiry || "");
  setValue("cvv", booking.cvv || "");
  setValue("billingAddress", booking.billingAddress || "");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    booking.cardName = document.getElementById("cardName").value.trim();
    booking.cardNumber = document.getElementById("cardNumber").value.trim();
    booking.expiry = document.getElementById("expiry").value.trim();
    booking.cvv = document.getElementById("cvv").value.trim();
    booking.billingAddress = document.getElementById("billingAddress").value.trim();
    booking.bookingReference = generateReference();
    booking.status = "Confirmed";

    localStorage.setItem("bookingData", JSON.stringify(booking));
    window.location.href = "confirmation.html";
  });
}

function populateConfirmation() {
  if (!document.getElementById("confirm-passenger")) return;

  const booking = getBookingData();
  const passengerName =
    [booking.firstName, booking.lastName].filter(Boolean).join(" ") || "John Smith";
  const route = `${booking.from || "Toronto (YYZ)"} → ${booking.to || "London (LHR)"}`;
  const dates = formatDateRange(booking.departure, booking.returnDate);

  setText("confirm-email", booking.email || "john@email.com");
  setText("confirm-passenger", passengerName);
  setText("confirm-reference", booking.bookingReference || "SR4K29");
  setText("confirm-route", route);
  setText("confirm-dates", dates);
  setText("confirm-seat", booking.seat || "2B");
  setText("confirm-flight-number", booking.selectedFlightNumber || "SR 214");
  setText("confirm-route-side", route);
  setText("confirm-dates-side", dates);
  setText("confirm-passenger-side", passengerName);
  setText("confirm-reference-side", booking.bookingReference || "SR4K29");
  setText("confirm-seat-side", booking.seat || "2B");
}

function getBookingData() {
  const existing = localStorage.getItem("bookingData");
  return existing ? JSON.parse(existing) : {};
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function generateReference() {
  return "SR" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

function formatDateRange(departure, returnDate) {
  const start = formatDisplayDate(departure) || "25 Mar 2026";
  const end = formatDisplayDate(returnDate) || "02 Apr 2026";
  return `${start} - ${end}`;
}

function formatDisplayDate(value) {
  if (!value) return "";

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-CA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
