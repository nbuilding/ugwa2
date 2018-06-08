class Ripple {

  constructor() {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    this.ripple = ripple;

    this.growthEnded = false;
    this.needToFadeSoon = false;
  }

  addTo(parent, originX, originY) {
    const ripple = this.ripple;
    parent.appendChild(ripple);

    const boundingRect = parent.getBoundingClientRect();

    this.growDistance = Math.hypot(
      Math.max(boundingRect.right - originX, originX - boundingRect.left),
      Math.max(boundingRect.bottom - originY, originY - boundingRect.top)
    ) * 2;
    ripple.style.left = (originX - boundingRect.left - this.growDistance / 2) + 'px';
    ripple.style.top = (originY - boundingRect.top - this.growDistance / 2) + 'px';
    ripple.style.width = ripple.style.height = this.growDistance + 'px';
  }

  startAnimation() {
    const ripple = this.ripple;
    ripple.style.transform = 'scale(1)';
    ripple.addEventListener('transitionend', e => {
      this.growthEnded = true;
      if (this.needToFadeSoon) this.startFading();
    }, {once: true});
  }

  canFadeNow() {
    if (this.growthEnded) this.startFading();
    else this.needToFadeSoon = true; // my variable names are degrading again
  }

  startFading() {
    const ripple = this.ripple;
    ripple.style.opacity = 0;
    ripple.addEventListener('transitionend', e => {
      this.growthEnded = true;
      ripple.parentNode.removeChild(ripple);
    }, {once: true});
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
      ripple.canFadeNow();
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
