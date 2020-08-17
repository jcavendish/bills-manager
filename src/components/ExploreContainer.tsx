import React from 'react';
import './ExploreContainer.css';
import { IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';

interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {
  return (
    <div className="container">
      {/*-- fab placed to the top end --*/}
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton>
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>
    </div>
  );
};

export default ExploreContainer;
