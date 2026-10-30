# Fermi Lab — Distribution Explorer

A browser-based Fermi–Dirac occupation probability explorer. Two ESP32-connected potentiometers can control the Fermi level and temperature sliders in real time.

## Run with the ESP32 controller

1. Connect the Fermi level potentiometer wiper to GPIO 33 and the temperature potentiometer wiper to GPIO 32. On the NodeMCU board, find the pins labeled IO33/GPIO33 and IO32/GPIO32. Connect each pot's other legs to 3V3 and GND. Do not connect potentiometers to 5V. These ADC1 pins support analog reads while Wi-Fi is active. GPIO 27 and GPIO 14 are ADC2 pins on the classic ESP32 and conflict with Wi-Fi analog reads.
2. In `espcodev1/espcodev1.ino`, set `ssid` and `password` to the laptop hotspot credentials. Upload the sketch.
3. Open Serial Monitor at 115200 baud and note the ESP32 IP address it prints.
4. Connect the laptop to the same hotspot, then open `index.html` in Chrome.
5. Enter the ESP32 IP printed in Serial Monitor in the **ESP32 address** box and click **Connect**.

The page polls `/data` 6–7 times per second. It maps `fermi_raw` (0–4095) to −0.50…+0.50 eV and `temperature_raw` (0–4095) to 50…800 K. The hardware connection badge shows whether readings are arriving. Both values also update the graph and readouts. The IP may change after reconnecting to a hotspot; enter the newly printed address when that happens.

The controls can still be dragged with a mouse, but the next ESP32 reading will update them again. The material selector remains a display setting and does not change the equation.

## Browser-only use

Open `index.html` in a modern browser. If the ESP32 is not reachable, the dashboard remains usable with its sliders; the status badge shows **HARDWARE OFFLINE**. The dashboard has no build step or package installation. Google Fonts load when internet access is available.

In VS Code, press **F5** and choose **Launch website in Chrome**. The launch configuration starts a local Python web server on `127.0.0.1:8080` before opening Chrome. Python must be installed. If port 8080 is already in use, stop the other server using that port first.

## Model

- **Fermi level:** −0.50 to +0.50 eV, relative to the conduction band reference `E_C = 0 eV`.
- **Temperature:** 50 to 800 K.
- **Material:** Silicon (Si) or Gallium Nitride (GaN), shown in the dashboard; both currently use the same reference and equation.
- **Reset:** sets Fermi level to 0.00 eV, temperature to 300 K, and material to Silicon. Hardware readings will apply again on the next poll.

The plot shows `f(E) = 1 / (1 + exp((E − E_F) / (k_B T)))` over −0.50 to +0.50 eV. Its dashed vertical marker indicates `E_F`. The graph uses native SVG.
