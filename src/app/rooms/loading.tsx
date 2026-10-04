export default function LoadingRooms() {
  return <div aria-busy="true" aria-live="polite"><h1>กำลังโหลดห้องประชุม…</h1><div className="room-grid">{[1,2,3].map(item => <div className="skeleton" key={item} />)}</div></div>;
}
