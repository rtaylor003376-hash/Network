import { useState, useMemo } from 'react';
import { useConnections } from '../../hooks/useConnections.js';
import { useMeetings } from '../../hooks/useMeetings.js';
import { useStreak } from '../../hooks/useStreak.js';
import { useNavigate } from 'react-router-dom';
import ScheduleModal from '../schedule/ScheduleModal.jsx';
import LoadingSpinner from '../shared/LoadingSpinner.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import ConnectionGroup from './ConnectionGroup.jsx';
import styles from '../../styles/ConnectionsTab.module.css';

const STATUS_FILTERS = [
  { value: 'all',       label: 'All' },
  { value: 'new',       label: 'New' },
  { value: 'queued',    label: 'Queued' },
  { value: 'matched',   label: 'Matched' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'met',       label: 'Met' },
];

export default function ConnectionsTab() {
  const { connections, loading, updateConnection } = useConnections();
  const { addMeeting } = useMeetings();
  const { recordAction } = useStreak();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [schedulingFor, setSchedulingFor] = useState(null);

  const filtered = useMemo(() => {
    let list = connections;
    if (statusFilter !== 'all') list = list.filter((c) => c.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          (c.company || '').toLowerCase().includes(q) ||
          (c.position || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [connections, search, statusFilter]);

  const grouped = useMemo(() => {
    const map = {};
    for (const conn of filtered) {
      const key = conn.company || 'No company';
      if (!map[key]) map[key] = [];
      map[key].push(conn);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  async function handleMarkReplied(connId) {
    await updateConnection(connId, { status: 'matched', lastInteractionAt: new Date().toISOString() });
  }

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

  if (loading) return <div className={styles.page}><LoadingSpinner /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Network</h1>
          <p className={styles.subtitle}>{connections.length} connections imported</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/import')}>
          Import CSV
        </button>
      </div>

      <div className={styles.controls}>
        <input
          className={styles.search}
          placeholder="Search by name, company, or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filters}>
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              className={`${styles.filterBtn} ${statusFilter === value ? styles.filterActive : ''}`}
              onClick={() => setStatusFilter(value)}
            >
              {label}
              {value !== 'all' && (
                <span className={styles.filterCount}>
                  {connections.filter((c) => c.status === value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {grouped.length === 0 ? (
        <EmptyState
          icon="👥"
          title={connections.length === 0 ? 'No connections yet' : 'No matches'}
          subtitle={
            connections.length === 0
              ? 'Import your LinkedIn Connections.csv to get started.'
              : 'Try adjusting your search or filter.'
          }
          action={
            connections.length === 0 && (
              <button className="btn-primary" onClick={() => navigate('/import')}>
                Import connections
              </button>
            )
          }
        />
      ) : (
        <div className={styles.groups}>
          {grouped.map(([company, conns]) => (
            <ConnectionGroup
              key={company}
              company={company}
              connections={conns}
              onMarkReplied={handleMarkReplied}
              onSchedule={setSchedulingFor}
            />
          ))}
        </div>
      )}

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
