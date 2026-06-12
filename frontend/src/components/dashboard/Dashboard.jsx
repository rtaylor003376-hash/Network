import { useState } from 'react';
import DailyQueue from './DailyQueue.jsx';
import UpcomingMeetings from './UpcomingMeetings.jsx';
import ProfileSummary from './ProfileSummary.jsx';
import ScheduleModal from '../schedule/ScheduleModal.jsx';
import { useConnections } from '../../hooks/useConnections.js';
import { useMeetings } from '../../hooks/useMeetings.js';
import styles from '../../styles/Dashboard.module.css';

export default function Dashboard() {
  const [schedulingFor, setSchedulingFor] = useState(null);
  const { updateConnection } = useConnections();
  const { addMeeting } = useMeetings();

  async function handleScheduled(connection, meetingData) {
    const meetingId = await addMeeting({
      connectionId: connection.id,
      connectionName: `${connection.firstName} ${connection.lastName}`,
      connectionCompany: connection.company,
      connectionPosition: connection.position,
      ...meetingData,
    });
    await updateConnection(connection.id, {
      status: 'scheduled',
      lastInteractionAt: new Date().toISOString(),
    });
    setSchedulingFor(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <div className={styles.queueSection}>
          <DailyQueue onSchedule={setSchedulingFor} />
        </div>
        <div className={styles.sidebar}>
          <UpcomingMeetings />
          <ProfileSummary />
        </div>
      </div>

      {schedulingFor && (
        <ScheduleModal
          connection={schedulingFor}
          onClose={() => setSchedulingFor(null)}
          onScheduled={handleScheduled}
        />
      )}
    </div>
  );
}
