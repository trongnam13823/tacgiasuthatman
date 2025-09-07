import {
  RotateCcw,
  LoaderCircle,
  Shuffle,
  Play,
  Disc3,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { Virtuoso } from "react-virtuoso";
import useAudios from "./hooks/useAudios";
import { Button } from "./components/ui/button";
import { useScrollToIndex } from "./hooks/useScrollToIndex";
import Timer from "./components/Timer";

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
  } = useAudios("tiktok-tacgiasuthatman");

  useScrollToIndex({ virtuoso, currentIndex, playing, init });

  const onPlayAudio = (step, current = currentIndex) => {
    const index = (current + step + audios.length) % audios.length;

    setPlaying(true);
    setCurrentIndex(index);
  };

  const onToggle = () => setPlaying(!playing);
  const onNext = () => onPlayAudio(+1);
  const onPrev = () => onPlayAudio(-1);
  const onReload = async () => {
    await refetch();
    setCurrentIndex(0);
    setPlaying(false);
  };
  const onShuffle = () => {
    shuffleAudios();
    setCurrentIndex(0);
    onPlayAudio(0, 0);
  };

  const onEnded = () => onNext();
  const onPlay = () => setPlaying(true);
  const onPause = () => setPlaying(false);

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

  return (
    <div className="flex h-svh w-svw p-2">
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

            <ReactPlayer
              ref={player}
              playing={playing}
              src={audios[currentIndex].url}
              controls
              style={{ width: "100%", height: "auto" }}
              playsInline
              onEnded={onEnded}
              onPlay={onPlay}
              onPause={onPause}
            />

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
                  <Disc3 className="size-8 text-black animate-spin" />
                ) : (
                  <Play className="size-8 text-black animate-pulse" />
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
