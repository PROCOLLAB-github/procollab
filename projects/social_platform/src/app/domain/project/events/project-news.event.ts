/** @format */

import { DomainEvent } from "@domain/shared/domain-event";

export interface AddNews extends DomainEvent {
  type: "AddNews";
  payload: {
    projectId: string;
  };
}

export interface DeleteNews extends DomainEvent {
  type: "DeleteNews";
  payload: {
    projectId: string;
    newsId: string;
  };
}

export interface EditNews extends DomainEvent {
  type: "EditNews";
  payload: {
    projectId: string;
    newsId: string;
  };
}

export interface ToggleLike extends DomainEvent {
  type: "ToggleLike";
  payload: {
    projectId: string;
    newsId: string;
  };
}

export interface ReadNews extends DomainEvent {
  type: "ReadNews";
  payload: {
    projectId: string;
  };
}

export function addNews(projectId: string): AddNews {
  return {
    type: "AddNews",
    payload: {
      projectId,
    },
    occurredAt: new Date(),
  };
}
export function deleteNews(projectId: string, newsId: string): DeleteNews {
  return {
    type: "DeleteNews",
    payload: {
      projectId,
      newsId,
    },
    occurredAt: new Date(),
  };
}

export function editNews(projectId: string, newsId: string): EditNews {
  return {
    type: "EditNews",
    payload: {
      projectId,
      newsId,
    },
    occurredAt: new Date(),
  };
}

export function toggleLike(projectId: string, newsId: string): ToggleLike {
  return {
    type: "ToggleLike",
    payload: {
      projectId,
      newsId,
    },
    occurredAt: new Date(),
  };
}

export function readNews(projectId: string): ReadNews {
  return {
    type: "ReadNews",
    payload: {
      projectId,
    },
    occurredAt: new Date(),
  };
}
