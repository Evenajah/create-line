import './style.css';

import {
  of,
  map,
  Observable,
  animationFrames,
  fromEvent,
  switchMap,
  pairwise,
  defer,
  pipe,
  OperatorFunction,
} from 'rxjs';
import {
  distinctUntilChanged,
  endWith,
  filter,
  scan,
  take,
  takeLast,
  takeUntil,
  takeWhile,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

const keydown$ = fromEvent<KeyboardEvent>(document, 'keydown');

const onCtrlZ$ = keydown$.pipe(
  filter((event) => event.code === 'KeyZ' && (event.ctrlKey || event.metaKey))
);

const onCreateLine$ = fromEvent<MouseEvent>(document, 'mousedown').pipe(
  switchMap((downEvent) => {
    const lineEl = document.createElement('div');

    lineEl.style.position = 'fixed';
    lineEl.style.left = `0px`;
    lineEl.style.top = `0px`;

    lineEl.style.borderBottomStyle = 'solid';
    lineEl.style.borderBottomWidth = '1px';
    lineEl.style.borderBottomColor = 'white';

    lineEl.style.transformOrigin = `0 0`;

    lineEl.style.left = `${downEvent.x}px`;
    lineEl.style.top = `${downEvent.y}px`;

    const { x: downX, y: downY } = downEvent;

    document.body.appendChild(lineEl);

    return fromEvent<MouseEvent>(document, 'mousemove').pipe(
      tap((moveEvent) => {
        const { x: moveX, y: moveY } = moveEvent;
        const distance = Math.sqrt((moveY - downY) ** 2 + (moveX - downX) ** 2);
        lineEl.style.width = `${distance}px`;
        const calAngel = angle(downX, downY, moveX, moveY);
        lineEl.style.transform = `rotate(${calAngel}deg)`;
      }),
      takeUntil(fromEvent<MouseEvent>(document, 'mouseup')),
      takeLast(1),
      map(() => lineEl)
    );
  })
);

const lines$ = onCreateLine$.pipe(
  scan((lines, line) => {
    lines.push(line);
    return lines;
  }, [] as HTMLDivElement[])
);

onCtrlZ$.pipe(withLatestFrom(lines$)).subscribe(([ctrlZEvent, lines]) => {
  const line = lines.pop();
  line?.remove();
});

// function tween() {
//   return animationFrames().pipe(
//     map((event) => event.elapsed / 3000),
//     takeWhile((t) => t < 1),
//     endWith(1)
//   );
// }

function angle(cx: number, cy: number, ex: number, ey: number) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
}
