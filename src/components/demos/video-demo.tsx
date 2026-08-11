import * as React from 'react';
import { Video } from '@/components/ui';

const VIDEO_SOURCE
  = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4';

function VideoDemo() {
  return (
    <Video source={VIDEO_SOURCE} />
  );
}

export { VideoDemo };
