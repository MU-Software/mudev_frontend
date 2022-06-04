import React from 'react';

export const YoutubeThumbnail: React.FC = (props: {
  youtubeId: string;
  style?: React.CSSProperties;
}) => <img
    style={props.style}
    src={`https://i3.ytimg.com/vi/${props.youtubeId ?? ''}/maxresdefault.jpg`}
    alt='YouTube thumbnail image'
    onLoad={(event) => {
      // Prevent endless loop when fallback image also fails
      event.currentTarget.onLoad = null;
      event.currentTarget.onload = null;
      if (!props.youtubeId || event.currentTarget.src.endsWith('/sddefault.jpg'))
        // This component is used as placeholder, or we already tried with low res image,
        // and we couldn't get a thumbnail image.
        return;

      // Youtube sends fallback image when there's no file,
      // img's onError won't triggered as there's a fallback image on a response even though it's 404,
      // so we need to detect if the received image is a fallback image.
      if (event.currentTarget.naturalHeight <= 90) {
        event.currentTarget.src = `https://i3.ytimg.com/vi/${props.youtubeId ?? ''}/sddefault.jpg`;
      }
    }}
  />;
