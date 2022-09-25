export interface FlightStatus {
  Status: Status;
  StartDateTime: StartDateTimeOrEndDateTime;
  EndDateTime: StartDateTimeOrEndDateTime;
  start_airport_code: string;
  start_airport_latitude: string;
  start_airport_longitude: string;
  start_city_name: string;
  start_country_code: string;
  end_airport_code: string;
  end_airport_latitude: string;
  end_airport_longitude: string;
  end_city_name: string;
  end_country_code: string;
  marketing_airline: string;
  marketing_airline_code: string;
  marketing_flight_number: string;
  alternate_flights_url: string;
  aircraft?: string | null;
  aircraft_display_name?: string | null;
  distance?: string | null;
  duration?: string | null;
  stops?: string | null;
  check_in_url?: string | null;
  mobile_check_in_url?: string | null;
  refund_info_url: string;
  change_reservation_url: string;
  customer_support_url: string;
  web_home_url: string;
  mobile_home_url?: string | null;
  is_eligible_seattracker: string;
  is_eligible_airhelp: string;
  is_hidden: string;
  id: string;
  is_international: string;
  Emissions: Emissions;
  service_class?: string | null;
  general_fees_url?: string | null;
}
export interface Status {
  flight_status: string;
  last_modified: string;
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
