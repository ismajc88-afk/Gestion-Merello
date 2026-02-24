
import React, { useState, useEffect } from 'react';

interface Props {
  className?: string;
  showSeconds?: boolean;
}

export const ClockDisplay: React.FC<Props> = React.memo(({ className, showSeconds = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className={className}>
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: showSeconds ? '2-digit' : undefined })}
    </span>
  );
});
