import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaUserSecret, FaUser } from 'react-icons/fa';

export default function FinanceManager() {
  const [donations, setDonations] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchFinances = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:3002/admin/finances', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDonations(data);
                const sum = data.reduce((acc, curr) => acc + curr.amount, 0);
                setTotal(sum);
            }
        } catch (err) { console.error(err); }
    };
    fetchFinances();
  }, []);

  return (
    <div>
        <h2 style={{ borderBottom:'2px solid var(--primary)', paddingBottom:10 }}>Gestion Financière</h2>
        
        <div style={{ display:'flex', gap:20, margin:'20px 0' }}>
            <div className="card" style={{ flex:1, background:'linear-gradient(135deg, #10b981 0%, #059669 100%)', color:'white', textAlign:'center' }}>
                <h3>Total Récolté</h3>
                <div style={{ fontSize:'2.5rem', fontWeight:'bold' }}>{total.toLocaleString()} XAF</div>
            </div>
            <div className="card" style={{ flex:1, textAlign:'center' }}>
                <h3>Nombre de Dons</h3>
                <div style={{ fontSize:'2.5rem', fontWeight:'bold', color:'var(--primary)' }}>{donations.length}</div>
            </div>
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                    <tr style={{ background:'#f9f9f9', textAlign:'left' }}>
                        <th style={{ padding:15 }}>Donateur</th>
                        <th style={{ padding:15 }}>Type</th>
                        <th style={{ padding:15 }}>Montant</th>
                        <th style={{ padding:15 }}>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {donations.map(don => (
                        <tr key={don._id} style={{ borderBottom:'1px solid #eee' }}>
                            <td style={{ padding:15 }}>
                                {/* CAS 1 : MEMBRE CONNECTÉ */}
                                {don.donor ? (
                                    <div style={{display:'flex', flexDirection:'column'}}>
                                        <strong style={{color:'var(--primary)'}}><FaUser size={10}/> {don.donor.name}</strong>
                                        <small style={{color:'#888'}}>{don.donor.email}</small>
                                    </div>
                                ) : (
                                    /* CAS 2 : INVITÉ AVEC NOM */
                                    don.guestName ? (
                                        <div style={{display:'flex', flexDirection:'column'}}>
                                            <strong>{don.guestName} (Invité)</strong>
                                            <small style={{color:'#888'}}>{don.guestEmail || 'Pas d\'email'}</small>
                                        </div>
                                    ) : (
                                        /* CAS 3 : TOTALEMENT ANONYME */
                                        <span style={{fontStyle:'italic', color:'#aaa', display:'flex', alignItems:'center', gap:5}}>
                                            <FaUserSecret /> Anonyme
                                        </span>
                                    )
                                )}
                            </td>
                            <td style={{ padding:15 }}><span style={{ background:'#eef2ff', color:'var(--primary)', padding:'3px 8px', borderRadius:'10px', fontSize:'0.8em' }}>{don.type}</span></td>
                            <td style={{ padding:15, fontWeight:'bold', color:'#10b981' }}>+ {don.amount}</td>
                            <td style={{ padding:15, fontSize:'0.9em', color:'#666' }}>{new Date(don.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {donations.length === 0 && <p style={{textAlign:'center', padding:20}}>Aucun don enregistré.</p>}
        </div>
    </div>
  );
}