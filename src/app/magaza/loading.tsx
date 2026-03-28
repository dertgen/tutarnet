export default function MagazaPaneliLoading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid var(--muted-bg)", borderTopColor: "var(--teal)", borderRadius: "50%", margin: "0 auto 10px", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--muted-fg)", fontSize: "13px" }}>Yükleniyor…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
