// Use the eight original reference faces as a sprite, preserving the supplied artwork.
let reviewFaceSerial=0;
function faceAvatarBook(){
 const index=Math.floor(Math.random()*8);
 const x=74+(index%4)*120, y=74+Math.floor(index/4)*120;
 const id='review-face-'+(++reviewFaceSerial);
 // The original blue is isolated into alpha; only the ink color changes.
 return '<span class="reader-avatar face-avatar" aria-label="佚名"><svg viewBox="0 0 92 92" aria-hidden="true"><defs><filter id="'+id+'" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.6 0 1.6 0 0" result="face-alpha"/><feFlood flood-color="currentColor"/><feComposite in2="face-alpha" operator="in"/></filter></defs><image href="assets/review-faces-reference.png" x="'+(-x)+'" y="'+(-y)+'" width="600" height="360" filter="url(#'+id+')"/></svg></span>';
}
