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
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          className={`bg-forest text-cream rounded-[20px] p-9 max-w-md w-full text-center shadow-lg ${
            shaking ? 'animate-shake' : ''
          }`}
        >
          {/* Decorative emoji */}
          <motion.div
            className="text-5xl mb-4"
            animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
          >
            📖✨
          </motion.div>

          <h1 className="font-display text-3xl font-bold text-sun mb-2">
            TaleWorld
          </h1>
          <p className="text-cream/80 mb-8 font-body">
            Enter the magic word to begin your adventure!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Your name"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 rounded-xl bg-cream/10 border-2 border-cream/20 text-cream placeholder-cream/40 font-body text-lg focus:outline-none focus:border-sun transition-colors"
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
                className="w-full px-4 py-3 rounded-xl bg-cream/10 border-2 border-cream/20 text-cream placeholder-cream/40 font-body text-lg focus:outline-none focus:border-sun transition-colors"
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl bg-sun text-forest font-display font-bold text-lg hover:brightness-110 transition-all cursor-pointer"
            >
              Open the Book! 📖
            </motion.button>
          </form>

          <p className="text-cream/30 text-xs mt-6 font-body">
            A magical reading experience for children ages 4–8
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
