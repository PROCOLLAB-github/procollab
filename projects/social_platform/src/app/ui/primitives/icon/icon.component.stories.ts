/** @format */

import { Meta, StoryObj } from "@storybook/angular";
import { IconComponent } from "./icon.component";

const meta: Meta<IconComponent> = {
  title: "UI/PRIMITIVES/Icon",
  component: IconComponent,
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: "select",
      options: [
        "academic-hat",
        "accent-error",
        "achievements",
        "add-person",
        "additional",
        "anchor",
        "arrow-down",
        "arrow-no-body",
        "arrow-wide",
        "arrowright",
        "attach",
        "basket",
        "bea",
        "beb",
        "bell",
        "book",
        "box",
        "calendar",
        "chats",
        "check",
        "circle-check",
        "command",
        "comment",
        "contacts",
        "cross",
        "deadline",
        "dots",
        "download",
        "dsa",
        "dsb",
        "dsc",
        "edit-pen",
        "edit-pen-old",
        "efficiency",
        "empty-chat",
        "empty-mail",
        "error",
        "eye",
        "eye-off",
        "favourites",
        "feed",
        "file",
        "file-success",
        "file_arch",
        "file_csv",
        "file_doc",
        "file_file",
        "file_image",
        "file_jpeg",
        "file_mp3",
        "file_mp4",
        "file_pdf",
        "file_png",
        "file_ppt",
        "file_svg",
        "file_txt",
        "file_video",
        "file_webp",
        "file_xls",
        "file_xlsx",
        "filter",
        "folder",
        "folders",
        "geo-point",
        "goal",
        "graph",
        "hand",
        "hashtag",
        "hint",
        "in-search",
        "inline-check",
        "key",
        "label",
        "left-arrow",
        "like",
        "link",
        "lock",
        "logout",
        "logout2",
        "logout3",
        "mail",
        "main",
        "medal",
        "medal-outlined",
        "menu-burger",
        "menu-cross",
        "message",
        "message-inline",
        "pen",
        "people",
        "people-bold",
        "people-filled",
        "person",
        "phone",
        "pin",
        "plus",
        "procollab",
        "program",
        "projects",
        "reload",
        "reply",
        "rocket",
        "sad-smile",
        "search",
        "search-sidebar",
        "send",
        "settings",
        "share",
        "slide",
        "smile",
        "spinner",
        "squiz",
        "star",
        "straight-face",
        "subscribe-badge",
        "suitcase",
        "task",
        "team",
        "telegram",
        "trajectories",
        "triangle",
        "two-people",
        "unsubscribe-badge",
        "upload",
        "vacancies",
        "views",
        "vk",
        "work",
        "world-wide",
      ],
    },
    appSquare: { control: "text" },
    appWidth: { control: "text" },
    appHeight: { control: "text" },
    appViewBox: { control: "text" },
  },
  render: args => ({
    props: args,
    template: `<i appIcon [icon]="icon" [appSquare]="appSquare" [appWidth]="appWidth" [appHeight]="appHeight" [appViewBox]="appViewBox"></i>`,
  }),
};
export default meta;

type Story = StoryObj<IconComponent>;

export const AcademicHat: Story = { args: { icon: "academic-hat", appSquare: "24" } };
export const AccentError: Story = { args: { icon: "accent-error", appSquare: "24" } };
export const Achievements: Story = { args: { icon: "achievements", appSquare: "24" } };
export const AddPerson: Story = { args: { icon: "add-person", appSquare: "24" } };
export const Additional: Story = { args: { icon: "additional", appSquare: "24" } };
export const Anchor: Story = { args: { icon: "anchor", appSquare: "24" } };
export const ArrowDown: Story = { args: { icon: "arrow-down", appSquare: "24" } };
export const ArrowNoBody: Story = { args: { icon: "arrow-no-body", appSquare: "24" } };
export const ArrowWide: Story = { args: { icon: "arrow-wide", appSquare: "24" } };
export const Arrowright: Story = { args: { icon: "arrowright", appSquare: "24" } };
export const Attach: Story = { args: { icon: "attach", appSquare: "24" } };
export const Basket: Story = { args: { icon: "basket", appSquare: "24" } };
export const Bea: Story = { args: { icon: "bea", appSquare: "24" } };
export const Beb: Story = { args: { icon: "beb", appSquare: "24" } };
export const Bell: Story = { args: { icon: "bell", appSquare: "24" } };
export const Book: Story = { args: { icon: "book", appSquare: "24" } };
export const Box: Story = { args: { icon: "box", appSquare: "24" } };
export const Calendar: Story = { args: { icon: "calendar", appSquare: "24" } };
export const Chats: Story = { args: { icon: "chats", appSquare: "24" } };
export const Check: Story = { args: { icon: "check", appSquare: "24" } };
export const CircleCheck: Story = { args: { icon: "circle-check", appSquare: "24" } };
export const Command: Story = { args: { icon: "command", appSquare: "24" } };
export const Comment: Story = { args: { icon: "comment", appSquare: "24" } };
export const Contacts: Story = { args: { icon: "contacts", appSquare: "24" } };
export const Cross: Story = { args: { icon: "cross", appSquare: "24" } };
export const Deadline: Story = { args: { icon: "deadline", appSquare: "24" } };
export const Dots: Story = { args: { icon: "dots", appSquare: "24" } };
export const Download: Story = { args: { icon: "download", appSquare: "24" } };
export const Dsa: Story = { args: { icon: "dsa", appSquare: "24" } };
export const Dsb: Story = { args: { icon: "dsb", appSquare: "24" } };
export const Dsc: Story = { args: { icon: "dsc", appSquare: "24" } };
export const EditPen: Story = { args: { icon: "edit-pen", appSquare: "24" } };
export const EditPenOld: Story = { args: { icon: "edit-pen-old", appSquare: "24" } };
export const Efficiency: Story = { args: { icon: "efficiency", appSquare: "24" } };
export const EmptyChat: Story = { args: { icon: "empty-chat", appSquare: "24" } };
export const EmptyMail: Story = { args: { icon: "empty-mail", appSquare: "24" } };
export const Error: Story = { args: { icon: "error", appSquare: "24" } };
export const Eye: Story = { args: { icon: "eye", appSquare: "24" } };
export const EyeOff: Story = { args: { icon: "eye-off", appSquare: "24" } };
export const Favourites: Story = { args: { icon: "favourites", appSquare: "24" } };
export const Feed: Story = { args: { icon: "feed", appSquare: "24" } };
export const File: Story = { args: { icon: "file", appSquare: "24" } };
export const FileSuccess: Story = { args: { icon: "file-success", appSquare: "24" } };
export const FileArch: Story = { args: { icon: "file_arch", appSquare: "24" } };
export const FileCsv: Story = { args: { icon: "file_csv", appSquare: "24" } };
export const FileDoc: Story = { args: { icon: "file_doc", appSquare: "24" } };
export const FileFile: Story = { args: { icon: "file_file", appSquare: "24" } };
export const FileImage: Story = { args: { icon: "file_image", appSquare: "24" } };
export const FileJpeg: Story = { args: { icon: "file_jpeg", appSquare: "24" } };
export const FileMp3: Story = { args: { icon: "file_mp3", appSquare: "24" } };
export const FileMp4: Story = { args: { icon: "file_mp4", appSquare: "24" } };
export const FilePdf: Story = { args: { icon: "file_pdf", appSquare: "24" } };
export const FilePng: Story = { args: { icon: "file_png", appSquare: "24" } };
export const FilePpt: Story = { args: { icon: "file_ppt", appSquare: "24" } };
export const FileSvg: Story = { args: { icon: "file_svg", appSquare: "24" } };
export const FileTxt: Story = { args: { icon: "file_txt", appSquare: "24" } };
export const FileVideo: Story = { args: { icon: "file_video", appSquare: "24" } };
export const FileWebp: Story = { args: { icon: "file_webp", appSquare: "24" } };
export const FileXls: Story = { args: { icon: "file_xls", appSquare: "24" } };
export const FileXlsx: Story = { args: { icon: "file_xlsx", appSquare: "24" } };
export const Filter: Story = { args: { icon: "filter", appSquare: "24" } };
export const Folder: Story = { args: { icon: "folder", appSquare: "24" } };
export const Folders: Story = { args: { icon: "folders", appSquare: "24" } };
export const GeoPoint: Story = { args: { icon: "geo-point", appSquare: "24" } };
export const Goal: Story = { args: { icon: "goal", appSquare: "24" } };
export const Graph: Story = { args: { icon: "graph", appSquare: "24" } };
export const Hand: Story = { args: { icon: "hand", appSquare: "24" } };
export const Hashtag: Story = { args: { icon: "hashtag", appSquare: "24" } };
export const Hint: Story = { args: { icon: "hint", appSquare: "24" } };
export const InSearch: Story = { args: { icon: "in-search", appSquare: "24" } };
export const InlineCheck: Story = { args: { icon: "inline-check", appSquare: "24" } };
export const Key: Story = { args: { icon: "key", appSquare: "24" } };
export const Label: Story = { args: { icon: "label", appSquare: "24" } };
export const LeftArrow: Story = { args: { icon: "left-arrow", appSquare: "24" } };
export const Like: Story = { args: { icon: "like", appSquare: "24" } };
export const Link: Story = { args: { icon: "link", appSquare: "24" } };
export const Lock: Story = { args: { icon: "lock", appSquare: "24" } };
export const Logout: Story = { args: { icon: "logout", appSquare: "24" } };
export const Logout2: Story = { args: { icon: "logout2", appSquare: "24" } };
export const Logout3: Story = { args: { icon: "logout3", appSquare: "24" } };
export const Mail: Story = { args: { icon: "mail", appSquare: "24" } };
export const Main: Story = { args: { icon: "main", appSquare: "24" } };
export const Medal: Story = { args: { icon: "medal", appSquare: "24" } };
export const MedalOutlined: Story = { args: { icon: "medal-outlined", appSquare: "24" } };
export const MenuBurger: Story = { args: { icon: "menu-burger", appSquare: "24" } };
export const MenuCross: Story = { args: { icon: "menu-cross", appSquare: "24" } };
export const Message: Story = { args: { icon: "message", appSquare: "24" } };
export const MessageInline: Story = { args: { icon: "message-inline", appSquare: "24" } };
export const Pen: Story = { args: { icon: "pen", appSquare: "24" } };
export const People: Story = { args: { icon: "people", appSquare: "24" } };
export const PeopleBold: Story = { args: { icon: "people-bold", appSquare: "24" } };
export const PeopleFilled: Story = { args: { icon: "people-filled", appSquare: "24" } };
export const Person: Story = { args: { icon: "person", appSquare: "24" } };
export const Phone: Story = { args: { icon: "phone", appSquare: "24" } };
export const Pin: Story = { args: { icon: "pin", appSquare: "24" } };
export const Plus: Story = { args: { icon: "plus", appSquare: "24" } };
export const Procollab: Story = { args: { icon: "procollab", appSquare: "24" } };
export const Program: Story = { args: { icon: "program", appSquare: "24" } };
export const Projects: Story = { args: { icon: "projects", appSquare: "24" } };
export const Reload: Story = { args: { icon: "reload", appSquare: "24" } };
export const Reply: Story = { args: { icon: "reply", appSquare: "24" } };
export const Rocket: Story = { args: { icon: "rocket", appSquare: "24" } };
export const SadSmile: Story = { args: { icon: "sad-smile", appSquare: "24" } };
export const Search: Story = { args: { icon: "search", appSquare: "24" } };
export const SearchSidebar: Story = { args: { icon: "search-sidebar", appSquare: "24" } };
export const Send: Story = { args: { icon: "send", appSquare: "24" } };
export const Settings: Story = { args: { icon: "settings", appSquare: "24" } };
export const Share: Story = { args: { icon: "share", appSquare: "24" } };
export const Slide: Story = { args: { icon: "slide", appSquare: "24" } };
export const Smile: Story = { args: { icon: "smile", appSquare: "24" } };
export const Spinner: Story = { args: { icon: "spinner", appSquare: "24" } };
export const Squiz: Story = { args: { icon: "squiz", appSquare: "24" } };
export const Star: Story = { args: { icon: "star", appSquare: "24" } };
export const StraightFace: Story = { args: { icon: "straight-face", appSquare: "24" } };
export const SubscribeBadge: Story = { args: { icon: "subscribe-badge", appSquare: "24" } };
export const Suitcase: Story = { args: { icon: "suitcase", appSquare: "24" } };
export const Task: Story = { args: { icon: "task", appSquare: "24" } };
export const Team: Story = { args: { icon: "team", appSquare: "24" } };
export const Telegram: Story = { args: { icon: "telegram", appSquare: "24" } };
export const Trajectories: Story = { args: { icon: "trajectories", appSquare: "24" } };
export const Triangle: Story = { args: { icon: "triangle", appSquare: "24" } };
export const TwoPeople: Story = { args: { icon: "two-people", appSquare: "24" } };
export const UnsubscribeBadge: Story = { args: { icon: "unsubscribe-badge", appSquare: "24" } };
export const Upload: Story = { args: { icon: "upload", appSquare: "24" } };
export const Vacancies: Story = { args: { icon: "vacancies", appSquare: "24" } };
export const Views: Story = { args: { icon: "views", appSquare: "24" } };
export const Vk: Story = { args: { icon: "vk", appSquare: "24" } };
export const Work: Story = { args: { icon: "work", appSquare: "24" } };
export const WorldWide: Story = { args: { icon: "world-wide", appSquare: "24" } };
