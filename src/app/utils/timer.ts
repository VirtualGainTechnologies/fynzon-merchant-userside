import { map, Observable, takeUntil, timer } from 'rxjs';

export function getTimer(milliseconds: number): Observable<any> {
  const endTime = Date.now() + milliseconds;

  return timer(0, 1000).pipe(
    map(() => {
      const now = Date.now();
      const distance = endTime - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
      };
    }),
    takeUntil(timer(milliseconds)),
  );
}
