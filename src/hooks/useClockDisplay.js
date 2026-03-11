import { useEffect, useState } from 'react';
import { formatClockDisplay, formatDateDisplay } from '../utils/dashboard';

export default function useClockDisplay() {
  const [clock, setClock] = useState('--:--:--');
  const [dateText, setDateText] = useState('·Îµù Áß');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(formatClockDisplay(now));
      setDateText(formatDateDisplay(now));
    };

    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, []);

  return { clock, dateText };
}
