import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useRef, useEffect, useState } from "react";
import ExploreContainer from "../components/ExploreContainer";
import "./Home.css";
import { API } from "aws-amplify";
import { FlightStatus } from "../types/FlightStatus";

const flightStatuses: { [key: string]: { statusText: string; color: string } } =
  {
    "100": { statusText: "Unmonitored", color: "primary" }, //"Not Monitorable"
    "200": { statusText: "Unmonitored", color: "primary" }, //"Not Monitored"
    "300": { statusText: "Scheduled", color: "primary" }, //"Scheduled"
    "301": { statusText: "On Time", color: "success" }, //"On Time"
    "302": { statusText: "In Flight - On Time", color: "success" }, //"In Flight - On Time"
    "303": { statusText: "Arrived - On Time", color: "success" }, //"Arrived - On Time"
    "400": { statusText: "Cancelled", color: "#danger" }, //"Cancelled"
    "401": { statusText: "Delayed", color: "#danger" }, //"Delayed"
    "402": { statusText: "In Flight", color: "#warning" }, //"In Flight - late"
    "403": { statusText: "Arrived", color: "#warning" }, //"Arrived - late"
    "404": { statusText: "Diverted", color: "#danger" }, //"Diverted"
    "405": { statusText: "Poss Delayed", color: "#danger" }, //"Possibly Delayed"
    "406": { statusText: "In Flight", color: "#warning" }, //"In Flight - Possibly Late"
    "407": { statusText: "Arrived", color: "#warning" }, //"Arrived - Possibly Late"
    "408": { statusText: "Unknown", color: "primary" }, //"Unknown"
  };

const countdownString = (timeIn: Date) => {
  const duration = timeIn.getTime() - new Date().getTime();

  const days = Math.floor(duration / (1000 * 60 * 60 * 24));
  const hours = Math.floor(duration / (1000 * 60 * 60) - days * 24);
  const minutes = Math.floor(
    duration / (1000 * 60) - (days * 24 * 60 + hours * 60)
  );

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

const Home: React.FC = () => {
  const accordionGroup = useRef<null | HTMLIonAccordionGroupElement>(null);

  const [flights, setFlights] = useState<Array<FlightStatus>>([]);

  const getFlightsFunction = async () => {
    setFlights(
      (await API.get(
        "tripItFlightsAdapter",
        "/tripit/flights/asdf",
        {}
      )) as Array<FlightStatus>
    );
  };

  useEffect(() => {
    getFlightsFunction();
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
            <IonTitle size="large">Jonathan Damico's Flights</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonAccordionGroup ref={accordionGroup} multiple={true}>
          {flights.map((flight, index) => {
            const startTime = new Date(
              flight["StartDateTime"]["date"] +
                "T" +
                flight["StartDateTime"]["time"] +
                flight["StartDateTime"]["utc_offset"]
            );

            const endTime = new Date(
              flight["EndDateTime"]["date"] +
                "T" +
                flight["EndDateTime"]["time"] +
                flight["EndDateTime"]["utc_offset"]
            );

            const shortDateFormatOptions: Intl.DateTimeFormatOptions = {
              weekday: "short",
              month: "short",
              day: "numeric",
            };

            const shortTimeFormatOptions: Intl.DateTimeFormatOptions = {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            };
            return (
              <IonAccordion value={`${index}`} key={index}>
                <IonItem slot="header" color="light">
                  <IonLabel>
                    {startTime.toLocaleDateString(
                      "en-GB",
                      shortDateFormatOptions
                    )}{" "}
                    |{" "}
                    {startTime.toLocaleTimeString(
                      "en-GB",
                      shortTimeFormatOptions
                    )}{" "}
                    {flight.start_airport_code} - {flight.end_airport_code}{" "}
                    {endTime.toLocaleTimeString(
                      "en-GB",
                      shortTimeFormatOptions
                    )}
                  </IonLabel>
                  <IonBadge
                    color={flightStatuses[flight.Status.flight_status].color}
                  >
                    {flightStatuses[flight.Status.flight_status].statusText}
                  </IonBadge>
                </IonItem>

                <IonGrid slot="content" className="ion-padding">
                  <IonRow>
                    <IonCol>
                      <h5>
                        {flight.marketing_airline_code}
                        {flight.marketing_flight_number}
                      </h5>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol>
                      <h3>
                        {flight.start_city_name} ({flight.start_airport_code})
                      </h3>
                      <p>{startTime.toLocaleString()}</p>
                    </IonCol>
                    <IonCol class="ion-text-end">
                      <h3>
                        {flight.end_city_name} ({flight.end_airport_code})
                      </h3>
                      <p>{endTime.toLocaleString()}</p>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol>
                      <p>Duration: {flight.duration}</p>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol>
                      <p>Countdown: {countdownString(startTime)}</p>
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
