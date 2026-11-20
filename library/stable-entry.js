/* Show the final archive frame only after its template is ready. */
window.finishArchiveBoot25 = function () {
  if (window.archiveBootFinished25) return;
  window.archiveBootFinished25 = true;
  requestAnimationFrame(function () {
    document.documentElement.classList.remove('archive-boot25');
  });
};
// A failed optional script must not leave the document hidden.
window.addEventListener('load', function () { window.finishArchiveBoot25(); }, {once:true});
