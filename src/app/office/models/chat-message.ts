/** @format */

import { User } from "../../auth/models/user.model";
import * as dayjs from "dayjs";

export class ChatMessage {
  id!: number;
  sender!: User;
  content!: string;
  time!: string;

  static default(): ChatMessage {
    return {
      sender: User.default(),
      time: dayjs().format("YYYY-MM-DD hh:mm:ss"),
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium assumenda atque commodi cum cupiditate dignissimos dolor dolorum error harum id inventore, ipsa iste magni non perspiciatis, praesentium quasi quibusdam quidem quo ratione recusandae reiciendis rem tempora tenetur vel voluptate voluptatem! Alias dolor ea hic labore mollitia quam quisquam quo recusandae tempore? Amet cum expedita illum maxime nam odio quaerat repellendus repudiandae, soluta tenetur. Animi autem consequuntur fugiat in maxime quibusdam repellat. Aliquid asperiores dicta eius in ipsam, maiores minus obcaecati porro reiciendis, rerum suscipit totam unde voluptatibus. Atque doloremque error fuga, laboriosam porro praesentium quod quos suscipit totam unde.",
      id: 1,
    } as ChatMessage;
  }
}
