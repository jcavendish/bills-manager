import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonDatetime,
  IonButton,
  IonItemDivider,
  IonInput,
  IonList,
  IonItemOptions,
  IonItemOption,
  IonItemSliding,
  IonRadioGroup,
  IonListHeader,
  IonRadio
} from '@ionic/react';

import { add, menuOutline, checkmarkDoneOutline, arrowUndoCircleOutline } from 'ionicons/icons';
import { format, compareAsc, getDay, addMonths, getDate } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import axios from 'axios';

import './Home.css';
import { formatISO } from 'date-fns/esm';

interface Bill {
  id: number;
  name: string;
  date: Date;
  expirationDay?: string;
  status: 'paid' | 'open';
}

interface Month {
  year: number;
  month: number;
}

const Home: React.FC = () => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [showFilterCard, setShowFilterCard] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [name, setName] = useState('');
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<'paid' | 'open' | undefined>();

  const billsComparator = useMemo(() => (a: Bill, b: Bill) => {
    if (a.status === 'open' && b.status !== 'open') {
      return -1;
    } else if (b.status === 'open' && a.status !== 'open') {
      return 1;
    } else {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
  }, [])

  useEffect(() => {
    axios.get<Month[]>('http://localhost:3333/months').then(response => {
      let currentDate = new Date();
      currentDate = addMonths(currentDate, 1);
      console.log(currentDate)
      const alreadyRegistered = response.data
          .find(month => month.year === currentDate.getFullYear() && currentDate.getMonth())
      console.log(alreadyRegistered)
      console.log(getDay(currentDate))
      if (!alreadyRegistered && getDate(currentDate) > 15) {
        const newBills = bills.map(bill => {
          return {
            ...bill,
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), bill.date.getDate()),
            status: 'open'
          }
        })
        console.log(bills)
        axios.post<Bill[]>('http://localhost:3333/bills', newBills)
        axios.post<Month>('http://localhost:3333/months', {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth()
        })
      }
    })
  }, [bills])

  useEffect(() => {
    axios.get<Bill[]>('http://localhost:3333/bills')
      .then(response => setBills(response.data.map(bill => {
        return {
          ...bill,
          expirationDay: format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
        }
      }).sort(billsComparator)));
  }, [billsComparator, selectedDate])

  const parsedDate = useMemo(() => {
    if (selectedDate) {
      console.log(formatISO(selectedDate))
      return formatISO(selectedDate);
    }
    return '';
  }, [selectedDate])

  const handleAddShowCard = useCallback(() => {
    setShowAddCard(state => !state);
  }, [])

  const handleFilterShowCard = useCallback(() => {
    setShowFilterCard(state => !state);
  }, [])

  const handleSelectedDate = useCallback((date: string) => {
    setSelectedDate(new Date(date))
  }, [])

  const handleAddBill = useCallback(async () => {
    const response = await axios.post('http://localhost:3333/bills', {
      name, 
      date: selectedDate,
      status: 'open'
    })
    setBills([...bills, response.data]);
    setName('');
    setSelectedDate(new Date());
    setShowAddCard(state => !state);
  }, [name, selectedDate, bills])

  const handleStatusChange = useCallback(async (id: number, status) => {
    const response = await axios.patch(`http://localhost:3333/bills/${id}`, {
      status
    });
    console.log(response.data)
    setBills(bills.map(bill => {
      if (bill.id === id) {
        console.log("trocou")
        return response.data;
      }
      return bill;
    }).sort(billsComparator))
  }, [bills, billsComparator])

  const handleFilterStatus = useCallback(status => {
    setFilteredStatus(status);
    axios.get<Bill[]>('http://localhost:3333/bills')
      .then(response => setBills(response.data.filter(bill => {
        if (status === 'all') {
          return true;
        }
        return bill.status === status;
      }).sort(billsComparator)));
  }, [billsComparator])

  const statusColor = useCallback((bill : Bill) => {
    if (bill.status === 'paid') {
      return "success";
    }
    const billDate = new Date(bill.date);
    const parsedDate = new Date(billDate.getFullYear(), billDate.getMonth(), billDate.getDate());
    
    const currentDate = new Date();
    const parsedCurrent = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    if (parsedDate.getTime() - parsedCurrent.getTime() < 0) {
      return "danger";
    }

    if (compareAsc(parsedDate, parsedCurrent) === 0) {
      return "warning";
    }

    return "secondary";
  }, [])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Bills Manager</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Bills Manager</IonTitle>
          </IonToolbar>
        </IonHeader>
        {/*-- fab placed to the top start --*/}
        <IonFab className="filter-button" vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleFilterShowCard}>
            <IonIcon icon={menuOutline} />
          </IonFabButton>
        </IonFab>
        {/*-- fab placed to the top end --*/}
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleAddShowCard}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        {/*-- add new bill card --*/}
        {showAddCard && 
          <IonCard>
            <IonCardHeader>
              <IonCardSubtitle>Add a new bill</IonCardSubtitle>
              <IonCardTitle>New</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>

            <IonItem>
              <IonInput 
                value={name} 
                placeholder="Enter name" 
                onIonChange={e => setName(e.detail.value!)} 
                clearInput
              />
            </IonItem>
            <IonItemDivider></IonItemDivider>
            <IonItem>
              <IonLabel>Expiration day</IonLabel>
                <IonDatetime
                  displayFormat="DD" 
                  placeholder="Select a day" 
                  value={parsedDate} 
                  onIonChange={e => handleSelectedDate(e.detail.value!)}
                >
                </IonDatetime>
              </IonItem>
              <IonButton 
                expand="block"
                onClick={handleAddBill}
              >Register</IonButton>
              <IonButton 
                color="medium" 
                expand="block"
                onClick={handleAddShowCard}
              >Close</IonButton>
            </IonCardContent>
          </IonCard>
        }
        {/*-- add filter bills card --*/}
        {showFilterCard && 
          <IonCard>
            <IonCardHeader>
              <IonCardSubtitle>Filter your Bills</IonCardSubtitle>
              <IonCardTitle>Filters</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <IonRadioGroup 
                value={filteredStatus} 
                onIonChange={e => handleFilterStatus(e.detail.value)}>
              <IonListHeader>
                <IonLabel>Status</IonLabel>
              </IonListHeader>

              <IonItem>
                <IonLabel>Paid</IonLabel>
                <IonRadio slot="start" value="paid" />
              </IonItem>

              <IonItem>
                <IonLabel>Open</IonLabel>
                <IonRadio slot="start" value="open" />
              </IonItem>

              <IonItem>
                <IonLabel>All</IonLabel>
                <IonRadio slot="start" value="all" />
              </IonItem>
            </IonRadioGroup>
            </IonCardContent>
          </IonCard>
        }
        {/*-- List of Bills --*/}
        <IonList lines="full">
          {bills.map(bill => (
            <IonItemSliding 
              key={bill.id} 
            >
              <IonItem color={statusColor(bill)} >
                <IonLabel>
                  <h2>{bill.name}</h2>
                  <p>Expiration date: {bill.expirationDay}</p>
                </IonLabel>
              </IonItem>
              <IonItemOptions side="start">
                <IonItemOption 
                  color="success"
                  onClick={() => handleStatusChange(bill.id, "paid")}
                >
                  <IonIcon 
                    slot="bottom" 
                    ios={checkmarkDoneOutline} 
                    md={checkmarkDoneOutline}></IonIcon>
                </IonItemOption>
              </IonItemOptions>
              <IonItemOptions side="end">
                <IonItemOption 
                  color="danger"
                  onClick={() => handleStatusChange(bill.id, "open")}
                >
                  <IonIcon 
                    slot="bottom" 
                    ios={arrowUndoCircleOutline} 
                    md={arrowUndoCircleOutline}></IonIcon>
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
