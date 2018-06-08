const FADE_LENGTH = 500; // fades in x ms
const GROW_SPEED = 3; // would grow x ms/px

class Ripple {

  constructor() {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.transform = 'scale(0)';
    ripple.style.transformOrigin = 'center center';
    ripple.style.transitionProperty = 'transform, opacity';
    this.ripple = ripple;
  }

  addTo(parent, originX, originY) {
    const ripple = this.ripple;
    parent.appendChild(ripple);

    const boundingRect = parent.getBoundingClientRect(); // must be after the ripple is added

    this.growDistance = Math.hypot(
      Math.max(boundingRect.right - originX, originX - boundingRect.left),
      Math.max(boundingRect.bottom - originY, originY - boundingRect.top)
    ) * 2;
    ripple.style.left = (originX - boundingRect.left - this.growDistance / 2) + 'px';
    ripple.style.top = (originY - boundingRect.top - this.growDistance / 2) + 'px';
    ripple.style.width = ripple.style.height = this.growDistance + 'px';
    ripple.style.transitionDuration = this.growDistance * GROW_SPEED + 'ms, '
      + FADE_LENGTH + 'ms';
  }

  startAnimation() {
    this.ripple.style.transform = 'scale(1)';
  }

  startFading() {
    const ripple = this.ripple;
    ripple.style.opacity = 0;
    ripple.addEventListener('transitionend', e => {
      ripple.parentNode.removeChild(ripple);
    }, {once: true});
  }

  static cubicEaseOut(percent) {
    percent--;
    return percent * percent * percent + 1;
  }

}

function hasMaterialRipple(elem) {
  const currentStyles = window.getComputedStyle(elem);
  if (currentStyles.position !== 'fixed' && currentStyles.position !== 'absolute') elem.style.position = 'relative';
  if (currentStyles.display === 'inline') elem.style.display = 'inline-block';
  if (currentStyles.overflow !== 'hidden') elem.style.overflow = 'hidden';

  function onMouseDown(pointerX, pointerY, touch) {
    const ripple = new Ripple();
    ripple.addTo(elem, pointerX, pointerY);
    ripple.startAnimation();

    document.addEventListener(touch ? 'touchend' : 'mouseup', e => {
      ripple.startFading();
    }, {once: true});
  }

  elem.addEventListener('mousedown', e => {
    if (!e.sourceCapabilities.firesTouchEvents) onMouseDown(e.clientX, e.clientY, false);
  }, false);
  elem.addEventListener('touchstart', e => {
    onMouseDown(e.touches[e.touches.length - 1].clientX, e.touches[e.touches.length - 1].clientY, true);
  }, false);
}

document.addEventListener('DOMContentLoaded', e => {
  document.querySelectorAll('[has-ripple]').forEach(btn => hasMaterialRipple(btn));
}, {once: true});
