import React, { useState } from 'react';
import { FaBullhorn, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function FeedbackButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (feedbackText.trim().length < 5) {
            return toast.warning("Votre message est un peu court.");
        }
        
        setIsSending(true);
        
        // Récupération du token pour identifier l'utilisateur (s'il est connecté)
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            // ENVOI RÉEL AU SERVEUR
            const res = await fetch('http://localhost:3002/feedback', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ 
                    message: feedbackText,
                    type: 'Suggestion', // Type par défaut pour le bouton rapide
                    // Si pas connecté, on met un email générique pour l'instant
                    guestEmail: token ? undefined : 'visiteur@bouton-rapide.com'
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Reçu 5/5 ! Merci pour votre avis. 🚀 ");
                setFeedbackText('');
                setIsModalOpen(false);
            } else {
                toast.error(data.message || "Erreur lors de l'envoi.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Impossible de contacter le serveur.");
        }
        
        setIsSending(false);
    };

    return (
        <>
            {/* 1. BOUTON FLOTTANT */}
            <button 
                onClick={() => setIsModalOpen(true)}
                style={styles.floatingButton}
                title="Donner votre avis / Signaler un bug"
            >
                <FaBullhorn style={{ marginRight: '8px' }} /> Avis
            </button>

            {/* 2. MODALE (POP-UP) */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h4 style={{margin:0, color:'#333'}}>🚀 Votre avis compte</h4>
                            <button onClick={() => setIsModalOpen(false)} style={styles.closeButton}>
                                <FaTimes />
                            </button>
                        </div>
                        <p style={{marginBottom: '15px', color: '#666', fontSize: '0.9em'}}>
                            Une idée ? Un bug ? Dites-le nous ici !
                        </p>

                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="J'aimerais que l'application..."
                                required
                                style={styles.textarea}
                            />
                            <button type="submit" style={styles.submitButton} disabled={isSending}>
                                <FaPaperPlane /> {isSending ? "Envoi..." : "Envoyer"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

// Styles CSS-in-JS
const styles = {
    floatingButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#DFA92E', // var(--primary)
        color: 'white',
        border: 'none',
        padding: '12px 20px',
        borderRadius: '50px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        zIndex: 2000, // Très haut pour être au-dessus de tout
        display: 'flex',
        alignItems: 'center',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'transform 0.2s'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2001,
        backdropFilter: 'blur(2px)'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        width: '90%',
        maxWidth: '380px',
        position: 'relative',
        animation: 'fadeIn 0.3s ease'
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        color: '#999',
    },
    textarea: {
        width: '100%',
        minHeight: '100px',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '15px',
        resize: 'vertical',
        fontSize: '1rem',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        outline: 'none'
    },
    submitButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#333', 
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        fontSize: '1rem'
    },
};