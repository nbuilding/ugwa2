async function silentPageSwitch(url) {
  let response = await fetch(url);
  let reader = response.body.getReader();
  let buf = "";
  
  for (let part = await reader.read(); !part.done; part = await reader.read())
    buf += part.value;
  
  document.body
    .parent //html
    .outerHTML = buf;
}
