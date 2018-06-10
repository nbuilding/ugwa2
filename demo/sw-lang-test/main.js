if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  }, {once: true});
}

document.addEventListener('DOMContentLoaded', () => {
  const langSelect = document.getElementById('lang');
  langSelect.value = localStorage.getItem('[ugwa2] demos.lang') || 'temp';
  langSelect.addEventListener('change', () => {
    localStorage.setItem('[ugwa2] demos.lang', langSelect.value);
    navigator.serviceWorker.postMessage(langSelect.value);
    window.location.reload();
  });

  document.querySelectorAll('[data-translated]').forEach(el => {
    el.innerHTML = translate(el.textContent.trim());
  });
}, {once: true});
