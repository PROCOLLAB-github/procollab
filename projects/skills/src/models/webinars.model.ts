/** @format */

export interface Webinar {
  title: string;
  description: string;
  datetimeStart: string;
  duration: number;
  isRegistrated: boolean;
  onlineLink: string | null;
  recordingLink: string | null;
  speaker: Speaker;
}

interface Speaker {
  fullName: string;
  photo: string;
  position: string;
}
