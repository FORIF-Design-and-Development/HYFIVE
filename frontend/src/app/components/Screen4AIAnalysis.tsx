import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import MobileFrame from './MobileFrame';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function Screen4AIAnalysis() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { label: '건강 프로필 분석 중', duration: 1500 },
    { label: '질병 위험도 계산 중', duration: 1500 },
    { label: '맞춤 보험 상품 선정 중', duration: 1500 },
    { label: '최적 플랜 구성 중', duration: 1000 }
  ];

  useEffect(() => {
    let stepTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;
    
    const startStepTimer = (stepIndex: number) => {
      if (stepIndex >= steps.length) {
        setTimeout(() => navigate('/results'), 500);
        return;
      }
      
      setCurrentStep(stepIndex);
      const stepDuration = steps[stepIndex].duration;
      
      // Progress animation
      let currentProgress = stepIndex * (100 / steps.length);
      const targetProgress = (stepIndex + 1) * (100 / steps.length);
      const increment = (targetProgress - currentProgress) / (stepDuration / 50);
      
      progressTimer = setInterval(() => {
        currentProgress += increment;
        if (currentProgress >= targetProgress) {
          currentProgress = targetProgress;
          clearInterval(progressTimer);
        }
        setProgress(Math.min(currentProgress, 100));
      }, 50);
      
      stepTimer = setTimeout(() => {
        startStepTimer(stepIndex + 1);
      }, stepDuration);
    };
    
    startStepTimer(0);
    
    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressTimer);
    };
  }, [navigate]);

  return (
    <MobileFrame>
      <div className="h-full flex flex-col items-center justify-center px-6" style={{ 
        fontFamily: "'Noto Sans KR', sans-serif",
        backgroundColor: '#F5F5F5'
      }}>
        {/* AI Icon Animation */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ 
            backgroundColor: '#009688',
            boxShadow: '0 8px 32px rgba(0, 150, 136, 0.3)'
          }}>
            <Sparkles size={48} style={{ color: 'white' }} />
          </div>
        </motion.div>

        {/* Title */}
        <h1 style={{ 
          fontSize: '18px',
          fontWeight: 700,
          color: '#1C1C1C',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          AI 건강 분석
        </h1>
        
        <p style={{ 
          fontSize: '12px',
          color: '#9E9E9E',
          marginBottom: '48px',
          textAlign: 'center'
        }}>
          코코의 최적 보험 플랜을 찾고 있어요
        </p>

        {/* Progress Bar */}
        <div className="w-full mb-6">
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E0E0E0' }}>
            <motion.div 
              className="h-full rounded-full"
              style={{ 
                backgroundColor: '#009688',
                width: `${progress}%`
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span style={{ fontSize: '10px', color: '#9E9E9E' }}>분석 중...</span>
            <span style={{ fontSize: '10px', color: '#009688', fontWeight: 700 }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="w-full space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: index <= currentStep ? 1 : 0.3,
                x: 0
              }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ 
                backgroundColor: index < currentStep ? '#4CAF50' : index === currentStep ? '#009688' : '#E0E0E0',
                transition: 'all 0.3s'
              }}>
                {index < currentStep ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <div className="w-2 h-2 rounded-full" style={{ 
                    backgroundColor: index === currentStep ? 'white' : '#9E9E9E'
                  }}></div>
                )}
              </div>
              <span style={{ 
                fontSize: '12px',
                color: index <= currentStep ? '#1C1C1C' : '#9E9E9E',
                fontWeight: index === currentStep ? 700 : 400
              }}>
                {step.label}
              </span>
              {index === currentStep && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="ml-auto"
                >
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#009688' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#009688' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#009688' }}></div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Info Card */}
        <div className="w-full mt-12 rounded-xl p-4" style={{ backgroundColor: '#E0F2F1' }}>
          <div className="flex items-start gap-2">
            <span style={{ fontSize: '14px' }}>💡</span>
            <p style={{ 
              fontSize: '10px',
              color: '#00695C',
              lineHeight: '1.5'
            }}>
              AI가 코코의 품종, 나이, 건강 상태를 종합적으로 분석하여 
              가장 적합한 보험 상품과 보장 범위를 추천합니다.
            </p>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
