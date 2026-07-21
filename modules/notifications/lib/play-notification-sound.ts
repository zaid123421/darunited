const NOTIFICATION_SOUND_PATH = "/sounds/notification.wav";

let notificationAudio: HTMLAudioElement | null = null;
let soundUnlocked = false;

function getNotificationAudio() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!notificationAudio) {
    notificationAudio = new Audio(NOTIFICATION_SOUND_PATH);
    notificationAudio.preload = "auto";
  }

  return notificationAudio;
}

export function unlockNotificationSound() {
  if (soundUnlocked) {
    return;
  }

  const audio = getNotificationAudio();

  if (!audio) {
    return;
  }

  const previousVolume = audio.volume;
  audio.volume = 0;

  void audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = previousVolume;
      soundUnlocked = true;
    })
    .catch(() => {
      audio.volume = previousVolume;
    });
}

export function playNotificationSound() {
  const audio = getNotificationAudio();

  if (!audio) {
    return;
  }

  audio.volume = 1;
  audio.currentTime = 0;

  void audio.play().catch(() => {
    // Browsers may block autoplay until the user interacts with the page.
  });
}
