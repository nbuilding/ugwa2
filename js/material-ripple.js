function hasMaterialRipple(elem) {
  const currentStyles = window.getComputedStyle(elem);
  if (currentStyles.position !== 'fixed' && currentStyles.position !== 'absolute') elem.style.position = 'relative';
  if (currentStyles.display === 'inline') elem.style.display = 'inline-block';
  if (currentStyles.overflow !== 'hidden') elem.style.overflow = 'hidden';

  function onMouseDown(mouseX, mouseY, touch) {
    const elemBoundingRect = elem.getBoundingClientRect();
    const growDistance = Math.hypot(
      Math.max(elemBoundingRect.right - mouseX, mouseX - elemBoundingRect.left),
      Math.max(elemBoundingRect.bottom - mouseY, mouseY - elemBoundingRect.top)
    ) / 5;
    const growDuration = growDistance * 31;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.left = (mouseX - elemBoundingRect.left) + 'px';
    ripple.style.top = (mouseY - elemBoundingRect.top) + 'px';
    elem.appendChild(ripple);

    setTimeout(() => ripple.style.transform = `scale(${growDistance})`, 0);
    document.addEventListener(touch ? 'touchend' : 'mouseup', e => {
      console.log(window.getComputedStyle(ripple).transform);
      ripple.style.opacity = 0;
    }, {once: true});

    ripple.addEventListener('transitionend', function end(e) {
      if (e.propertyName === 'opacity')
        ripple.removeEventListener('transitionend', end);
    });
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
