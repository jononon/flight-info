import { FlightStatus } from "./FlightStatus";

export interface DateTimeWithTimezone {
  dateTime: Date;
  timezone: string;
}

export interface DisplayFlight {
  // Reservation fields (always from TripIt)
  ident: string;
  marketingAirline: string;
  marketingAirlineCode: string;
  marketingFlightNumber: string;
  startAirportCode: string;
  endAirportCode: string;
  startCityName: string;
  endCityName: string;
  duration?: string;

  // Status fields (from FlightAware when available, else TripIt)
  statusText: string;
  longStatusText: string;
  statusColor: string;

  scheduledDeparture: DateTimeWithTimezone;
  scheduledArrival: DateTimeWithTimezone;
  estimatedDeparture?: DateTimeWithTimezone;
  estimatedArrival?: DateTimeWithTimezone;

  departureTerminal?: string;
  departureGate?: string;
  arrivalTerminal?: string;
  arrivalGate?: string;
  baggageClaim?: string;

  departureDelay?: number; // milliseconds
  arrivalDelay?: number; // milliseconds

  // Computed countdown fields (in milliseconds)
  scheduledDateDifference?: number; // day difference between departure and arrival dates
  estimatedDateDifference?: number;

  // FlightAware enrichment
  faFlightId?: string;
  inboundFaFlightId?: string;
  registration?: string;
  progressPercent?: number;

  statusSource: "tripit" | "flightaware";

  // Reference to original TripIt flight for edge cases
  originalTripItFlight: FlightStatus;
}
