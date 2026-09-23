/** @format */

import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { ProjectCount } from "@domain/project/project.model";
import { SoonCardComponent } from "@ui/primitives/soon-card/soon-card.component";
import { ProjectActivityCardComponent } from "./project-activity-card.component";

const count: ProjectCount = {
  all: 24,
  my: 7,
  subs: 3,
  myLeader: 4,
  myInProgram: 2,
  mySubmitted: 1,
};

const fixtureStyles = `
  <style>
    .activity-fixture {
      box-sizing: border-box;
      min-height: 100vh;
      padding: 32px;
      color: #332e2d;
      background: #f8f8f8;
      font-family: "Montserrat", sans-serif;
    }

    .activity-fixture__title {
      margin: 0 0 20px;
      color: #8a5de8;
      font-size: 18px;
      font-weight: 500;
    }

    .activity-fixture__layout {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      justify-content: space-between;
    }

    .activity-fixture__content {
      display: grid;
      flex: 1 1 auto;
      grid-template-columns: repeat(2, minmax(220px, 1fr));
      gap: 12px;
      min-width: 0;
    }

    .activity-fixture__project {
      box-sizing: border-box;
      min-height: 122px;
      padding: 18px;
      background: #fff;
      border: 0.5px solid #d8d5dc;
      border-radius: 12px;
    }

    .activity-fixture__project-title {
      margin: 0 0 12px;
      color: #8a5de8;
      font-size: 13px;
    }

    .activity-fixture__line {
      height: 7px;
      margin-top: 7px;
      background: #eeeaf8;
      border-radius: 8px;
    }

    .activity-fixture__line--short {
      width: 62%;
    }

    .activity-fixture__side {
      display: flex;
      flex: 0 0 157px;
      flex-direction: column;
      gap: 15px;
      width: 157px;
    }

    .activity-fixture__create {
      box-sizing: border-box;
      width: 157px;
      padding: 7px 10px;
      color: #fff;
      text-align: center;
      background: #8a5de8;
      border-radius: 18px;
      font-size: 11px;
    }

    .activity-fixture__invites-title {
      display: flex;
      justify-content: space-between;
      padding-bottom: 8px;
      color: #8a5de8;
      border-bottom: 0.5px solid #8a5de8;
      font-size: 11px;
    }

    .activity-fixture__empty {
      padding: 12px 5px;
      color: #8a5de8;
      text-align: center;
      border: 0.5px dashed #a6a1aa;
      border-radius: 10px;
      font-size: 10px;
    }

    @media (width < 1000px) {
      .activity-fixture {
        padding: 20px 16px;
      }

      .activity-fixture__layout {
        flex-direction: column;
      }

      .activity-fixture__content {
        grid-template-columns: 1fr;
        width: 100%;
      }

      .activity-fixture__side {
        align-items: center;
        width: 100%;
      }
    }
  </style>
`;

const projects = `
  <div class="activity-fixture__content">
    <article class="activity-fixture__project">
      <p class="activity-fixture__project-title">Цифровая платформа проекта</p>
      <div class="activity-fixture__line"></div>
      <div class="activity-fixture__line activity-fixture__line--short"></div>
    </article>
    <article class="activity-fixture__project">
      <p class="activity-fixture__project-title">Образовательная инициатива</p>
      <div class="activity-fixture__line"></div>
      <div class="activity-fixture__line activity-fixture__line--short"></div>
    </article>
  </div>
`;

const meta: Meta<ProjectActivityCardComponent> = {
  title: "Projects/Моя активность",
  component: ProjectActivityCardComponent,
  decorators: [
    moduleMetadata({
      imports: [ProjectActivityCardComponent, SoonCardComponent],
    }),
  ],
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<ProjectActivityCardComponent>;

export const Card: Story = {
  name: "Карточка",
  args: { count, state: "loaded" },
};

export const DashboardBefore: Story = {
  name: "Dashboard · до",
  render: () => ({
    template: `
      ${fixtureStyles}
      <main class="activity-fixture">
        <h1 class="activity-fixture__title">Проекты · dashboard</h1>
        <div class="activity-fixture__layout">
          ${projects}
          <aside class="activity-fixture__side">
            <div class="activity-fixture__create">создать проект</div>
            <div class="activity-fixture__invites-title"><span>мои приглашения</span><span>↗</span></div>
            <div class="activity-fixture__empty">пока нет приглашений</div>
            <app-soon-card
              title="статистика"
              description="количество проектов, команды, эффективность"
            ></app-soon-card>
          </aside>
        </div>
      </main>
    `,
  }),
};

export const DashboardAfter: Story = {
  name: "Dashboard · после",
  render: () => ({
    props: { count },
    template: `
      ${fixtureStyles}
      <main class="activity-fixture">
        <h1 class="activity-fixture__title">Проекты · dashboard</h1>
        <div class="activity-fixture__layout">
          ${projects}
          <aside class="activity-fixture__side">
            <div class="activity-fixture__create">создать проект</div>
            <div class="activity-fixture__invites-title"><span>мои приглашения</span><span>↗</span></div>
            <div class="activity-fixture__empty">пока нет приглашений</div>
            <app-project-activity-card [count]="count" state="loaded"></app-project-activity-card>
          </aside>
        </div>
      </main>
    `,
  }),
};

export const MyProjectsBefore: Story = {
  name: "Мои проекты · до",
  render: () => ({
    template: `
      ${fixtureStyles}
      <main class="activity-fixture">
        <h1 class="activity-fixture__title">Проекты · мои проекты</h1>
        <div class="activity-fixture__layout">
          ${projects}
          <aside class="activity-fixture__side">
            <div class="activity-fixture__create">создать проект</div>
            <app-soon-card
              title="статистика"
              description="количество проектов, команды, эффективность"
            ></app-soon-card>
          </aside>
        </div>
      </main>
    `,
  }),
};

export const MyProjectsAfter: Story = {
  name: "Мои проекты · после",
  render: () => ({
    props: { count },
    template: `
      ${fixtureStyles}
      <main class="activity-fixture">
        <h1 class="activity-fixture__title">Проекты · мои проекты</h1>
        <div class="activity-fixture__layout">
          ${projects}
          <aside class="activity-fixture__side">
            <div class="activity-fixture__create">создать проект</div>
            <app-project-activity-card [count]="count" state="loaded"></app-project-activity-card>
          </aside>
        </div>
      </main>
    `,
  }),
};
