"use strict";

// Fermi–Dirac distribution explorer. The material selector is descriptive:
// both materials currently use the specified common reference E_C = 0 eV.
(() => {
  const BOLTZMANN_EV_PER_K = 8.617333262e-5;
  const DEFAULTS = { fermiLevel: 0, temperature: 300, material: "Si" };
  const ENERGY_MIN = -0.5;
  const ENERGY_MAX = 0.5;
  const ENERGY_SAMPLES = 241;

  const elements = {
    fermi: document.getElementById("fermiLevel"),
    temperature: document.getElementById("temperature"),
    material: document.getElementById("material"),
    fermiOutput: document.getElementById("fermiOutput"),
    temperatureOutput: document.getElementById("temperatureOutput"),
    materialReadout: document.getElementById("materialReadout"),
    fermiReadout: document.getElementById("fermiReadout"),
    temperatureReadout: document.getElementById("temperatureReadout"),
    thermalEnergy: document.getElementById("thermalEnergy"),
    footerMaterial: document.getElementById("footerMaterial"),
    chart: document.getElementById("distributionChart"),
    gridLayer: document.getElementById("gridLayer"),
    axisLayer: document.getElementById("axisLayer"),
    labelLayer: document.getElementById("labelLayer"),
    curvePath: document.getElementById("curvePath"),
    curveArea: document.getElementById("curveArea"),
    fermiLine: document.getElementById("fermiLine"),
    fermiPoint: document.getElementById("fermiPoint"),
    clipRect: document.getElementById("plotClipRect"),
    chartDescription: document.getElementById("chartDescription"),
    reset: document.getElementById("resetButton"),
  };

  const SVG_NS = "http://www.w3.org/2000/svg";
  const plot = { left: 68, right: 738, top: 24, bottom: 302 };
  const plotWidth = plot.right - plot.left;
  const plotHeight = plot.bottom - plot.top;

  function createSvgElement(name, attributes, text) {
    const node = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function occupationProbability(energy, fermiLevel, temperature) {
    const exponent = (energy - fermiLevel) / (BOLTZMANN_EV_PER_K * temperature);
    // These cutoffs avoid overflow while preserving the limiting probabilities.
    if (exponent >= 40) return 0;
    if (exponent <= -40) return 1;
    return 1 / (1 + Math.exp(exponent));
  }

  function xForEnergy(energy) {
    return plot.left + ((energy - ENERGY_MIN) / (ENERGY_MAX - ENERGY_MIN)) * plotWidth;
  }

  function yForProbability(probability) {
    const safeProbability = Math.max(0, Math.min(1, probability));
    return plot.bottom - safeProbability * plotHeight;
  }

  function addAxes() {
    elements.clipRect.setAttribute("x", plot.left);
    elements.clipRect.setAttribute("y", plot.top);
    elements.clipRect.setAttribute("width", plotWidth);
    elements.clipRect.setAttribute("height", plotHeight);

    const grid = document.createDocumentFragment();
    const labels = document.createDocumentFragment();
    for (let step = 0; step <= 5; step += 1) {
      const probability = 1 - step / 5;
      const y = yForProbability(probability);
      grid.append(createSvgElement("line", { x1: plot.left, y1: y, x2: plot.right, y2: y, class: "grid-line" }));
      labels.append(createSvgElement("text", { x: plot.left - 12, y: y + 3.5, "text-anchor": "end", class: "tick-label" }, probability.toFixed(1)));
    }

    for (let step = 0; step <= 4; step += 1) {
      const energy = ENERGY_MIN + (step / 4) * (ENERGY_MAX - ENERGY_MIN);
      const x = xForEnergy(energy);
      grid.append(createSvgElement("line", { x1: x, y1: plot.top, x2: x, y2: plot.bottom, class: "grid-line" }));
      labels.append(createSvgElement("text", { x, y: plot.bottom + 18, "text-anchor": "middle", class: "tick-label" }, energy.toFixed(2)));
    }

    elements.gridLayer.replaceChildren(grid);
    elements.axisLayer.replaceChildren(
      createSvgElement("line", { x1: plot.left, y1: plot.top, x2: plot.left, y2: plot.bottom, class: "axis-line" }),
      createSvgElement("line", { x1: plot.left, y1: plot.bottom, x2: plot.right, y2: plot.bottom, class: "axis-line" }),
    );
    labels.append(createSvgElement("text", { x: 18, y: (plot.top + plot.bottom) / 2, transform: `rotate(-90 18 ${(plot.top + plot.bottom) / 2})`, "text-anchor": "middle", class: "axis-label" }, "Occupation probability  f(E)"));
    elements.labelLayer.replaceChildren(labels);
  }

  function renderCurve(fermiLevel, temperature) {
    const points = [];
    for (let index = 0; index < ENERGY_SAMPLES; index += 1) {
      const energy = ENERGY_MIN + (index / (ENERGY_SAMPLES - 1)) * (ENERGY_MAX - ENERGY_MIN);
      const probability = occupationProbability(energy, fermiLevel, temperature);
      points.push([xForEnergy(energy), yForProbability(probability)]);
    }

    const linePath = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
    const first = points[0];
    const last = points[points.length - 1];
    elements.curvePath.setAttribute("d", linePath);
    elements.curveArea.setAttribute("d", `${linePath} L${last[0].toFixed(2)},${plot.bottom} L${first[0].toFixed(2)},${plot.bottom} Z`);

    const markerX = xForEnergy(fermiLevel);
    const markerY = yForProbability(occupationProbability(fermiLevel, fermiLevel, temperature));
    elements.fermiLine.setAttribute("x1", markerX);
    elements.fermiLine.setAttribute("x2", markerX);
    elements.fermiLine.setAttribute("y1", plot.top);
    elements.fermiLine.setAttribute("y2", plot.bottom);
    elements.fermiPoint.setAttribute("cx", markerX);
    elements.fermiPoint.setAttribute("cy", markerY);
    elements.chartDescription.textContent = `Occupation probability from ${ENERGY_MIN.toFixed(2)} to ${ENERGY_MAX.toFixed(2)} electron volts at ${temperature} kelvin. The Fermi level is ${fermiLevel.toFixed(2)} electron volts, where occupation probability is 0.5.`;
  }

  function render() {
    const fermiLevel = Number(elements.fermi.value);
    const temperature = Number(elements.temperature.value);
    const material = elements.material.value;
    const materialName = material === "GaN" ? "Gallium Nitride" : "Silicon";

    elements.fermiOutput.innerHTML = `${fermiLevel.toFixed(2)} <span>eV</span>`;
    elements.temperatureOutput.innerHTML = `${temperature} <span>K</span>`;
    elements.materialReadout.innerHTML = `${materialName} <span>(${material})</span>`;
    elements.fermiReadout.innerHTML = `${fermiLevel.toFixed(2)} <span>eV</span>`;
    elements.temperatureReadout.innerHTML = `${temperature} <span>K</span>`;
    elements.thermalEnergy.innerHTML = `k<sub>B</sub>T = ${(BOLTZMANN_EV_PER_K * temperature).toFixed(4)} eV`;
    elements.footerMaterial.textContent = `${materialName.toUpperCase()} (${material})`;
    elements.fermi.style.setProperty("--progress", `${((fermiLevel - Number(elements.fermi.min)) / (Number(elements.fermi.max) - Number(elements.fermi.min))) * 100}%`);
    elements.temperature.style.setProperty("--progress", `${((temperature - Number(elements.temperature.min)) / (Number(elements.temperature.max) - Number(elements.temperature.min))) * 100}%`);
    renderCurve(fermiLevel, temperature);
  }

  elements.fermi.addEventListener("input", render);
  elements.temperature.addEventListener("input", render);
  elements.material.addEventListener("change", render);
  elements.reset.addEventListener("click", () => {
    elements.fermi.value = String(DEFAULTS.fermiLevel);
    elements.temperature.value = String(DEFAULTS.temperature);
    elements.material.value = DEFAULTS.material;
    render();
  });

  addAxes();
  render();
})();
