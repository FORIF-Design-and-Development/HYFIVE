/**
 * LionMark — HYFIVE 서비스 마크
 * PNG 로고를 color prop에 따라 적절한 필터로 렌더링
 */
import lionLogo from 'figma:asset/49bb8708313cd2aee9d6c816e878c53a7e094241.png';

export function LionMark({
  size = 100,
  color = 'white',
}: {
  size?: number;
  color?: string;
}) {
  // 새 로고는 이미 흰색이므로 white일 때 필터 불필요
  const filterStyle = color === 'white'
    ? undefined
    : color === 'blue' || color === '#1B4B8C'
    ? 'brightness(0) saturate(100%) invert(22%) sepia(61%) saturate(700%) hue-rotate(195deg) brightness(90%)'
    : 'brightness(0)';

  return (
    <img
      src={lionLogo}
      alt="HYFIVE 로고"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        filter: filterStyle,
        display: 'block',
      }}
    />
  );
}