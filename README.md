# Starless
A browser-based interactive night sky map. renders starsand constellation on an HTML canvas using the real astromical projection maths and no framwork no build steps and etc.

## Screenshot/Demo
<img width="2158" height="1368" alt="Screenshot 2026-09-07 at 8 19 44 PM" src="https://github.com/user-attachments/assets/66f50a22-9757-49a3-a5dd-c1d2264003be" />
<img width="2161" height="1369" alt="Screenshot 2026-09-07 at 8 20 29 PM" src="https://github.com/user-attachments/assets/3cf8ff3d-01ad-43ea-86e5-bebb70ac9889" />
<img width="2160" height="1371" alt="Screenshot 2026-09-07 at 8 20 46 PM" src="https://github.com/user-attachments/assets/5c3c8d9f-2dae-4973-b3b1-9bce0e58e7bc" />
<img width="2157" height="1369" alt="Screenshot 2026-09-07 at 8 21 36 PM" src="https://github.com/user-attachments/assets/6d2d72ff-be1c-4d08-b56c-798b42de238f" />
<img width="2154" height="1368" alt="Screenshot 2026-09-07 at 8 22 30 PM" src="https://github.com/user-attachments/assets/d67a61ae-599d-41f5-8379-55f25f89b430" />

## Video Demo
https://github.com/user-attachments/assets/d9f739cf-c62f-4e8a-a69d-fac5d6e5fb7d

## Live URL
https://github.com/baishnabikumari/Starless

## Features
- **Star field** rendered form the 8900+ star catalog, positioned live using RA and DEC -> Alt and Az conversion for your chosen location and time.
- **Constellation lines and labels** with basic label-collision avoidance so name dont overlap.
- **Search** jump to and highlight a star or constellation by name.
- **location input** - manual latitude/longitude entry, or automatic browser geolocation.
- **Time control** - a slider to scrub through the day, plus a play/pause timelapse of the sky rotating in real time.
- **Light pollution simulation** - a borltle scale selector(1-9) that filter the a glow near the horizon.
- **Alt/az grid overlay** - togglable reference grid.
- **Pan and zoom** - drag to pan, scroll to zoom.
- **Click to identify** - click any rendered star to see its name.

## Running it
This is a static site - its just needs to be served over the HTTP.
Clone the repo and just open the `index.html` in the browser using the live server extension.

Made with 💖 by baishu...
