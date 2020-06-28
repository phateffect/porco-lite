function load(id, src) {
  let node = document.getElementById(id);
  if (node !== null) {
    return true;
  }
  node = document.createElement('script');
  node.id = id;
  node.src = src;
  document.head.appendChild(node);
  return false;
}

load('porco-lite', porcoLite);
