# Fermi Lab — Distribution Explorer

A small, browser-based dashboard for exploring the Fermi–Dirac occupation probability in silicon and gallium nitride. Both materials currently share the same energy reference and distribution model, as specified for this initial stage.

## Run locally

1. Keep `index.html`, `style.css`, and `script.js` in the same folder.
2. Open `index.html` in a modern browser.

No build step or package installation is needed. The fonts are loaded from Google Fonts when an internet connection is available; the dashboard itself works without them.

## Controls and model

- **Fermi level:** −0.50 to +0.50 eV, relative to the conduction band reference `E_C = 0 eV`.
- **Temperature:** 50 to 800 K.
- **Material:** Silicon (Si) or Gallium Nitride (GaN). The choice is displayed in the dashboard and does not yet change the equation.
- **Reset to defaults:** Fermi level 0.00 eV, temperature 300 K, and Silicon.

The plot shows `f(E) = 1 / (1 + exp((E − E_F) / (k_B T)))` over −0.50 to +0.50 eV. Its dashed vertical marker indicates `E_F`. The graph is drawn with native SVG and updates in the browser as controls change.
