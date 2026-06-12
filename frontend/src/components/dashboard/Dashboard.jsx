import { useState } from 'react';
import DailyQueue from './DailyQueue.jsx';
import UpcomingMeetings from './UpcomingMeetings.jsx';
import ProfileSummary from './ProfileSummary.jsx';
import StreakWidget from './StreakWidget.jsx';
import ScheduleModal from '../schedule/ScheduleModal.jsx';
import { useConnections } from '../../hooks/useConnections.js';
import { useMeetings } from '../../hooks/useMeetings.js';
import { useStreak } from '../../hooks/useStreak.js';
import styles from '../../styles/Dashboard.module.css';

export default function Dashboard() {
  const [schedulingFor, setSchedulingFor] = useState(null);
  const { updateConnection } = useConnections();
  const { addMeeting } = useMeetings();
  const { recordAction } = useStreak();

  async function handleScheduled(connection, meetingData) {
    await addMeeting({
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
    await recordAction({ isMeeting: true });
    setSchedulingFor(null);
  }

  async function handleEmailAction() {
    await recordAction({ isMeeting: false });
  }

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <div className={styles.queueSection}>
          <DailyQueue onSchedule={setSchedulingFor} onEmailAction={handleEmailAction} />
        </div>
        <div className={styles.sidebar}>
          <StreakWidget />
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
