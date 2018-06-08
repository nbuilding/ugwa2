const FADE_LENGTH = 500; // fades in x ms
const GROW_SPEED = 31; // would grow x ms/px

class Ripple {

  constructor() {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    this.ripple = ripple;

    this.growStartTime = Date.now();
    this.growDistance = null;
    this.growDuration = null;

    this.fading = false;
    this.fadeStartTime = null;
  }

  addTo(parent, originX, originY) {
    parent.appendChild(this.ripple);

    const boundingRect = parent.getBoundingClientRect();

    this.ripple.style.left = (originX - boundingRect.left) + 'px';
    this.ripple.style.top = (originY - boundingRect.top) + 'px';

    this.growDistance = Math.hypot(
      Math.max(boundingRect.right - originX, originX - boundingRect.left),
      Math.max(boundingRect.bottom - originY, originY - boundingRect.top)
    ) / 5;
    this.growDuration = this.growDistance * GROW_SPEED;
  }

  updateRippleSize() {
    const ripple = this.ripple;
    const currentTime = Date.now();

    const elapsedTime = currentTime - this.growStartTime;
    if (elapsedTime > this.growDuration) {
      ripple.style.transform = `scale(${this.growDistance})`;
    } else {
      const position = Ripple.cubicEaseOut(elapsedTime / this.growDuration);
      ripple.style.transform = `scale(${position * this.growDistance})`;
    }

    if (this.fading) {
      let fade = 1 - (currentTime - this.fadeStartTime) / FADE_LENGTH;
      if (fade < 0) {
        ripple.parentNode.removeChild(ripple);
        return;
      }
      else ripple.style.opacity = fade;
    }

    window.requestAnimationFrame(() => this.updateRippleSize());
  }

  startAnimation() {
    this.updateRippleSize();
  }

  startFading() {
    this.fading = true;
    this.fadeStartTime = Date.now();
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
