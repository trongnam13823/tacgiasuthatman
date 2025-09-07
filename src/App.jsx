import {
  RotateCcw,
  LoaderCircle,
  Shuffle,
  Play,
  SkipForward,
  SkipBack,
  Pause,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Virtuoso } from "react-virtuoso";
import useAudios from "./hooks/useAudios";
import { Button } from "./components/ui/button";
import { useScrollToIndex } from "./hooks/useScrollToIndex";
import Timer from "./components/Timer";
import { Slider } from "@/components/ui/slider";

export default function App() {
  const player = useRef(null);
  const virtuoso = useRef(null);
  const {
    init,
    audios,
    loading,
    error,
    refetch,
    shuffleAudios,
    currentIndex,
    setCurrentIndex,
    playing,
    setPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
  } = useAudios("tiktok-tacgiasuthatman");

  const [seeking, setSeeking] = useState(false);
  const [interacted, setInteracted] = useState(false);

  useScrollToIndex({ virtuoso, currentIndex, playing, init });

  const onPlayAudio = (step, current = currentIndex) => {
    const index = (current + step + audios.length) % audios.length;
    player.current.currentTime = 0;

    setPlaying(true);
    setCurrentIndex(index);
    setCurrentTime(0);
    setDuration(0);
  };

  const onToggle = () => setPlaying(!playing);
  const onNext = () => onPlayAudio(+1);
  const onPrev = () => onPlayAudio(-1);
  const onReload = async () => {
    setCurrentIndex(-1);
    await refetch();
    onPlayAudio(0, 0);
  };
  const onShuffle = () => {
    shuffleAudios();
    onPlayAudio(0, 0);
  };

  const onEnded = () => onNext();
  const onPlay = () => {
    player.current.currentTime = currentTime;
    setInteracted(true);
    setPlaying(true);
  };
  const onPause = () => setPlaying(false);
  const onTimeUpdate = (e) => {
    if (!seeking && interacted) {
      setCurrentTime(e.target.currentTime);
    }
  };
  const onDurationChange = (e) => setDuration(e.target.duration);

  useEffect(() => {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: audios[currentIndex]?.title || "Unknown Title",
      artist: "Sự Thật Man",
      artwork: [
        {
          src: "/tacgiasuthatman.jpg",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    });
  }, [currentIndex, audios, playing]);

  const onSliderChange = (e) => {
    setSeeking(true);
    setCurrentTime(e[0]);
  };

  const onSliderCommit = (e) => {
    setSeeking(false);
    setCurrentTime(e[0]);

    if (interacted) {
      if (playing) player.current.currentTime = currentTime;
      else setPlaying(true);
    }
  };

  return (
    <div className="flex h-svh w-svw p-2">
      <ReactPlayer
        ref={player}
        playing={playing}
        src={audios[currentIndex]?.url ?? "abc.mp3"}
        style={{ width: "100%", height: "auto" }}
        playsInline
        onEnded={onEnded}
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={onTimeUpdate}
        onDurationChange={onDurationChange}
      />

      {loading ? (
        <div className="space-y-4 m-auto">
          <LoaderCircle className="animate-spin size-10 mx-auto" />
        </div>
      ) : error ? (
        <p className="m-auto">{error}</p>
      ) : (
        <div className="w-full flex flex-col gap-2">
          <Timer setPlaying={setPlaying} />
          <Virtuoso
            totalCount={audios.length}
            ref={virtuoso}
            itemContent={(index) => {
              return (
                <div
                  onClick={() => onPlayAudio(0, index)}
                  className={`px-4 py-2 cursor-pointer rounded-md ${
                    index === currentIndex
                      ? "bg-white/20 font-bold"
                      : "hover:bg-white/20"
                  }`}
                >
                  {audios[index].title}
                </div>
              );
            }}
          />

          <div className="flex flex-col gap-4 pt-2 border-t border-gray-600">
            <div className="text-center">
              <h1 className="text-xl font-bold line-clamp-1">
                {audios[currentIndex].title}
              </h1>
              <p>
                {currentIndex + 1}/{audios.length}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span>{formatDuration(duration === 0 ? 0 : currentTime)}</span>
              <Slider
                max={duration === 0 ? Infinity : duration}
                value={[duration === 0 ? 0 : currentTime]}
                step={0.01}
                onValueChange={onSliderChange}
                onValueCommit={onSliderCommit}
              />
              <span>{formatDuration(duration)}</span>
            </div>

            <div className="flex gap-2 justify-evenly items-center">
              <Button
                variant="secondary"
                className="size-14 bg-transparent rounded-full hover:bg-white/20 cursor-pointer"
                onClick={onReload}
              >
                <RotateCcw className="size-8" />
              </Button>

              <Button
                variant="secondary"
                className="size-14 bg-transparent rounded-full hover:bg-white/20 cursor-pointer"
                onClick={onPrev}
              >
                <SkipBack className="size-8" />
              </Button>

              <Button
                variant="secondary"
                className="size-14 bg-white rounded-full hover:bg-white/80 cursor-pointer"
                onClick={onToggle}
              >
                {playing ? (
                  <Pause className="size-8 text-black " />
                ) : (
                  <Play className="size-8 text-black " />
                )}
              </Button>

              <Button
                variant="secondary"
                className="size-14 bg-transparent rounded-full hover:bg-white/20 cursor-pointer"
                onClick={onNext}
              >
                <SkipForward className="size-8" />
              </Button>

              <Button
                variant="secondary"
                className="size-14 bg-transparent rounded-full hover:bg-white/20 cursor-pointer"
                onClick={onShuffle}
              >
                <Shuffle className="size-8" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDuration(sec) {
  if (!sec || sec < 0) return "00:00";

  const totalSec = Math.floor(sec);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");

  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}
