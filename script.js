document.addEventListener("DOMContentLoaded", () => {
  setupHomeForm();
  setupSearchResults();
  populateFlightDetails();
  populateBookingSummaries();
  setupSeatSelection();
  setupAddonSelections();
  setupPassengerForm();
  setupPaymentForm();
  populateConfirmation();
  populatePriceSummaries();
});

const ECO_MATCH_DATA = {
  "SR 214": {
    co2: 320,
    ecoLevel: "Low",
    ecoSavingsText: "15% lower emissions than average",
    confidenceScore: 89,
    matchReason: "Best Value",
  },
  "SR 450": {
    co2: 410,
    ecoLevel: "Moderate",
    ecoSavingsText: "Close to the average emissions for this route",
    confidenceScore: 82,
    matchReason: "Balanced Schedule",
  },
  "SR 882": {
    co2: 295,
    ecoLevel: "Low",
    ecoSavingsText: "21% lower emissions than average",
    confidenceScore: 86,
    matchReason: "Fastest Option",
  },
};

function setupHomeForm() {
  const form = document.getElementById("home-booking-form");
  if (!form) return;

  const departureInput = document.getElementById("departure");
  const returnInput = document.getElementById("returnDate");
  const classSelect = document.getElementById("cabinClass");
  const passengerSelector = setupPassengerSelector();

  setupBookingDateLimits(departureInput, returnInput);

  [classSelect].forEach((select) => {
    if (!select) return;

    updateSelectPlaceholderState(select);
    select.addEventListener("change", () => updateSelectPlaceholderState(select));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const passengerData = passengerSelector ? passengerSelector.getValue() : getDefaultPassengerData();
    const booking = getHomeBookingData(passengerData);
    saveBookingData(booking);
    window.location.href = "search-results.html";
  });
}

function setupSearchResults() {
  const buttons = document.querySelectorAll(".select-flight");
  const cards = document.querySelectorAll(".flight-card");
  const list = document.getElementById("flight-results-list");
  const routeEl = document.getElementById("results-route");
  const metaEl = document.getElementById("results-meta");
  const sortMatchButton = document.getElementById("sort-match");
  const sortEcoButton = document.getElementById("sort-eco");
  const booking = getBookingData();
  const route = getBookingRoute(booking);
  const tripMeta = getTripMeta(booking);
  let activeSort = booking.searchSortMode || "match";

  if (routeEl) {
    routeEl.textContent = route;
  }

  if (metaEl) {
    metaEl.textContent = tripMeta;
  }

  cards.forEach((card) => populateEcoMatchCard(card));

  if (booking.selectedFlightNumber) {
    cards.forEach((card) => {
      const flightNumber = card.querySelector(".flight-meta p")?.textContent.trim();
      const action = card.querySelector(".select-flight");

      if (flightNumber === booking.selectedFlightNumber) {
        card.classList.add("selected");
        if (action) action.textContent = "Selected Flight";
      }
    });
  }

  if (list && sortMatchButton && sortEcoButton) {
    sortMatchButton.addEventListener("click", () => {
      activeSort = "match";
      booking.searchSortMode = activeSort;
      saveBookingData(booking);
      applyFlightSort(list, cards, activeSort);
      updateSortButtons(sortMatchButton, sortEcoButton, activeSort);
    });

    sortEcoButton.addEventListener("click", () => {
      activeSort = "eco";
      booking.searchSortMode = activeSort;
      saveBookingData(booking);
      applyFlightSort(list, cards, activeSort);
      updateSortButtons(sortMatchButton, sortEcoButton, activeSort);
    });

    applyFlightSort(list, cards, activeSort);
    updateSortButtons(sortMatchButton, sortEcoButton, activeSort);
  }

  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      booking.selectedFlightNumber = button.dataset.flightNumber;
      booking.selectedDepartureTime = button.dataset.departureTime;
      booking.selectedArrivalTime = button.dataset.arrivalTime;
      booking.selectedDuration = button.dataset.duration;
      booking.selectedPrice = button.dataset.price;
      saveBookingData(booking);
    });
  });
}

function populateEcoMatchCard(card) {
  const flightId = card.dataset.flightId;
  const ecoData = ECO_MATCH_DATA[flightId];
  if (!ecoData) return;

  setCardText(card, "[data-match-score]", `${ecoData.confidenceScore}% Match`);
  setCardText(card, "[data-co2]", `${ecoData.co2} kg CO2`);
  setCardText(card, "[data-eco-savings]", ecoData.ecoSavingsText);
  setCardText(card, "[data-match-reason]", ecoData.matchReason);

  const ecoBadge = card.querySelector("[data-eco-badge]");
  if (ecoBadge) {
    ecoBadge.textContent = `${ecoData.ecoLevel} Emission`;
    ecoBadge.classList.remove("low", "moderate", "high");
    ecoBadge.classList.add(ecoData.ecoLevel.toLowerCase());
  }
}

function applyFlightSort(list, cards, mode) {
  const orderedCards = Array.from(cards).sort((a, b) => {
    const aData = ECO_MATCH_DATA[a.dataset.flightId];
    const bData = ECO_MATCH_DATA[b.dataset.flightId];

    if (mode === "eco") {
      return aData.co2 - bData.co2;
    }

    return bData.confidenceScore - aData.confidenceScore;
  });

  orderedCards.forEach((card) => list.appendChild(card));

  const topFlightId = orderedCards[0]?.dataset.flightId;
  orderedCards.forEach((card) => {
    const highlight = card.querySelector("[data-eco-highlight]");
    if (!highlight) return;

    const isTop = card.dataset.flightId === topFlightId;
    highlight.hidden = !isTop;
    highlight.textContent = mode === "eco" ? "Best Eco Option" : "Best Overall Match";
  });
}

function updateSortButtons(matchButton, ecoButton, mode) {
  matchButton.classList.toggle("active", mode === "match");
  ecoButton.classList.toggle("active", mode === "eco");
}

function populateFlightDetails() {
  if (!document.getElementById("selected-flight-number")) return;

  const booking = getBookingData();
  const route = getBookingRoute(booking);
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
  const route = getBookingRoute(booking);
  const tripMeta = getTripMeta(booking);
  const passengers = booking.passengers || "1 Passenger";
  const cabinClass = booking.cabinClass || "Economy";

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

  document.querySelectorAll("[data-booking-passengers]").forEach((el) => {
    el.textContent = passengers;
  });

  document.querySelectorAll("[data-booking-class]").forEach((el) => {
    el.textContent = cabinClass;
  });
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
        saveBookingData(booking);
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

    saveBookingData(booking);
    window.location.href = "seat-selection.html";
  });
}

function setupAddonSelections() {
  const cards = document.querySelectorAll("[data-addon-group]");
  if (!cards.length) return;

  const booking = getBookingData();
  const groups = ["baggage", "seat-option", "insurance"];

  groups.forEach((group) => {
    const savedName = booking[getAddonNameKey(group)];
    const groupCards = document.querySelectorAll(`[data-addon-group="${group}"]`);
    const savedCard = savedName
      ? Array.from(groupCards).find((card) => card.dataset.addonName === savedName)
      : groupCards[0];

    if (savedCard) applyAddonSelection(savedCard, false);
  });

  cards.forEach((card) => {
    card.addEventListener("click", () => applyAddonSelection(card, true));
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

    saveBookingData(booking);
    window.location.href = "confirmation.html";
  });
}

function populateConfirmation() {
  if (!document.getElementById("confirm-passenger")) return;

  const booking = getBookingData();
  const passengerName =
    [booking.firstName, booking.lastName].filter(Boolean).join(" ") || "John Smith";
  const route = getBookingRoute(booking);
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

function populatePriceSummaries() {
  const booking = getBookingData();
  const totals = getPriceTotals(booking);
  const seatPageTotal = totals.baseFare + totals.seatSelectionPrice;

  setText("passenger-fare", formatCurrency(totals.baseFare));
  setText("passenger-total", formatCurrency(totals.baseFare));
  setText("seat-fare", formatCurrency(totals.baseFare));
  setText("seat-selection-price", formatCurrency(totals.seatSelectionPrice));
  setText("seat-total", formatCurrency(seatPageTotal));
  setText("addons-base-fare", formatCurrency(totals.baseFare));
  setText("addons-baggage-price", formatCurrency(totals.baggagePrice));
  setText("addons-seat-option-price", formatCurrency(totals.seatOptionPrice));
  setText("addons-insurance-price", formatCurrency(totals.insurancePrice));
  setText("addons-total", formatCurrency(totals.addonsPageTotal));

  setText("payment-base-fare", formatCurrency(totals.baseFare));
  setText("payment-seat-price", formatCurrency(totals.seatOptionPrice));
  setText("payment-addons-price", formatCurrency(totals.addonsTotal));
  setText("payment-total", formatCurrency(totals.paymentTotal));
  setText("confirm-total-paid", formatCurrency(totals.paymentTotal));
  setText("confirm-total-side", formatCurrency(totals.paymentTotal));
  updatePriceChangeAlert(booking);
}

function getBookingData() {
  const existing = localStorage.getItem("bookingData");
  return existing ? JSON.parse(existing) : {};
}

function saveBookingData(booking) {
  localStorage.setItem("bookingData", JSON.stringify(booking));
}

function getHomeBookingData(passengerData) {
  return {
    ...getBookingData(),
    from: document.getElementById("from")?.value.trim() || "",
    to: document.getElementById("to")?.value.trim() || "",
    departure: document.getElementById("departure")?.value || "",
    returnDate: document.getElementById("returnDate")?.value || "",
    cabinClass: document.getElementById("cabinClass")?.value || "",
    ...passengerData,
  };
}

function getBookingRoute(booking) {
  return `${booking.from || "Toronto (YYZ)"} → ${booking.to || "London (LHR)"}`;
}

function getTripMeta(booking) {
  const dates = formatDateRange(booking.departure, booking.returnDate);
  const passengers = booking.passengers || "1 Passenger";
  const cabinClass = booking.cabinClass || "Economy";
  return `${dates} · ${passengers} · ${cabinClass}`;
}

function getAddonNameKey(group) {
  return `${group}Name`;
}

function getAddonPriceKey(group) {
  return `${group}Price`;
}

function applyAddonSelection(card, persist) {
  const group = card.dataset.addonGroup;
  const groupCards = document.querySelectorAll(`[data-addon-group="${group}"]`);

  groupCards.forEach((groupCard) => {
    groupCard.classList.remove("selected");
    const tag = groupCard.querySelector(".tag");
    if (tag) tag.textContent = "Select";
  });

  card.classList.add("selected");
  const activeTag = card.querySelector(".tag");
  if (activeTag) activeTag.textContent = "Selected";

  const booking = getBookingData();
  const previousPrice = Number(booking[getAddonPriceKey(group)] || 0);
  const nextPrice = Number(card.dataset.addonPrice || 0);
  booking[getAddonNameKey(group)] = card.dataset.addonName;
  booking[getAddonPriceKey(group)] = String(nextPrice);
  saveBookingData(booking);

  const latestBooking = getBookingData();
  const baggage = latestBooking.baggageName || "No Extra Baggage";
  const seatOption = latestBooking["seat-optionName"] || "Standard Seat";
  const insurance = latestBooking.insuranceName || "No Insurance";
  setText(
    "addons-selection-note",
    `Selected options: ${baggage}, ${seatOption}, and ${insurance}.`
  );
  updatePriceChangeAlert(latestBooking, group, previousPrice, nextPrice);
  populatePriceSummaries();
}

function getBaseFareValue(booking) {
  const raw = Number.parseInt((booking.selectedPrice || "$179").replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(raw) ? 179 : raw;
}

function formatCurrency(amount) {
  return `$${amount}`;
}

function updatePriceChangeAlert(booking, changedGroup, previousPrice, nextPrice) {
  const message = buildPriceAlertMessage(booking, changedGroup, previousPrice, nextPrice);
  setText("price-alert-message", message);
}

function buildPriceAlertMessage(booking, changedGroup, previousPrice, nextPrice) {
  const totals = getPriceTotals(booking);
  const labelMap = {
    baggage: "baggage",
    "seat-option": "seat upgrade",
    insurance: "insurance",
  };

  if (totals.optionalExtrasTotal === 0) {
    return "No optional extras selected.";
  }

  if (changedGroup && nextPrice > previousPrice) {
    return `+ ${formatCurrency(nextPrice - previousPrice)} added for ${labelMap[changedGroup]}.`;
  }

  if (changedGroup && nextPrice < previousPrice) {
    return `${labelMap[changedGroup][0].toUpperCase()}${labelMap[changedGroup].slice(1)} updated. Total adjusted from ${formatCurrency(totals.baseFare + previousPrice + (totals.optionalExtrasTotal - nextPrice))} to ${formatCurrency(totals.addonsPageTotal)}.`;
  }

  return `Optional add-ons changed your total from ${formatCurrency(totals.baseFare)} to ${formatCurrency(totals.addonsPageTotal)}.`;
}

function getPriceTotals(booking) {
  const baseFare = getBaseFareValue(booking);
  const baggagePrice = Number(booking.baggagePrice || 0);
  const seatOptionPrice = Number(booking["seat-optionPrice"] || 0);
  const insurancePrice = Number(booking.insurancePrice || 0);
  const seatSelectionPrice = booking.seat ? 25 : 0;
  const optionalExtrasTotal = baggagePrice + seatOptionPrice + insurancePrice;
  const addonsTotal = baggagePrice + insurancePrice;
  const taxes = 85;
  const addonsPageTotal = baseFare + optionalExtrasTotal;
  const paymentTotal = baseFare + seatOptionPrice + addonsTotal + taxes;

  return {
    baseFare,
    baggagePrice,
    seatOptionPrice,
    insurancePrice,
    seatSelectionPrice,
    optionalExtrasTotal,
    addonsTotal,
    addonsPageTotal,
    taxes,
    paymentTotal,
  };
}

function setCardText(card, selector, value) {
  const el = card.querySelector(selector);
  if (el) el.textContent = value;
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

function updateSelectPlaceholderState(select) {
  if (!select) return;
  select.classList.toggle("placeholder-select", !select.value);
}

function setupPassengerSelector() {
  const container = document.getElementById("passenger-selector");
  const trigger = document.getElementById("passenger-trigger");
  const panel = document.getElementById("passenger-panel");
  const doneButton = document.getElementById("passenger-done");
  const display = document.getElementById("passenger-display");
  const note = document.getElementById("passenger-note");

  if (!container || !trigger || !panel || !doneButton || !display || !note) return null;

  const initial = getInitialPassengerCounts(getBookingData());
  const state = {
    adults: initial.adults,
    children: initial.children,
    infants: initial.infants,
    touched: initial.touched,
    open: false,
  };

  renderPassengerSelector(state, display, trigger, note);

  trigger.addEventListener("click", () => {
    state.open = !state.open;
    panel.hidden = !state.open;
    trigger.setAttribute("aria-expanded", String(state.open));
  });

  panel.querySelectorAll("[data-passenger-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.passengerAction;
      const type = button.dataset.passengerType;
      updatePassengerCount(state, type, action);
      state.touched = true;
      renderPassengerSelector(state, display, trigger, note);
    });
  });

  doneButton.addEventListener("click", () => {
    state.touched = true;
    state.open = false;
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    renderPassengerSelector(state, display, trigger, note);
  });

  document.addEventListener("click", (event) => {
    if (!container.contains(event.target)) {
      state.open = false;
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
  });

  return {
    getValue() {
      const totalPassengers = state.adults + state.children + state.infants;
      const passengerSummary = formatPassengerSummary(state);

      return {
        adults: state.adults,
        children: state.children,
        infants: state.infants,
        totalPassengers,
        passengerSummary,
        passengers: passengerSummary,
      };
    },
  };
}

function getInitialPassengerCounts(booking) {
  const adults = Number(booking.adults);
  const children = Number(booking.children);
  const infants = Number(booking.infants);

  if (!Number.isNaN(adults) && !Number.isNaN(children) && !Number.isNaN(infants)) {
    return {
      adults: Math.max(1, adults),
      children: Math.max(0, children),
      infants: Math.max(0, Math.min(infants, Math.max(1, adults))),
      touched: Boolean(booking.passengerSummary || booking.passengers),
    };
  }

  const fallbackAdults = getLegacyPassengerCount(booking.passengers);
  return {
    adults: fallbackAdults,
    children: 0,
    infants: 0,
    touched: Boolean(booking.passengers),
  };
}

function getLegacyPassengerCount(passengers) {
  const match = String(passengers || "").match(/(\d+)/);
  const count = match ? Number(match[1]) : 1;
  return Number.isNaN(count) ? 1 : Math.max(1, count);
}

function updatePassengerCount(state, type, action) {
  if (action === "increase") {
    state[type] += 1;
  }

  if (action === "decrease") {
    if (type === "adults") {
      state.adults = Math.max(1, state.adults - 1);
      state.infants = Math.min(state.infants, state.adults);
    } else {
      state[type] = Math.max(0, state[type] - 1);
    }
  }

  if (type === "infants" && state.infants > state.adults) {
    state.infants = state.adults;
  }
}

function renderPassengerSelector(state, display, trigger, note) {
  setText("count-adults", String(state.adults));
  setText("count-children", String(state.children));
  setText("count-infants", String(state.infants));

  const summary = state.touched ? formatPassengerSummary(state) : "Select passengers";
  display.textContent = summary;
  trigger.classList.toggle("placeholder-select", !state.touched);
  note.textContent =
    state.infants === state.adults
      ? "Each infant is matched with an adult."
      : "Infants cannot exceed the number of adults.";
}

function formatPassengerSummary(state) {
  const parts = [];

  if (state.adults > 0) {
    parts.push(`${state.adults} ${state.adults === 1 ? "Adult" : "Adults"}`);
  }

  if (state.children > 0) {
    parts.push(`${state.children} ${state.children === 1 ? "Child" : "Children"}`);
  }

  if (state.infants > 0) {
    parts.push(`${state.infants} ${state.infants === 1 ? "Infant" : "Infants"}`);
  }

  return parts.length ? parts.join(", ") : "Select passengers";
}

function getDefaultPassengerData() {
  const state = { adults: 1, children: 0, infants: 0 };
  const passengerSummary = formatPassengerSummary(state);

  return {
    adults: state.adults,
    children: state.children,
    infants: state.infants,
    totalPassengers: state.adults,
    passengerSummary,
    passengers: passengerSummary,
  };
}

function setupBookingDateLimits(departureInput, returnInput) {
  if (!departureInput || !returnInput) return;

  const today = getTodayString();
  departureInput.min = today;
  returnInput.min = today;

  departureInput.addEventListener("change", () => {
    const minReturn = departureInput.value || today;
    returnInput.min = minReturn;

    if (returnInput.value && returnInput.value < minReturn) {
      returnInput.value = "";
    }
  });
}

function getTodayString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60000);
  return localDate.toISOString().split("T")[0];
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
