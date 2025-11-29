import React, { useState } from 'react';
import { FaBullhorn, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API_URL from '../config';

export default function FeedbackButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (feedbackText.trim().length < 5) return toast.warning("Message trop court.");
        
        setIsSending(true);
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const res = await fetch(`${API_URL}/feedback`, {
                method: 'POST', headers,
                body: JSON.stringify({ message: feedbackText, type: 'Suggestion', guestEmail: token ? undefined : 'visiteur@site.com' })
            });
            if (res.ok) {
                toast.success("Merci pour votre avis !");
                setFeedbackText('');
                setIsModalOpen(false);
            } else { toast.error("Erreur envoi."); }
        } catch (err) { toast.error("Erreur serveur."); }
        setIsSending(false);
    };

    return (
        <>
            {/* CLASSE CSS 'feedback-btn' AU LIEU DU STYLE INLINE */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="feedback-btn"
                title="Donner votre avis"
            >
                <FaBullhorn /> <span className="feedback-label">Avis</span>
            </button>

            {isModalOpen && (
                <div className="feedback-overlay">
                    <div className="feedback-content">
                        <div className="feedback-header">
                            <h4>Votre avis compte 🚀</h4>
                            <button onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <textarea 
                                value={feedbackText} 
                                onChange={(e) => setFeedbackText(e.target.value)} 
                                placeholder="Une idée ? Un bug ?" 
                                required 
                            />
                            <button type="submit" disabled={isSending}>
                                <FaPaperPlane /> {isSending ? "Envoi..." : "Envoyer"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}