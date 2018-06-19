class Ripple {

  constructor() {
    const ripple = document.createElement('material-ripple');
    this.ripple = ripple;

    this.growthEnded = false;
    this.needToFadeSoon = false;
  }

  addTo(parent, originX, originY, round = false) {
    const ripple = this.ripple;
    parent.appendChild(ripple);

    const boundingRect = parent.getBoundingClientRect();

    this.growDistance = (round ? Math.hypot(
      originX - boundingRect.left - boundingRect.width / 2,
      originY - boundingRect.top - boundingRect.height / 2
    ) + boundingRect.width / 2 : Math.hypot(
      Math.max(boundingRect.right - originX, originX - boundingRect.left),
      Math.max(boundingRect.bottom - originY, originY - boundingRect.top)
    )) * 2;
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

function hasMaterialRipple(elem, round) {
  let ready = false;

  function prepare() {
    if (ready) return;
    const currentStyles = window.getComputedStyle(elem);
    if (currentStyles.position !== 'fixed'
        && currentStyles.position !== 'absolute'
        && currentStyles.position !== 'relative')
      elem.style.position = 'relative';
    if (currentStyles.display === 'inline') elem.style.display = 'inline-block';
    if (currentStyles.overflow !== 'hidden') elem.style.overflow = 'hidden';
    ready = true;
  }

  function onMouseDown(pointerX, pointerY, touch) {
    const ripple = new Ripple();
    ripple.addTo(elem, pointerX, pointerY, round);
    ripple.startAnimation();

    document.addEventListener(touch ? 'touchend' : 'mouseup', e => {
      ripple.canFadeNow();
    }, {once: true});
  }

  elem.addEventListener('mousedown', e => {
    prepare();
    if (!e.sourceCapabilities.firesTouchEvents) onMouseDown(e.clientX, e.clientY, false);
  }, false);
  elem.addEventListener('touchstart', e => {
    prepare();
    onMouseDown(e.touches[e.touches.length - 1].clientX, e.touches[e.touches.length - 1].clientY, true);
  }, false);
}

document.addEventListener('DOMContentLoaded', e => {
  document.querySelectorAll('[g=-ripple]').forEach(btn => hasMaterialRipple(btn));
}, {once: true});
