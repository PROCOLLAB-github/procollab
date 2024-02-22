/** @format */

import { Routes } from "@angular/router";
import { FeedComponent } from "@office/feed/feed.component";
import { FeedResolver } from "@office/feed/feed.resolver";

export const FEED_ROUTES: Routes = [
  {
    path: "",
    component: FeedComponent,
    resolve: {
      data: FeedResolver,
    },
  },
];
