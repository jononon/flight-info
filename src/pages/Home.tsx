import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonImg,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useRef, useEffect, useState } from "react";
import ExploreContainer from "../components/ExploreContainer";
import "./Home.css";
import { API } from "aws-amplify";
import { FlightStatus } from "../types/FlightStatus";
import { FlightAwareStatus } from "../types/FlightAwareStatus";

const flightStatuses: {
  [key: string]: { longStatusText: string; statusText: string; color: string };
} = {
  "100": {
    longStatusText: "Not Monitorable",
    statusText: "Unmonitored",
    color: "primary",
  },
  "200": {
    longStatusText: "Not Monitored",
    statusText: "Unmonitored",
    color: "primary",
  },
  "300": {
    longStatusText: "Scheduled",
    statusText: "Scheduled",
    color: "primary",
  },
  "301": { longStatusText: "On Time", statusText: "On Time", color: "success" },
  "302": {
    longStatusText: "In Flight - On Time",
    statusText: "In Flight - On Time",
    color: "success",
  },
  "303": {
    longStatusText: "Arrived - On Time",
    statusText: "Arrived - On Time",
    color: "success",
  },
  "400": {
    longStatusText: "Cancelled",
    statusText: "Cancelled",
    color: "danger",
  },
  "401": { longStatusText: "Delayed", statusText: "Delayed", color: "danger" },
  "402": {
    longStatusText: "In Flight - Late",
    statusText: "In Flight",
    color: "danger",
  },
  "403": {
    longStatusText: "Arrived - Late",
    statusText: "Arrived",
    color: "danger",
  },
  "404": {
    longStatusText: "Diverted",
    statusText: "Diverted",
    color: "danger",
  },
  "405": {
    longStatusText: "Possibly Delayed",
    statusText: "Poss Delayed",
    color: "danger",
  },
  "406": {
    longStatusText: "In Flight - Possibly Late",
    statusText: "In Flight",
    color: "danger",
  },
  "407": {
    longStatusText: "Arrived - Possibly Late",
    statusText: "Arrived",
    color: "danger",
  },
  "408": { longStatusText: "Unknown", statusText: "Unknown", color: "primary" },
};

const millisecondsUntilTime = (timeIn: Date) => {
  return timeIn.getTime() - new Date().getTime();
};

const durationString = (milliseconds: number) => {
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(milliseconds / (1000 * 60 * 60) - days * 24);
  const minutes = Math.floor(
    milliseconds / (1000 * 60) - (days * 24 * 60 + hours * 60)
  );

  if (days > 0) {
    return `${days}d, ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h, ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

const Home: React.FC = () => {
  const accordionGroup = useRef<null | HTMLIonAccordionGroupElement>(null);

  const [flights, setFlights] = useState<Array<FlightStatus>>([]);
  const [flightMaps, setFlightMaps] = useState<{
    [key: string]: string;
  }>({});

  const [flightAwareStatuses, setFlightAwareStatuses] = useState<{
    [key: string]: FlightAwareStatus;
  }>({});

  const getFlightsFunction = async () => {
    const newFlights = (await API.get(
      "tripItFlightsAdapter",
      "/tripit/flights/asdf",
      {}
    )) as Array<FlightStatus>;
    setFlights(newFlights);
    await updateFlightAwareStatuses(newFlights);
  };

  let mapSize = Math.min(400, Math.floor(window.innerWidth) - 60);

  const getFlightAwareStatusForIdent = async (
    ident: string,
    start: string,
    end: string,
    getMap: boolean
  ) => {
    const flightInfo = (await API.get(
      "flightAwareAdapter",
      `/flightaware/details/${ident}?start=${start}&end=${end}`,
      {}
    )) as FlightAwareStatus;

    setFlightAwareStatuses((flightAwareStatuses) => ({
      ...flightAwareStatuses,
      [ident]: flightInfo,
    }));

    if (getMap) {
      const map = (await API.get(
        "flightAwareAdapter",
        `/flightaware/map/${flightInfo.fa_flight_id}?width=${mapSize}&height=${mapSize}`,
        {}
      )) as { map: string };

      setFlightMaps((flightMaps) => ({
        ...flightMaps,
        [ident]: map.map,
      }));
    }
  };

  const updateFlightAwareStatuses = async (newFlights: Array<FlightStatus>) => {
    for (const flight of newFlights) {
      const ident = `${flight.marketing_airline_code}${flight.marketing_flight_number}`;

      const scheduledDepartureDateObject =
        flight.Status.ScheduledDepartureDateTime === undefined
          ? flight.StartDateTime
          : flight.Status.ScheduledDepartureDateTime;

      const scheduledArrivalDateObject =
        flight.Status.ScheduledArrivalDateTime === undefined
          ? flight.EndDateTime
          : flight.Status.ScheduledArrivalDateTime;

      const scheduledDepartureDate = new Date(
        scheduledDepartureDateObject.date +
          "T" +
          scheduledDepartureDateObject.time +
          scheduledDepartureDateObject.utc_offset
      );

      const scheduledArrivalDate = new Date(
        scheduledArrivalDateObject.date +
          "T" +
          scheduledArrivalDateObject.time +
          scheduledArrivalDateObject.utc_offset
      );

      const actualDepartureDateObject =
        flight.Status.EstimatedDepartureDateTime;
      const actualArrivalDateObject = flight.Status.EstimatedArrivalDateTime;

      const actualDepartureDate =
        actualDepartureDateObject === undefined
          ? undefined
          : new Date(
              actualDepartureDateObject.date +
                "T" +
                actualDepartureDateObject.time +
                actualDepartureDateObject.utc_offset
            );

      const actualArrivalDate =
        actualArrivalDateObject === undefined
          ? undefined
          : new Date(
              actualArrivalDateObject.date +
                "T" +
                actualArrivalDateObject.time +
                actualArrivalDateObject.utc_offset
            );

      const millisecondsUntilDeparture =
        actualDepartureDate === undefined
          ? millisecondsUntilTime(scheduledDepartureDate)
          : millisecondsUntilTime(actualDepartureDate);

      const millisecondsUntilArrival =
        actualArrivalDate === undefined
          ? millisecondsUntilTime(scheduledArrivalDate)
          : millisecondsUntilTime(actualArrivalDate);

      if (millisecondsUntilDeparture <= 0 && millisecondsUntilArrival > 0) {
        await getFlightAwareStatusForIdent(
          ident,
          scheduledDepartureDate.toISOString(),
          scheduledArrivalDate.toISOString(),
          true
        );
      } else if (
        millisecondsUntilDeparture < 1000 * 60 * 60 * 24 &&
        millisecondsUntilArrival > -60000
      ) {
        await getFlightAwareStatusForIdent(
          ident,
          scheduledDepartureDate.toISOString(),
          scheduledArrivalDate.toISOString(),
          false
        );
      }
    }
  };

  useEffect(() => {
    getFlightsFunction();

    setInterval(() => {
      getFlightsFunction();
    }, 30000);
  }, []);

  useEffect(() => {
    if (!accordionGroup.current) {
      return;
    }

    accordionGroup.current.value = ["0"];
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Jonathan Damico's Flights</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Jonathan's Flights</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonAccordionGroup ref={accordionGroup} multiple={true}>
          {flights.map((flight, index) => {
            const ident = `${flight.marketing_airline_code}${flight.marketing_flight_number}`;

            const scheduledDepartureDateObject =
              flight.Status.ScheduledDepartureDateTime === undefined
                ? flight.StartDateTime
                : flight.Status.ScheduledDepartureDateTime;

            const scheduledArrivalDateObject =
              flight.Status.ScheduledArrivalDateTime === undefined
                ? flight.EndDateTime
                : flight.Status.ScheduledArrivalDateTime;

            const scheduledDepartureDate = new Date(
              scheduledDepartureDateObject.date +
                "T" +
                scheduledDepartureDateObject.time +
                scheduledDepartureDateObject.utc_offset
            );

            const scheduledArrivalDate = new Date(
              scheduledArrivalDateObject.date +
                "T" +
                scheduledArrivalDateObject.time +
                scheduledArrivalDateObject.utc_offset
            );

            const actualDepartureDateObject =
              flight.Status.EstimatedDepartureDateTime;
            const actualArrivalDateObject =
              flight.Status.EstimatedArrivalDateTime;

            const actualDepartureDate =
              actualDepartureDateObject === undefined
                ? undefined
                : new Date(
                    actualDepartureDateObject.date +
                      "T" +
                      actualDepartureDateObject.time +
                      actualDepartureDateObject.utc_offset
                  );

            const actualArrivalDate =
              actualArrivalDateObject === undefined
                ? undefined
                : new Date(
                    actualArrivalDateObject.date +
                      "T" +
                      actualArrivalDateObject.time +
                      actualArrivalDateObject.utc_offset
                  );

            const departureDelay =
              actualDepartureDate === undefined ||
              scheduledDepartureDate === undefined
                ? undefined
                : actualDepartureDate.getTime() -
                  scheduledDepartureDate.getTime();

            const arrivalDelay =
              actualArrivalDate === undefined ||
              scheduledArrivalDate === undefined
                ? undefined
                : actualArrivalDate.getTime() - scheduledArrivalDate.getTime();

            const millisecondsUntilDeparture =
              actualDepartureDate === undefined
                ? millisecondsUntilTime(scheduledDepartureDate)
                : millisecondsUntilTime(actualDepartureDate);

            const millisecondsUntilArrival =
              actualArrivalDate === undefined
                ? millisecondsUntilTime(scheduledArrivalDate)
                : millisecondsUntilTime(actualArrivalDate);

            const departureCountdown = durationString(
              millisecondsUntilDeparture
            );

            const arrivalCountdown = durationString(millisecondsUntilArrival);

            // if (
            //   millisecondsUntilDeparture < 0 &&
            //   millisecondsUntilArrival > 0
            // ) {
            //   getFlightAwareStatus(
            //     ident,
            //     scheduledDepartureDate.toISOString(),
            //     scheduledArrivalDate.toISOString(),
            //     true
            //   );
            // } else if (millisecondsUntilArrival < 60000) {
            //   getFlightAwareStatus(
            //     ident,
            //     scheduledDepartureDate.toISOString(),
            //     scheduledArrivalDate.toISOString(),
            //     false
            //   );
            // }

            const shortDateFormatOptions: Intl.DateTimeFormatOptions = {
              month: "short",
              day: "numeric",
            };

            const shortTimeFormatOptions: Intl.DateTimeFormatOptions = {
              hour12: true,
              hour: "2-digit",
              minute: "2-digit",
            };

            const longTimeFormatOptions: Intl.DateTimeFormatOptions = {
              hour12: true,
              hour: "2-digit",
              minute: "2-digit",
              timeZoneName: "short",
            };
            return (
              <IonAccordion value={`${index}`} key={index}>
                <IonItem slot="header" color="light">
                  <IonLabel>
                    {scheduledDepartureDate.toLocaleDateString(
                      "en-US",
                      shortDateFormatOptions
                    )}{" "}
                    | {flight.start_airport_code} - {flight.end_airport_code}
                  </IonLabel>
                  <IonBadge
                    color={flightStatuses[flight.Status.flight_status].color}
                  >
                    {flightStatuses[flight.Status.flight_status].statusText}
                  </IonBadge>
                </IonItem>

                <IonGrid
                  slot="content"
                  className="ion-padding"
                  style={{ "--ion-grid-padding": "0px" }}
                >
                  <IonRow>
                    <IonCol>
                      <IonGrid
                        className="ion-no-padding"
                        style={{ "--ion-grid-padding": "0px" }}
                      >
                        <IonRow>
                          <IonCol>
                            <h5 className="ion-no-margin">
                              {flight.marketing_airline}{" "}
                              {flight.marketing_flight_number}
                            </h5>
                            <p className="ion-no-margin">
                              {flight.marketing_airline_code}
                              {flight.marketing_flight_number}
                            </p>
                          </IonCol>
                        </IonRow>
                        <IonRow>
                          <IonCol>
                            <IonText
                              color={
                                flightStatuses[flight.Status.flight_status]
                                  .color
                              }
                            >
                              <h3 className="ion-no-margin">
                                {
                                  flightStatuses[flight.Status.flight_status]
                                    .longStatusText
                                }
                              </h3>
                              {millisecondsUntilDeparture > 0 ? (
                                <h1 className="ion-no-margin">
                                  Departing in {departureCountdown}
                                </h1>
                              ) : millisecondsUntilArrival > 0 ? (
                                <h1 className="ion-no-margin">
                                  Arriving in {arrivalCountdown}
                                </h1>
                              ) : (
                                <></>
                              )}
                            </IonText>
                          </IonCol>
                        </IonRow>
                        <IonRow>
                          <IonCol>
                            <p className="ion-no-margin">Departure</p>
                            <h1 className="ion-no-margin">
                              {flight.start_airport_code}
                            </h1>
                            <h4 className="ion-no-margin">
                              {flight.start_city_name}
                            </h4>
                            {flight.Status.departure_gate &&
                              flight.Status.departure_terminal && (
                                <p className="ion-no-margin">
                                  Terminal {flight.Status.departure_terminal},
                                  Gate {flight.Status.departure_gate}
                                </p>
                              )}
                            <p className="ion-no-margin">
                              <small>Scheduled</small>
                            </p>
                            <p className="ion-no-margin">
                              {scheduledDepartureDate.toLocaleTimeString(
                                "en-US",
                                {
                                  ...longTimeFormatOptions,
                                  timeZone:
                                    scheduledDepartureDateObject.timezone,
                                }
                              )}
                            </p>
                            {actualDepartureDate && (
                              <>
                                <p className="ion-no-margin">
                                  <small>Actual</small>
                                </p>
                                <p className="ion-no-margin">
                                  <IonText
                                    color={
                                      departureDelay !== undefined &&
                                      departureDelay <= 0
                                        ? "success"
                                        : "danger"
                                    }
                                  >
                                    {actualDepartureDate.toLocaleTimeString(
                                      "en-US",
                                      {
                                        ...longTimeFormatOptions,
                                        timeZone:
                                          scheduledDepartureDateObject.timezone,
                                      }
                                    )}
                                  </IonText>
                                </p>
                              </>
                            )}
                            {departureDelay && departureDelay !== 0 ? (
                              <p className="ion-no-margin">
                                <small>
                                  {durationString(departureDelay)}{" "}
                                  {departureDelay < 0 ? "early" : "late"}
                                </small>
                              </p>
                            ) : (
                              <p>
                                <small></small>
                              </p>
                            )}
                            <p>Duration: {flight.duration}</p>
                          </IonCol>
                          <IonCol class="ion-text-end">
                            <p className="ion-no-margin">Arrival</p>
                            <h1 className="ion-no-margin">
                              {flight.end_airport_code}
                            </h1>
                            <h4 className="ion-no-margin">
                              {flight.end_city_name}
                            </h4>
                            {flight.Status.arrival_gate &&
                              flight.Status.arrival_terminal && (
                                <p className="ion-no-margin">
                                  Terminal {flight.Status.arrival_terminal},
                                  Gate {flight.Status.arrival_gate}
                                </p>
                              )}
                            <p className="ion-no-margin">
                              <small>Scheduled</small>
                            </p>
                            <p className="ion-no-margin">
                              {scheduledArrivalDate.toLocaleTimeString(
                                "en-US",
                                {
                                  ...longTimeFormatOptions,
                                  timeZone: scheduledArrivalDateObject.timezone,
                                }
                              )}
                            </p>
                            {actualArrivalDate && (
                              <>
                                <p className="ion-no-margin">
                                  <small>Actual</small>
                                </p>
                                <p className="ion-no-margin">
                                  <IonText
                                    color={
                                      arrivalDelay !== undefined &&
                                      arrivalDelay <= 0
                                        ? "success"
                                        : "danger"
                                    }
                                  >
                                    {actualArrivalDate.toLocaleTimeString(
                                      "en-US",
                                      {
                                        ...longTimeFormatOptions,
                                        timeZone:
                                          scheduledArrivalDateObject.timezone,
                                      }
                                    )}
                                  </IonText>
                                </p>
                              </>
                            )}
                            {arrivalDelay && arrivalDelay !== 0 ? (
                              <p className="ion-no-margin">
                                <small>
                                  {durationString(arrivalDelay)}{" "}
                                  {arrivalDelay < 0 ? "early" : "late"}
                                </small>
                              </p>
                            ) : (
                              <p>
                                <small></small>
                              </p>
                            )}
                            {flight.Status.baggage_claim && (
                              <p>Baggage Claim {flight.Status.baggage_claim}</p>
                            )}
                          </IonCol>
                        </IonRow>
                        {flightAwareStatuses[ident] && (
                          <IonRow>
                            <IonCol>
                              <IonButton
                                shape="round"
                                href={`https://flightaware.com/live/flight/id/${flightAwareStatuses[ident].fa_flight_id}`}
                              >
                                Track on FlightAware
                              </IonButton>
                              {flightAwareStatuses[ident]
                                .inbound_fa_flight_id && (
                                <IonButton
                                  shape="round"
                                  href={`https://flightaware.com/live/flight/id/${flightAwareStatuses[ident].inbound_fa_flight_id}`}
                                >
                                  Track Inbound Flight on FlightAware
                                </IonButton>
                              )}
                            </IonCol>
                          </IonRow>
                        )}
                      </IonGrid>
                    </IonCol>
                    <IonCol size="auto">
                      {flightMaps[ident] && (
                        <IonRow>
                          <IonCol>
                            <IonThumbnail style={{ "--size": `${mapSize}px` }}>
                              <IonImg
                                src={`data:image/png;base64,${flightMaps[ident]}`}
                              />
                            </IonThumbnail>
                          </IonCol>
                        </IonRow>
                      )}
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonAccordion>
            );
          })}
        </IonAccordionGroup>
        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
