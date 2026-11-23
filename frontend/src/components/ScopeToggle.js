// Bascule « Toutes / Ma paroisse » — n'apparaît que si le membre a une paroisse.
export default function ScopeToggle({ scope, setScope }) {
  const base = { flex: 1, borderRadius: 25, padding: '10px 14px', textTransform: 'none', fontSize: '0.9rem' };
  return (
    <div style={{ display: 'flex', gap: 8, maxWidth: 360, margin: '0 auto 20px' }} role="group" aria-label="Filtrer par paroisse">
      <button type="button" onClick={() => setScope('all')} className={scope === 'all' ? '' : 'btn-outline'} style={base}>Toutes</button>
      <button type="button" onClick={() => setScope('mine')} className={scope === 'mine' ? '' : 'btn-outline'} style={base}>Ma paroisse</button>
    </div>
  );
}
