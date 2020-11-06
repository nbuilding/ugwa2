async function silentPageSwitch(url) {
  history.pushState({}, "", url);
  
  let response = await fetch(url);
  let reader = response.body.getReader();
  let buf = "";
  
  for (let part = await reader.read(); !part.done; part = await reader.read())
    buf += part.value;
  
  document.body
    .parentElement //html
    .outerHTML = buf;
}
