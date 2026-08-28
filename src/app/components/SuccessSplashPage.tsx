import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import successLottie from '@/assets/success.lottie';

export function SuccessSplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/loading');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
      <div className="relative z-10 flex flex-col items-center">
        {/* Fade in only — no scale. Animating scale from 0 rasterises the
            Lottie canvas at the tiny start size and leaves it blurry. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-24 h-24">
            <DotLottieReact src={successLottie} autoplay loop={false} style={{ width: '100%', height: '100%' }} />
          </div>
        </motion.div>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-base font-bold text-[#111827] mt-4"
        >
          Verified Successfully
        </motion.p>
      </div>
    </div>
  );
}
