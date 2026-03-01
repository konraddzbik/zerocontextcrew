import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../components/AuthContext';
import { PageTransition, scaleIn } from '../components/motion';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/pick');
    } else {
      setError("Hmm, that's not the magic word! Try again.");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          className={`bg-surface rounded-lg px-10 py-14 max-w-md w-full text-center shadow-[0_4px_20px_var(--soft-shadow)] ${
            shaking ? 'animate-shake' : ''
          }`}
          style={{ border: '1px solid var(--ornate-border)' }}
        >
          {/* Decorative emoji */}
          <motion.div
            className="text-6xl mb-6"
            animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
          >
            📖✨
          </motion.div>

          <h1
            className="text-4xl font-bold mb-3"
            style={{ fontFamily: "'Cinzel Decorative', serif", color: 'var(--chapter-title)' }}
          >
            TaleWorld
          </h1>
          <p className="text-[var(--ink)]/60 mb-10 font-body text-lg">
            Enter the magic word to begin your adventure!
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <input
                type="text"
                placeholder="Your name"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full px-6 py-5 rounded-lg bg-cream border-2 border-[var(--ornate-border)] text-[var(--ink)] placeholder-[var(--ink)]/30 font-body text-lg focus:outline-none focus:border-[var(--gold)] transition-colors"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Magic word"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-6 py-5 rounded-lg bg-cream border-2 border-[var(--ornate-border)] text-[var(--ink)] placeholder-[var(--ink)]/30 font-body text-lg focus:outline-none focus:border-[var(--gold)] transition-colors"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-coral text-sm font-body"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-5 rounded-lg the-end-btn font-bold text-lg cursor-pointer mt-2"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              Open the Book! 📖
            </motion.button>
          </form>

        </motion.div>
      </div>
    </PageTransition>
  );
}
