<!-- @format -->

# Certificate fonts

WOFF2 files are container conversions of Google Fonts TTF files from commit
[`e7db6ca603fd4862010383ff17ffd6cc4ffac1c0`](https://github.com/google/fonts/tree/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0).
The paired API bundles the original TTFs for identical text metrics and PDF embedding.
Font outlines, names, character coverage and layout tables are retained.

| Frontend file         | Upstream TTF                         | TTF SHA-256                                                      |
| --------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| PTSerif-Regular.woff2 | ofl/ptserif/PT_Serif-Web-Regular.ttf | a4951fade06ff8f09b7673aa81ffb65a8cd409e24d3289a6dc670bc4dda2557a |
| PTSerif-Bold.woff2    | ofl/ptserif/PT_Serif-Web-Bold.ttf    | 038ba7336bd7ea14f12ad155bed51a4345cac5153275d521dec3ba04021c526e |
| Lobster-Regular.woff2 | ofl/lobster/Lobster-Regular.ttf      | d6568e697fd50cedc0be04d8aae4127fe95add607e7bff954ca88604be80c205 |

PT Serif: ParaType. [License and attribution](PTSerif-OFL.txt).
Lobster: The Lobster Project Authors. [License and attribution](Lobster-OFL.txt).
Mont continues to use the existing product assets. All font requests are served
by the application, with no Google Fonts CDN dependency. Added WOFF2 files total
297,460 bytes and are loaded when the certificate canvas opens.

The CSS aliases `Certificate PT Serif` and `Certificate Lobster` apply only to
certificate text. Product controls and editor selection labels keep Mont.
