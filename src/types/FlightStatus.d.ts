export interface FlightStatus {
  Status: Status;
  StartDateTime: StartDateTimeOrEndDateTime;
  EndDateTime: StartDateTimeOrEndDateTime;
  start_airport_code: string;
  start_airport_latitude: string;
  start_airport_longitude: string;
  start_city_name: string;
  start_country_code: string;
  start_gate?: string;
  start_terminal?: string;
  end_airport_code: string;
  end_airport_latitude: string;
  end_airport_longitude: string;
  end_city_name: string;
  end_country_code: string;
  end_gate?: string;
  end_terminal?: string;
  marketing_airline: string;
  marketing_airline_code: string;
  marketing_flight_number: string;
  alternate_flights_url: string;
  aircraft?: string;
  aircraft_display_name?: string;
  distance?: string;
  duration?: string;
  stops?: string;
  baggage_claim?: string;
  refund_info_url: string;
  change_reservation_url: string;
  customer_support_url: string;
  web_home_url: string;
  mobile_home_url?: string;
  is_eligible_seattracker: string;
  is_eligible_airhelp: string;
  is_hidden: string;
  id: string;
  is_international: string;
  Emissions: Emissions;
  check_in_url?: string;
  mobile_check_in_url?: string;
  mobile_change_reservation_url?: string;
  mobile_customer_support_url?: string;
  service_class?: string;
  general_fees_url?: string;
}
export interface Status {
  ScheduledDepartureDateTime?: ScheduledDepartureDateTimeOrEstimatedDepartureDateTimeOrScheduledArrivalDateTimeOrEstimatedArrivalDateTime;
  EstimatedDepartureDateTime?: ScheduledDepartureDateTimeOrEstimatedDepartureDateTimeOrScheduledArrivalDateTimeOrEstimatedArrivalDateTime1;
  ScheduledArrivalDateTime?: ScheduledDepartureDateTimeOrEstimatedDepartureDateTimeOrScheduledArrivalDateTimeOrEstimatedArrivalDateTime2;
  EstimatedArrivalDateTime?: ScheduledDepartureDateTimeOrEstimatedDepartureDateTimeOrScheduledArrivalDateTimeOrEstimatedArrivalDateTime3;
  departure_terminal?: string;
  departure_gate?: string;
  arrival_terminal?: string;
  arrival_gate?: string;
  baggage_claim?: string;
  flight_status: string;
  last_modified: string;
}
export interface ScheduledDepartureDateTimeOrEstimatedDepartureDateTimeOrScheduledArrivalDateTimeOrEstimatedArrivalDateTime {
  date: string;
  time: string;
  timezone: string;
  utc_offset: string;
}
export interface ScheduledDepartureDateTimeOrEstimatedDepartureDateTimeOrScheduledArrivalDateTimeOrEstimatedArrivalDateTime1 {
  date: string;
  time: string;
  timezone: string;
  utc_offset: string;
}
export interface ScheduledDepartureDateTimeOrEstimatedDepartureDateTimeOrScheduledArrivalDateTimeOrEstimatedArrivalDateTime2 {
  date: string;
  time: string;
  timezone: string;
  utc_offset: string;
}
export interface ScheduledDepartureDateTimeOrEstimatedDepartureDateTimeOrScheduledArrivalDateTimeOrEstimatedArrivalDateTime3 {
  date: string;
  time: string;
  timezone: string;
  utc_offset: string;
}
export interface StartDateTimeOrEndDateTime {
  date: string;
  time: string;
  timezone: string;
  utc_offset: string;
  is_timezone_manual: string;
}
export interface Emissions {
  co2: string;
}
