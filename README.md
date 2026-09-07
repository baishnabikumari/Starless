# Starless
A browser-based interactive night sky map. renders starsand constellation on an HTML canvas using the real astromical projection maths and no framwork no build steps and etc.

## Screenshot/Demo

## Video Demo

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