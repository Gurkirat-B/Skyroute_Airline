document.addEventListener("DOMContentLoaded", () => {
  setupHomeForm();
  setupSeatSelection();
  setupPassengerForm();
  setupPaymentForm();
  populateConfirmation();
});

function setupHomeForm() {
  const form = document.getElementById("home-booking-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const booking = getBookingData();

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

function setupSeatSelection() {
  const seats = document.querySelectorAll(".seat[data-seat]");
  const output = document.getElementById("selected-seat-output");
  const continueBtn = document.getElementById("continue-from-seat");

  if (seats.length && output) {
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
      window.location.href = "addons.html";
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

  setText("confirm-email", booking.email || "john@email.com");
  setText("confirm-passenger", passengerName);
  setText("confirm-reference", booking.bookingReference || "SR4K29");
  setText("confirm-route", `${booking.from || "Toronto (YYZ)"} → ${booking.to || "London (LHR)"}`);
  setText(
    "confirm-dates",
    `${booking.departure || "25 Mar 2026"} - ${booking.returnDate || "02 Apr 2026"}`
  );
  setText("confirm-seat", booking.seat || "2B");
  setText("confirm-route-side", `${booking.from || "Toronto (YYZ)"} → ${booking.to || "London (LHR)"}`);
setText("confirm-dates-side", `${booking.departure || "25 Mar 2026"} - ${booking.returnDate || "02 Apr 2026"}`);
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