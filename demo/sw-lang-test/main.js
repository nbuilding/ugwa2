let lang = localStorage.getItem('[ugwa2] demos.lang') || 'temp';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
    navigator.serviceWorker.ready.then(regis => {
      console.log(regis);
      console.log(regis.active);
      console.log(navigator.serviceWorker);
      console.log(navigator.serviceWorker.controller);
      regis.active.postMessage(lang);
    });
  }, {once: true});
}

document.addEventListener('DOMContentLoaded', () => {
  const langSelect = document.getElementById('lang');
  langSelect.value = lang;
  langSelect.addEventListener('change', () => {
    lang = langSelect.value;
    localStorage.setItem('[ugwa2] demos.lang', lang);
    navigator.serviceWorker.controller.postMessage(lang);
    window.location.reload();
  });

  document.querySelectorAll('[data-translated]').forEach(el => {
    el.innerHTML = translate(el.textContent.trim());
  });
}, {once: true});