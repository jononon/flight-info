import { IonCard } from "@ionic/react";
import "./ExploreContainer.css";

interface ContainerProps {}

const ExploreContainer: React.FC<ContainerProps> = () => {
  return (
    <IonCard>
      <div className="container">
        <strong>Ready to create an app?</strong>
        <p>
          Start with Ionic{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://ionicframework.com/docs/components"
          >
            UI Components
          </a>
        </p>
      </div>
      <div className="container">
        <strong>Ready to create an app?</strong>
        <p>
          Start with Ionic{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://ionicframework.com/docs/components"
          >
            UI Components
          </a>
        </p>
      </div>
    </IonCard>
  );
};

export default ExploreContainer;
