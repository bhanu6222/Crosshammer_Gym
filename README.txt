CROSS HAMMER — DEPLOY VIA GITHUB + NETLIFY
==========================================
Main page is index.html (hosts serve it automatically at the site root).
Keep index.html and the "assets" folder together; the page loads videos
from assets/videos/ and thumbnails from assets/posters/ using relative paths.

UPDATING LATER (no downloads, no folder replacing):
- Edit index.html directly in GitHub's web editor (pencil icon) and Commit.
- Netlify auto-rebuilds; your live site updates in ~20 seconds.

ADDING A NEW VIDEO LATER:
1) In GitHub, open assets/videos -> "Add file" -> "Upload files" -> add the .mp4.
2) (optional) add a matching poster .jpg in assets/posters.
3) Ask Claude for the one-line tile snippet, paste it into index.html via the
   web editor, Commit. Netlify updates the live site automatically.
