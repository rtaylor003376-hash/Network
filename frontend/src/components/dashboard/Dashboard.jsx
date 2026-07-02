import { useState } from 'react';
import DailyQueue from './DailyQueue.jsx';
import UpcomingMeetings from './UpcomingMeetings.jsx';
import ProfileSummary from './ProfileSummary.jsx';
import StreakWidget from './StreakWidget.jsx';
import ScheduleModal from '../schedule/ScheduleModal.jsx';
import ReplyAlert from '../shared/ReplyAlert.jsx';
import { useConnections } from '../../hooks/useConnections.js';
import { useMeetings } from '../../hooks/useMeetings.js';
import { useStreak } from '../../hooks/useStreak.js';
import { useReplyWatcher } from '../../hooks/useReplyWatcher.js';
import styles from '../../styles/Dashboard.module.css';

export default function Dashboard() {
  const [schedulingFor, setSchedulingFor] = useState(null);
  const { connections, updateConnection } = useConnections();
  const { addMeeting } = useMeetings();
  const { recordAction } = useStreak();
  const { alerts, dismissAlert } = useReplyWatcher(connections);

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

  async function handleEmailAction(connectionId) {
    if (connectionId) {
      await updateConnection(connectionId, { status: 'queued', lastInteractionAt: new Date().toISOString() });
    }
    await recordAction({ isMeeting: false });
  }

  async function handleMarkReplied(connectionId) {
    await updateConnection(connectionId, { status: 'matched', lastInteractionAt: new Date().toISOString() });
    dismissAlert(connectionId);
  }

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <div className={styles.queueSection}>
          <ReplyAlert
            alerts={alerts}
            onMarkReplied={handleMarkReplied}
            onDismiss={dismissAlert}
          />
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
