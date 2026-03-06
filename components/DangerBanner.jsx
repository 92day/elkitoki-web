export default function DangerBanner({ visible }) {
  if (!visible) return null;

  return (
    <div style={{
      width: '100%',
      background: '#ef4444',
      color: '#fff',
      padding: '1rem 1.5rem',
      borderRadius: '10px',
      fontSize: '1.1rem',
      fontWeight: 700,
      textAlign: 'center',
      marginBottom: '1.5rem',
      animation: 'blink 0.6s infinite',
    }}>
      🚨 위험 경고 감지됨! 대피 명령 전송 중...
    </div>
  );
}
