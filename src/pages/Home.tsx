import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useRef, useEffect } from "react";
import ExploreContainer from "../components/ExploreContainer";
import "./Home.css";

const Home: React.FC = () => {
  const accordionGroup = useRef<null | HTMLIonAccordionGroupElement>(null);

  useEffect(() => {
    if (!accordionGroup.current) {
      return;
    }

    accordionGroup.current.value = ["first"];
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
          <IonAccordion value="first">
            <IonItem slot="header" color="light">
              <IonLabel>25 Sep | 11:25 LAX - JFK 18:40</IonLabel>
              <IonBadge>On Time</IonBadge>
            </IonItem>
            <div className="ion-padding" slot="content">
              First Content
            </div>
          </IonAccordion>
        </IonAccordionGroup>
        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
