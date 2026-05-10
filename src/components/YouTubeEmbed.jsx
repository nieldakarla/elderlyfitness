import { embedUrl, watchUrl } from '../lib/youtube.js';

export default function YouTubeEmbed({ videoId, title }) {
  if (!videoId) {
    return (
      <div className="banner error" role="alert">
        Link do YouTube inválido. Edite este treino na Biblioteca.
      </div>
    );
  }
  return (
    <div className="stack-sm">
      <div className="youtube-embed">
        <iframe
          src={embedUrl(videoId)}
          title={title || 'Vídeo do treino'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <a href={watchUrl(videoId)} target="_blank" rel="noopener noreferrer">
        Abrir no YouTube
      </a>
    </div>
  );
}
