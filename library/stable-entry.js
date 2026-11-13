/* Show the final archive frame only after its font and template are ready. */
window.finishArchiveBoot25 = function () {
  if (window.archiveBootFinished25) return;
  window.archiveBootFinished25 = true;
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.resolve(ready).catch(function () {}).then(function () {
    requestAnimationFrame(function () {
      document.documentElement.classList.remove('archive-boot25');
    });
  });
};
// A failed optional script must not leave the document hidden.
window.addEventListener('load', function () { window.finishArchiveBoot25(); }, {once:true});
