const ID_RE = /^[A-Za-z0-9_-]{11}$/;

export function extractVideoId(input) {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (ID_RE.test(trimmed)) return trimmed;

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '');

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return ID_RE.test(id) ? id : null;
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const v = url.searchParams.get('v');
    if (v && ID_RE.test(v)) return v;
    const parts = url.pathname.split('/').filter(Boolean);
    // /shorts/<id>, /embed/<id>, /v/<id>, /live/<id>
    if (parts.length >= 2 && ['shorts', 'embed', 'v', 'live'].includes(parts[0])) {
      return ID_RE.test(parts[1]) ? parts[1] : null;
    }
  }

  return null;
}

export function embedUrl(videoId) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

export function watchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function thumbnailUrl(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
