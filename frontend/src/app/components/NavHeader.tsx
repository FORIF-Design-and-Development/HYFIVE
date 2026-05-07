import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import lionLogo from 'figma:asset/3d187befbd5f5281436e6022002bcf4bb8f9a5bd.png';

interface NavHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export default function NavHeader({ title, subtitle, onBack, rightElement }: NavHeaderProps) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  return (
    <div className="flex-shrink-0 bg-white" style={{ borderBottom: '1px solid #E8E8E8' }}>
      {/* Main header row */}
      <div className="relative flex items-center justify-center" style={{ height: '52px' }}>
        <button 
          onClick={handleBack}
          className="absolute left-3 flex items-center justify-center rounded-full transition-all active:scale-90"
          style={{ width: '36px', height: '36px', color: '#1B4B8C' }}
        >
          <ChevronLeft size={22} />
        </button>
        
        <div className="text-center">
          <h1 style={{ 
            fontSize: '15px', 
            fontWeight: 700,
            color: '#1C1C1C',
            fontFamily: "'Noto Sans KR', sans-serif",
            lineHeight: 1.2
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '10px', color: '#2E6DB4', fontWeight: 500, marginTop: '1px' }}>
              {subtitle}
            </p>
          )}
        </div>
        
        {rightElement ? (
          <div className="absolute right-4">
            {rightElement}
          </div>
        ) : (
          <div className="absolute right-4 flex items-center gap-1.5">
          </div>
        )}
      </div>
      
      {/* Teal accent line */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, #1B4B8C 0%, #6A9FD4 50%, transparent 100%)' }} />
    </div>
  );
}