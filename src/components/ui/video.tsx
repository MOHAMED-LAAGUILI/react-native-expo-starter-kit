import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as React from 'react';
import { View } from 'react-native';
import { cn } from '@/utils/utils';
import { Button } from './button';

type VideoProps = {
  source: string;
  className?: string;
  style?: React.ComponentProps<typeof VideoView>['style'];
};

function Video({ source, className, style }: VideoProps) {
  const player = useVideoPlayer(source, (player) => {
  // Playback behavior
    player.loop = true;
    player.muted = false;
    player.playbackRate = 1.0; // 0.5 - 2.0+
    player.preservesPitch = true;

    // Background / system integration
    player.showNowPlayingNotification = true;
    player.staysActiveInBackground = true;

    // Audio behavior
    player.volume = 1.0; // 0 - 1

    // Buffering / performance

    // iOS-specific optimizations
    player.allowsExternalPlayback = true;

    // Start behavior
    // player.play();
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  return (
    <View className={cn('gap-3', className)}>
      <VideoView
        style={[{ width: '100%', aspectRatio: 16 / 9 }, style]}
        player={player}
        nativeControls
        allowsPictureInPicture
        fullscreenOptions={{ enable: true }}
      />
      <View className="flex-row justify-center gap-3">
        <Button
          title={isPlaying ? 'Pause' : 'Play'}
          variant="primary-gradient"
          onPress={() => {
            if (isPlaying) {
              player.pause();
            }
            else {
              player.play();
            }
          }}
        />
        <Button
          title="Restart"
          variant="outline"
          onPress={() => {
            player.replay();
            player.play();
          }}
        />
      </View>
    </View>
  );
}

export type { VideoProps };
export { Video };
