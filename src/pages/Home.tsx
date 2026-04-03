import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  useIonToast,
  IonList,
} from "@ionic/react";
import { clipboardOutline } from "ionicons/icons";
import { useRef, useEffect, useState } from "react";
import ExploreContainer from "../components/ExploreContainer";
import "./Home.css";
import { API } from "aws-amplify";
import { FlightStatus } from "../types/FlightStatus";
import { FlightAwareStatus } from "../types/FlightAwareStatus";
import { DisplayFlight } from "../types/DisplayFlight";
import {
  IATAToICAO,
  colorForFaFlightStatus,
  mapTripItToDisplayFlight,
  enrichWithFlightAware,
  getIdent,
} from "../utils/flightMapper";

const millisecondsUntilTime = (timeIn: Date) => {
  return timeIn.getTime() - new Date().getTime();
};

const durationString = (millisecondsIn: number) => {
  const milliseconds = Math.abs(millisecondsIn);
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(milliseconds / (1000 * 60 * 60) - days * 24);
  const minutes = Math.floor(
    milliseconds / (1000 * 60) - (days * 24 * 60 + hours * 60),
  );

  if (days > 0) {
    return `${days}d, ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h, ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

const dateObjectsAreSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const Home: React.FC = () => {
  const [present] = useIonToast();

  const presentToast = (
    message: string,
    position: "top" | "middle" | "bottom",
  ) => {
    present({
      message: message,
      duration: 2000,
      position: position,
    });
  };

  const accordionGroup = useRef<null | HTMLIonAccordionGroupElement>(null);

  const [displayFlights, setDisplayFlights] = useState<Array<DisplayFlight>>(
    [],
  );
  const displayFlightsRef = useRef(displayFlights);
  const [flightMaps, setFlightMaps] = useState<{
    [key: string]: { map: string; fetchedDate: Date };
  }>({});
  const flightMapsRef = useRef(flightMaps);

  const [flightAwareStatuses, setFlightAwareStatuses] = useState<{
    [key: string]: { status: FlightAwareStatus; fetchedDate: Date };
  }>({});
  const flightAwareStatusesRef = useRef(flightAwareStatuses);

  const [incomingFlightAwareStatuses, setIncomingFlightAwareStatuses] =
    useState<{
      [key: string]: { statuses: Array<FlightAwareStatus>; fetchedDate: Date };
    }>({});
  const incomingFlightAwareStatusesRef = useRef(incomingFlightAwareStatuses);

  useEffect(() => {
    displayFlightsRef.current = displayFlights;
    flightMapsRef.current = flightMaps;
    flightAwareStatusesRef.current = flightAwareStatuses;
    incomingFlightAwareStatusesRef.current = incomingFlightAwareStatuses;
  });

  const getFlightsFunction = async () => {
    const newFlights = (await API.get(
      "tripItFlightsAdapter",
      "/tripit/flights/all",
      {},
    )) as Array<FlightStatus>;

    // Map all TripIt flights to DisplayFlight
    const mapped = newFlights.map(mapTripItToDisplayFlight);
    setDisplayFlights(mapped);
    return mapped;
  };

  let mapSize = Math.min(400, Math.floor(window.innerWidth) - 60);

  const getFlightAwareStatusForIdent = async (
    df: DisplayFlight,
    getMap: boolean,
    getIncomingFlights: boolean,
  ) => {
    const ident = df.ident;
    const start = df.scheduledDeparture.dateTime.toISOString();
    const end = df.scheduledArrival.dateTime.toISOString();

    let fa_flight_id = undefined;
    let inboundFaFlightId = undefined;

    if (
      flightAwareStatusesRef.current[ident] === undefined ||
      new Date().getTime() -
        flightAwareStatusesRef.current[ident].fetchedDate.getTime() >
        900000
    ) {
      const newFlightInfo = {
        status: (await API.get(
          "flightAwareAdapter",
          `/flightaware/details/${ident}?start=${start}&end=${end}`,
          {},
        )) as FlightAwareStatus,
        fetchedDate: new Date(),
      };

      fa_flight_id = newFlightInfo.status.fa_flight_id;
      inboundFaFlightId = newFlightInfo.status.inbound_fa_flight_id;

      setFlightAwareStatuses((flightAwareStatuses) => ({
        ...flightAwareStatuses,
        [ident]: newFlightInfo,
      }));

      // Enrich the display flight with FlightAware data
      setDisplayFlights((prev) =>
        prev.map((f) =>
          f.ident === ident
            ? enrichWithFlightAware(f, newFlightInfo.status)
            : f,
        ),
      );
    }

    if (
      getMap &&
      (flightMapsRef.current[ident] === undefined ||
        new Date().getTime() -
          flightMapsRef.current[ident].fetchedDate.getTime() >
          900000)
    ) {
      const map = {
        ...((await API.get(
          "flightAwareAdapter",
          `/flightaware/map/${fa_flight_id}?width=${mapSize}&height=${mapSize}`,
          {},
        )) as { map: string }),
        fetchedDate: new Date(),
      };

      setFlightMaps((flightMaps) => ({
        ...flightMaps,
        [ident]: map,
      }));
    }

    if (
      getIncomingFlights &&
      (incomingFlightAwareStatusesRef.current[ident] === undefined ||
        new Date().getTime() -
          incomingFlightAwareStatusesRef.current[ident].fetchedDate.getTime() >
          300000)
    ) {
      const incomingFlights: Array<FlightAwareStatus> = [];

      while (inboundFaFlightId !== undefined && inboundFaFlightId !== null) {
        const incomingFlightFlightAwareStatus = (await API.get(
          "flightAwareAdapter",
          `/flightaware/details/${inboundFaFlightId}`,
          {},
        )) as FlightAwareStatus;

        incomingFlights.push(incomingFlightFlightAwareStatus);

        if (incomingFlightFlightAwareStatus.progress_percent === 0) {
          inboundFaFlightId =
            incomingFlightFlightAwareStatus.inbound_fa_flight_id;
        } else {
          inboundFaFlightId = null;
        }
      }

      setIncomingFlightAwareStatuses((incomingFlightAwareStatuses) => ({
        ...incomingFlightAwareStatuses,
        [ident]: {
          statuses: incomingFlights,
          fetchedDate: new Date(),
        },
      }));
    }
  };

  const updateFlightAwareStatuses = async (
    flights: Array<DisplayFlight>,
  ) => {
    for (const df of flights) {
      const millisecondsUntilDeparture = df.estimatedDeparture
        ? millisecondsUntilTime(df.estimatedDeparture.dateTime)
        : millisecondsUntilTime(df.scheduledDeparture.dateTime);

      const millisecondsUntilArrival = df.estimatedArrival
        ? millisecondsUntilTime(df.estimatedArrival.dateTime)
        : millisecondsUntilTime(df.scheduledArrival.dateTime);

      if (millisecondsUntilDeparture <= 0 && millisecondsUntilArrival > 0) {
        await getFlightAwareStatusForIdent(df, true, false);
      } else if (
        millisecondsUntilDeparture < 1000 * 60 * 60 * 24 &&
        millisecondsUntilArrival > -60000
      ) {
        await getFlightAwareStatusForIdent(df, false, true);
      }
    }
  };

  const setupDataRequests = async () => {
    const mapped = await getFlightsFunction();
    await updateFlightAwareStatuses(mapped);

    let flightIndexToShow = 0;

    for (const df of displayFlightsRef.current) {
      const statusLower = df.statusText.toLowerCase();
      if (
        statusLower.includes("arrived") ||
        statusLower.includes("landed")
      ) {
        flightIndexToShow++;
      } else {
        break;
      }
    }

    if (!accordionGroup.current) {
      return;
    }

    accordionGroup.current.value = [`${flightIndexToShow}`];

    setInterval(() => {
      updateFlightAwareStatuses(displayFlightsRef.current);
    }, 300000);
  };

  useEffect(() => {
    setupDataRequests();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Jonathan's Flights</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Jonathan's Flights</IonTitle>
          </IonToolbar>
        </IonHeader>
        {displayFlights.length === 0 && (
          <IonItem lines="none">
            <IonSpinner name="dots"></IonSpinner>
          </IonItem>
        )}
        <IonAccordionGroup ref={accordionGroup} multiple={true}>
          {displayFlights.map((df, index) => {
            const millisecondsUntilDeparture = df.estimatedDeparture
              ? millisecondsUntilTime(df.estimatedDeparture.dateTime)
              : millisecondsUntilTime(df.scheduledDeparture.dateTime);

            const millisecondsUntilArrival = df.estimatedArrival
              ? millisecondsUntilTime(df.estimatedArrival.dateTime)
              : millisecondsUntilTime(df.scheduledArrival.dateTime);

            const departureCountdown = durationString(
              millisecondsUntilDeparture,
            );

            const arrivalCountdown = durationString(millisecondsUntilArrival);

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

            const longDateTimeFormatOptions: Intl.DateTimeFormatOptions = {
              hour12: true,
              hour: "2-digit",
              minute: "2-digit",
              timeZoneName: "short",
              month: "short",
              day: "numeric",
            };

            const dateDifferenceFormatter = Intl.NumberFormat("en-US", {
              signDisplay: "always",
            });

            return (
              <IonAccordion value={`${index}`} key={index}>
                <IonItem slot="header" color="light">
                  <IonLabel>
                    {df.scheduledDeparture.dateTime.toLocaleDateString("en-US", {
                      ...shortDateFormatOptions,
                      timeZone: df.scheduledDeparture.timezone,
                    })}{" "}
                    | {df.startAirportCode} - {df.endAirportCode}
                  </IonLabel>
                  <IonBadge color={df.statusColor}>
                    {df.statusText}
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
                              {df.marketingAirline}{" "}
                              {df.marketingFlightNumber}
                            </h5>
                            <p className="ion-no-margin">
                              {df.ident}{" "}
                              <a
                                role="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(df.ident);
                                }}
                              >
                                <IonIcon icon={clipboardOutline}></IonIcon>
                              </a>
                            </p>
                            <br />
                            <IonText color={df.statusColor}>
                              <h3 className="ion-no-margin">
                                {df.longStatusText}
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
                          <IonCol>
                            <IonItem lines="none">
                              <IonThumbnail slot="end">
                                <img
                                  src={`assets/airline-logos/${
                                    IATAToICAO[df.marketingAirlineCode]
                                  }.png`}
                                />
                              </IonThumbnail>
                            </IonItem>
                          </IonCol>
                        </IonRow>
                        <br />
                        <IonRow>
                          <IonCol>
                            <p className="ion-no-margin">Departure</p>
                            <h1 className="ion-no-margin">
                              {df.startAirportCode}
                            </h1>
                            <h4 className="ion-no-margin">
                              {df.startCityName}
                            </h4>
                            <p className="ion-no-margin">
                              {df.departureTerminal && (
                                <span>
                                  Terminal {df.departureTerminal}
                                </span>
                              )}
                              {df.departureGate && (
                                <span>
                                  , Gate {df.departureGate}
                                </span>
                              )}
                            </p>
                            <p className="ion-no-margin">
                              <small>Scheduled</small>
                            </p>
                            <p className="ion-no-margin">
                              {df.scheduledDeparture.dateTime.toLocaleTimeString(
                                "en-US",
                                {
                                  ...longTimeFormatOptions,
                                  timeZone: df.scheduledDeparture.timezone,
                                },
                              )}
                            </p>
                            {df.estimatedDeparture && (
                              <>
                                <p className="ion-no-margin">
                                  <small>Actual</small>
                                </p>
                                <p className="ion-no-margin">
                                  <IonText
                                    color={
                                      df.departureDelay !== undefined &&
                                      df.departureDelay <= 0
                                        ? "success"
                                        : "danger"
                                    }
                                  >
                                    {df.estimatedDeparture.dateTime.toLocaleTimeString(
                                      "en-US",
                                      {
                                        ...longTimeFormatOptions,
                                        timeZone:
                                          df.scheduledDeparture.timezone,
                                      },
                                    )}
                                  </IonText>
                                </p>
                              </>
                            )}
                            {df.departureDelay && df.departureDelay !== 0 ? (
                              <p className="ion-no-margin">
                                <small>
                                  {durationString(df.departureDelay)}{" "}
                                  {df.departureDelay < 0 ? "early" : "late"}
                                </small>
                              </p>
                            ) : (
                              <p>
                                <small></small>
                              </p>
                            )}
                            <p>Duration: {df.duration}</p>
                          </IonCol>
                          <IonCol class="ion-text-end">
                            <p className="ion-no-margin">Arrival</p>
                            <h1 className="ion-no-margin">
                              {df.endAirportCode}
                            </h1>
                            <h4 className="ion-no-margin">
                              {df.endCityName}
                            </h4>
                            {df.arrivalTerminal && (
                              <span>
                                Terminal {df.arrivalTerminal}
                              </span>
                            )}
                            {df.arrivalGate && (
                              <span>, Gate {df.arrivalGate}</span>
                            )}
                            <p className="ion-no-margin">
                              <small>Scheduled</small>
                            </p>
                            <p className="ion-no-margin">
                              {df.scheduledArrival.dateTime.toLocaleTimeString(
                                "en-US",
                                {
                                  ...longTimeFormatOptions,
                                  timeZone: df.scheduledArrival.timezone,
                                },
                              )}
                              {df.scheduledDateDifference !== undefined &&
                                df.scheduledDateDifference !== 0 && (
                                  <IonText color="danger">
                                    <small>
                                      {" "}
                                      {dateDifferenceFormatter.format(
                                        df.scheduledDateDifference,
                                      )}
                                    </small>
                                  </IonText>
                                )}
                            </p>
                            {df.estimatedArrival && (
                              <>
                                <p className="ion-no-margin">
                                  <small>Actual</small>
                                </p>
                                <p className="ion-no-margin">
                                  <IonText
                                    color={
                                      df.arrivalDelay !== undefined &&
                                      df.arrivalDelay <= 0
                                        ? "success"
                                        : "danger"
                                    }
                                  >
                                    {df.estimatedArrival.dateTime.toLocaleTimeString(
                                      "en-US",
                                      {
                                        ...longTimeFormatOptions,
                                        timeZone:
                                          df.scheduledArrival.timezone,
                                      },
                                    )}
                                  </IonText>
                                  {df.estimatedDateDifference !== undefined &&
                                    df.estimatedDateDifference !== 0 && (
                                      <IonText color="danger">
                                        <small>
                                          {" "}
                                          {dateDifferenceFormatter.format(
                                            df.estimatedDateDifference,
                                          )}
                                        </small>
                                      </IonText>
                                    )}
                                </p>
                              </>
                            )}
                            {df.arrivalDelay && df.arrivalDelay !== 0 ? (
                              <p className="ion-no-margin">
                                <small>
                                  {durationString(df.arrivalDelay)}{" "}
                                  {df.arrivalDelay < 0 ? "early" : "late"}
                                </small>
                              </p>
                            ) : (
                              <p>
                                <small></small>
                              </p>
                            )}
                            {df.baggageClaim && (
                              <p>Baggage Claim {df.baggageClaim}</p>
                            )}
                          </IonCol>
                        </IonRow>
                        {incomingFlightAwareStatuses[df.ident] && (
                          <IonRow>
                            <IonCol>
                              <h3>Incoming Flights</h3>
                              <IonList>
                                {incomingFlightAwareStatuses[
                                  df.ident
                                ].statuses.map((incomingFlight) => (
                                  <IonItem key={incomingFlight.ident}>
                                    <IonLabel class="ion-text-wrap">
                                      <h2>
                                        {incomingFlight.ident}{" "}
                                        <a
                                          role="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(
                                              incomingFlight.ident,
                                            );
                                          }}
                                        >
                                          <IonIcon
                                            icon={clipboardOutline}
                                          ></IonIcon>
                                        </a>
                                      </h2>
                                      <p>
                                        {incomingFlight.origin.code_iata}
                                        {" - "}
                                        {incomingFlight.destination.code_iata}
                                      </p>
                                      <p>
                                        {"Dep "}
                                        {new Date(
                                          incomingFlight.actual_out ??
                                            incomingFlight.estimated_out ??
                                            incomingFlight.scheduled_out,
                                        ).toLocaleString("en-US", {
                                          ...longDateTimeFormatOptions,
                                          timeZone:
                                            incomingFlight.origin.timezone,
                                        })}
                                        {", Arr "}
                                        {new Date(
                                          incomingFlight.actual_in ??
                                            incomingFlight.estimated_in ??
                                            incomingFlight.scheduled_in,
                                        ).toLocaleString("en-US", {
                                          ...longDateTimeFormatOptions,
                                          timeZone:
                                            incomingFlight.destination.timezone,
                                        })}
                                      </p>
                                      {incomingFlight.arrival_delay >= 300 && (
                                        <p>
                                          <IonText color="danger">
                                            {"Delayed by "}
                                            {durationString(
                                              incomingFlight.arrival_delay *
                                                1000,
                                            )}
                                          </IonText>
                                        </p>
                                      )}
                                    </IonLabel>
                                    <IonBadge
                                      slot="end"
                                      color={colorForFaFlightStatus(
                                        incomingFlight,
                                      )}
                                    >
                                      {incomingFlight.status}
                                    </IonBadge>
                                    <IonButton
                                      slot="end"
                                      href={`https://flightaware.com/live/flight/id/${incomingFlight.fa_flight_id}`}
                                      target="_blank"
                                    >
                                      Track
                                    </IonButton>
                                  </IonItem>
                                ))}
                              </IonList>
                            </IonCol>
                          </IonRow>
                        )}
                        <IonRow>
                          <IonCol>
                            <IonButton
                              shape="round"
                              onClick={async () => {
                                const bestDeparture =
                                  df.estimatedDeparture ?? df.scheduledDeparture;
                                const bestArrival =
                                  df.estimatedArrival ?? df.scheduledArrival;

                                const departureDateTimeString =
                                  bestDeparture.dateTime.toLocaleTimeString(
                                    "en-US",
                                    {
                                      ...(dateObjectsAreSameDay(
                                        bestDeparture.dateTime,
                                        new Date(),
                                      )
                                        ? longTimeFormatOptions
                                        : longDateTimeFormatOptions),
                                      timeZone:
                                        df.scheduledDeparture.timezone,
                                    },
                                  );

                                const arrivalDateTimeString =
                                  bestArrival.dateTime.toLocaleTimeString(
                                    "en-US",
                                    {
                                      ...(dateObjectsAreSameDay(
                                        bestArrival.dateTime,
                                        new Date(),
                                      )
                                        ? longTimeFormatOptions
                                        : longDateTimeFormatOptions),
                                      timeZone:
                                        df.scheduledArrival.timezone,
                                    },
                                  );

                                const shareData = {
                                  title: `Jonathan Damico's Flight`,
                                  text: `${df.ident}\n${
                                    df.longStatusText
                                  }\nDep ${departureDateTimeString} @ ${
                                    df.startAirportCode
                                  }${
                                    df.departureTerminal
                                      ? ` Terminal ${df.departureTerminal}`
                                      : ""
                                  }${
                                    df.departureGate
                                      ? ` Gate ${df.departureGate}`
                                      : ""
                                  }\nArr ${arrivalDateTimeString} @ ${
                                    df.endAirportCode
                                  }${
                                    df.arrivalTerminal
                                      ? ` Terminal ${df.arrivalTerminal}`
                                      : ""
                                  }${
                                    df.arrivalGate
                                      ? ` Gate ${df.arrivalGate}`
                                      : ""
                                  }${
                                    df.baggageClaim
                                      ? ` Baggage Claim ${df.baggageClaim}`
                                      : ""
                                  }`,
                                };

                                try {
                                  await navigator.share(shareData);
                                } catch (err) {
                                  navigator.clipboard.writeText(
                                    shareData.text + " \njdami.co/flights",
                                  );
                                  presentToast("Copied to clipboard", "top");
                                }
                              }}
                            >
                              Share Details
                            </IonButton>
                            {df.faFlightId && (
                              <IonButton
                                shape="round"
                                href={`https://flightaware.com/live/flight/id/${df.faFlightId}`}
                                target="_blank"
                              >
                                Track on FlightAware
                              </IonButton>
                            )}
                            {df.inboundFaFlightId && (
                              <IonButton
                                shape="round"
                                href={`https://flightaware.com/live/flight/id/${df.inboundFaFlightId}`}
                                target="_blank"
                              >
                                Track Inbound Flight on FlightAware
                              </IonButton>
                            )}
                            {df.registration && (
                              <IonButton
                                shape="round"
                                href={`https://www.flightradar24.com/${df.registration}`}
                                target="_blank"
                              >
                                Track Aircraft on FlightRadar24
                              </IonButton>
                            )}
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCol>
                    <IonCol size="auto">
                      {flightMaps[df.ident] && (
                        <IonRow>
                          <IonCol>
                            <IonThumbnail style={{ "--size": `${mapSize}px` }}>
                              <IonImg
                                src={`data:image/png;base64,${flightMaps[df.ident].map}`}
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
        <div style={{ textAlign: "center", padding: "20px" }}>
          <a href="https://my.flightradar24.com/jonathandamico">
            <img
              src="https://banners-my.flightradar24.com/jonathandamico.png"
              alt="My Flightdiary.net profile"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </a>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
