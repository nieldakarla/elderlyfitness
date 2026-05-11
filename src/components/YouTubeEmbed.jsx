import { embedUrl, watchUrl } from '../lib/youtube.js';
import { useT } from '../lib/useT.js';

export default function YouTubeEmbed({ videoId, title }) {
  const { t } = useT();
  if (!videoId) {
    return (
      <div className="banner error" role="alert">
        {t('embed.invalid')}
      </div>
    );
  }
  return (
    <div className="stack-sm">
      <div className="youtube-embed">
        <iframe
          src={embedUrl(videoId)}
          title={title || t('embed.video_title')}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <a href={watchUrl(videoId)} target="_blank" rel="noopener noreferrer">
        {t('embed.open_youtube')}
      </a>
    </div>
  );
}
