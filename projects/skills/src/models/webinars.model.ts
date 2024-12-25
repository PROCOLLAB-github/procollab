/** @format */

interface Speaker {
  fullName: string;
  photo: string;
  position: string;
}

export class Webinar {
  id!: number;
  title!: string;
  description!: string;
  datetimeStart!: Date;
  duration!: number;
  isRegistrated!: boolean | null;
  recordingLink!: boolean | null;
  speaker!: Speaker;
}
