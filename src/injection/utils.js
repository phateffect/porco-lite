export function sleep(nMs) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(Date.now() - start);
    }, nMs);
  })
}