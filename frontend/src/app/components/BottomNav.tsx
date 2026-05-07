import { useNavigate } from 'react-router';
import { Home, BookOpen, BarChart2, Settings, Footprints } from 'lucide-react';

type NavItem = 'home' | 'record' | 'report' | 'walk' | 'settings';

interface BottomNavProps {
  active: NavItem;
}

export default function BottomNav({ active }: BottomNavProps) {
  const navigate = useNavigate();

  const items: { id: NavItem; label: string; icon: React.ElementType; path: string }[] = [
    { id: 'home', label: '홈', icon: Home, path: '/home' },
    { id: 'record', label: '기록', icon: BookOpen, path: '/record' },
    { id: 'walk', label: '산책', icon: Footprints, path: '/walk' },
    { id: 'report', label: '리포트', icon: BarChart2, path: '/report' },
    { id: 'settings', label: '설정', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex-shrink-0 bg-white flex" style={{ borderTop: '1px solid #EBEBEB', paddingTop: '8px', paddingBottom: '16px' }}>
      {items.map(item => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="flex-1 flex flex-col items-center gap-1"
            style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
          >
            <div className="relative flex items-center justify-center" style={{ width: '32px', height: '32px' }}>
              {isActive && (
                <div className="absolute inset-0 rounded-full" style={{ backgroundColor: '#E8F0FA' }} />
              )}
              <Icon size={20} style={{ color: isActive ? '#1B4B8C' : '#BDBDBD', position: 'relative' }} />
            </div>
            <span style={{ fontSize: '10px', color: isActive ? '#1B4B8C' : '#BDBDBD', fontWeight: isActive ? 700 : 400 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}