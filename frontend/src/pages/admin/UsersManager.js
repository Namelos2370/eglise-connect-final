import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTrash, FaSearch } from 'react-icons/fa';

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:3002/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if(res.ok) setUsers(await res.json());
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("Bannir cet utilisateur et supprimer ses données ?")) return;
    const res = await fetch(`http://localhost:3002/admin/users/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if(res.ok) { toast.success("Utilisateur banni"); fetchUsers(); }
  };

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
            <h3>Utilisateurs ({users.length})</h3>
            <div style={{position:'relative'}}><FaSearch style={{position:'absolute', left:10, top:10, color:'#ccc'}}/><input placeholder="Chercher..." onChange={e=>setSearch(e.target.value)} style={{paddingLeft:30}}/></div>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{background:'#f9f9f9', textAlign:'left'}}><th style={{padding:10}}>Nom</th><th style={{padding:10}}>Email</th><th style={{padding:10}}>Rôle</th><th style={{padding:10}}>Actions</th></tr></thead>
            <tbody>
                {filtered.map(u => (
                    <tr key={u._id} style={{borderBottom:'1px solid #eee'}}>
                        <td style={{padding:10}}><strong>{u.name}</strong></td>
                        <td style={{padding:10}}>{u.email}</td>
                        <td style={{padding:10}}><span style={{background:u.role==='admin'?'#dbeafe':'#f3f4f6', color:u.role==='admin'?'#1e40af':'#374151', padding:'2px 8px', borderRadius:4, fontSize:'0.8em'}}>{u.role}</span></td>
                        <td style={{padding:10}}>
                            {u.role !== 'admin' && <button onClick={() => handleDelete(u._id)} style={{background:'#fee2e2', color:'#dc2626', padding:'5px 10px', fontSize:'0.8em'}}>Bannir</button>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}