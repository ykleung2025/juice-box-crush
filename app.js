/* Juice-carton pressure lesson.
   Fewer gas molecules → lower pressure inside → outside air pushes the walls in.
   The crush is a push from atmospheric pressure, not a vacuum pulling. */
(function () {
  "use strict";

  const VB_W = 700;
  const VB_H = 480;
  const NS = "http://www.w3.org/2000/svg";
  const COL_IN = "#087a4e";
  const COL_OUT = "#1565c0";
  const LAST = 6;
  // Outside air pressure does not change, so outside arrows stay this length.
  const OUT_LEN = 42;
  const COLS = 8;
  const ROWS = 6;
  const MOL_COUNT = COLS * ROWS;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (id) => document.getElementById(id);

  function rowIndices(row) {
    const list = [];
    for (let c = 0; c < COLS; c += 1) list.push(row * COLS + c);
    return list;
  }

  function removedMask(list) {
    const mask = Array(MOL_COUNT).fill(1);
    list.forEach((i) => {
      mask[i] = 0;
    });
    return mask;
  }

  const MASK_ALL = Array(MOL_COUNT).fill(1);
  const MASK_SIP1 = removedMask([...rowIndices(0), ...rowIndices(1)]);
  const MASK_SIP2 = removedMask([
    ...rowIndices(0),
    ...rowIndices(1),
    ...rowIndices(2),
    ...rowIndices(3),
  ]);

  const STEPS = [
    {
      title: "密封果汁盒",
      caption: "呢個果汁盒封住咗。小圓點係盒入面嘅空氣分子，盒外都有空氣。",
      legend: "小圓點代表空氣分子。",
      meter: "吸之前，兩邊氣壓都高。",
      next: "下一步",
      mask: MASK_ALL,
      juice: 0,
      arrowIn: 0,
      arrowOut: 0,
      arrows: 0,
      extras: 0,
      crush: 0,
      inside: 1,
    },
    {
      title: "兩邊差不多大",
      caption: "箭嘴表示邊度推牆。綠色向外、藍色向內，兩邊差不多大，所以氣壓相同。",
      legend: "綠色箭嘴：盒內向外推。藍色箭嘴：盒外向內推。",
      meter: "兩邊氣壓相同。",
      next: "吸一下",
      mask: MASK_ALL,
      juice: 0,
      arrowIn: OUT_LEN,
      arrowOut: OUT_LEN,
      arrows: 1,
      extras: 0,
      crush: 0,
      inside: 1,
    },
    {
      title: "吸走分子",
      caption: "吸一下！果汁同空氣分子走上吸管離開紙盒。外面嘅空氣入唔到，分子就少咗。",
      legend: "綠色箭嘴：盒內向外推。藍色箭嘴：盒外向內推。",
      meter: "分子少咗，盒內氣壓開始降。",
      next: "再吸一下",
      mask: MASK_SIP1,
      juice: 1,
      arrowIn: 34,
      arrowOut: OUT_LEN,
      arrows: 1,
      extras: 0,
      crush: 0,
      inside: 0.78,
    },
    {
      title: "盒內氣壓下降",
      caption: "再吸一下，分子更少，盒內氣壓就下降。入面箭嘴變弱，盒外箭嘴仍然好有力。",
      legend: "綠色箭嘴：盒內向外推。藍色箭嘴：盒外向內推。",
      meter: "盒內低，盒外仍然高。",
      next: "下一步",
      mask: MASK_SIP2,
      juice: 2,
      arrowIn: 16,
      arrowOut: OUT_LEN,
      arrows: 1,
      extras: 0,
      crush: 0,
      inside: 0.32,
    },
    {
      title: "認識大氣壓力",
      caption: "盒外由四面八方向內推嘅力，叫做大氣壓力。大氣壓力冇變大／增加，係盒入面嘅氣壓細咗。",
      legend: "藍色箭嘴：大氣壓力，向紙盒內推。綠色箭嘴：盒內向外推。",
      meter: "盒外嘅力叫做大氣壓力。",
      next: "下一步",
      mask: MASK_SIP2,
      juice: 2,
      arrowIn: 16,
      arrowOut: OUT_LEN,
      arrows: 1,
      extras: 1,
      crush: 0,
      inside: 0.28,
    },
    {
      title: "紙盒凹入去",
      caption: "盒內氣壓低過大氣壓力，紙盒壁就被由外向內推到凹入去。唔係真空吸住個盒。",
      legend: "藍色箭嘴：大氣壓力，向紙盒內推。綠色箭嘴：盒內向外推。",
      meter: "大氣壓力向內推。",
      next: "下一步",
      mask: MASK_SIP2,
      juice: 2,
      arrowIn: 16,
      arrowOut: OUT_LEN,
      arrows: 1,
      extras: 1,
      crush: 1,
      inside: 0.28,
    },
    {
      title: "重溫一次",
      caption: "分子變少，盒內氣壓降低，盒外氣壓就把紙盒壓凹。係外面推入來，唔係真空吸住。",
      legend: "藍色箭嘴：大氣壓力，向紙盒內推。綠色箭嘴：盒內向外推。",
      meter: "壓力差把紙盒壓凹。",
      next: "再睇一次",
      mask: MASK_SIP2,
      juice: 2,
      arrowIn: 16,
      arrowOut: OUT_LEN,
      arrows: 1,
      extras: 1,
      crush: 1,
      inside: 0.28,
    },
  ];

  const JUICE_RATIO = [0.6, 0.69, 0.78];

  const view = {
    juice: 0,
    arrowIn: 0,
    arrowOut: 0,
    arrows: 0,
    extras: 0,
    crush: 0,
    inside: 1,
  };

  let current = 0;
  let runId = 0;
  let busy = false;
  const molecules = [];
  const arrowNodes = [];

  const sceneEls = {
    boxFill: $("boxFill"),
    boxRim: $("boxRim"),
    boxEdge: $("boxEdge"),
    boxClipPath: $("boxClipPath"),
    wrinkles: $("wrinkles"),
    juice: $("juice"),
    juiceShine: $("juiceShine"),
    groundShadow: $("groundShadow"),
    straw: $("straw"),
    strawStripe: $("strawStripe"),
    strawJuice: $("strawJuice"),
    orange: $("orange"),
    leader: $("leader"),
    molecules: $("molecules"),
    arrows: $("arrows"),
    outside: $("outside-air"),
  };

  function geom(crush) {
    const bow = 58 * crush;
    const dip = 28 * crush;
    const l = 198;
    const r = 502;
    const b = 438;
    const t = 116 + dip;
    return { l, r, t, b, bow, dip, cx: (l + r) / 2 };
  }

  function sideInset(f, bow) {
    const u = 1 - f;
    return 3 * u * u * f * bow + 3 * u * f * f * bow;
  }

  function boxPath(g) {
    const y1 = g.t + (g.b - g.t) * 0.32;
    const y2 = g.t + (g.b - g.t) * 0.7;
    const mid = g.cx;
    const topY = g.t + g.dip * 0.65;
    return [
      `M ${g.l} ${g.t}`,
      `C ${g.l + g.bow} ${y1}, ${g.l + g.bow} ${y2}, ${g.l} ${g.b}`,
      `L ${g.r} ${g.b}`,
      `C ${g.r - g.bow} ${y2}, ${g.r - g.bow} ${y1}, ${g.r} ${g.t}`,
      `Q ${mid} ${topY}, ${g.l} ${g.t}`,
    ].join(" ");
  }

  function strawD(g) {
    const x = g.cx + 6;
    const y = g.t + 4;
    return `M ${x} ${y} L ${x} ${y - 50} Q ${x} ${y - 76}, ${x + 32} ${y - 76} L ${x + 214} ${y - 76}`;
  }

  function juiceY(g, level) {
    const t = Math.max(0, Math.min(2, level));
    const i = Math.min(2, Math.floor(t));
    const f = t - i;
    const r0 = JUICE_RATIO[i];
    const r1 = JUICE_RATIO[Math.min(2, i + 1)];
    const ratio = i >= 2 ? r0 : r0 + (r1 - r0) * f;
    return g.t + (g.b - g.t) * ratio;
  }

  function slotsFor(g) {
    // Spread molecules across the whole headspace above the starting juice line.
    const airTop = g.t + 26;
    const airBottom = g.t + (g.b - g.t) * JUICE_RATIO[0] - 22;
    const slots = [];
    for (let r = 0; r < ROWS; r += 1) {
      const y = airTop + ((airBottom - airTop) * r) / (ROWS - 1);
      const f = (y - g.t) / (g.b - g.t);
      const inset = sideInset(f, g.bow);
      const minX = g.l + 22 + inset;
      const maxX = g.r - 22 - inset;
      for (let c = 0; c < COLS; c += 1) {
        const x = minX + ((maxX - minX) * c) / (COLS - 1);
        slots.push({ x, y });
      }
    }
    return slots;
  }

  function svgEl(name, attrs) {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, String(v)));
    return node;
  }

  function makeArrowGroup() {
    const g = svgEl("g", { class: "arrow" });
    g.appendChild(svgEl("line", { class: "halo", "stroke-linecap": "round" }));
    g.appendChild(svgEl("line", { class: "body", "stroke-linecap": "round" }));
    g.appendChild(svgEl("polygon", { class: "head", "stroke-linejoin": "round" }));
    return g;
  }

  function setArrow(group, spec) {
    const { x1, y1, x2, y2, color, w, op } = spec;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (op < 0.02 || len < 4) {
      group.setAttribute("opacity", "0");
      return;
    }
    group.setAttribute("opacity", String(op));
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;
    const head = Math.max(13, w * 2.5);
    const hw = head * 0.58;
    const bx = x2 - ux * head;
    const by = y2 - uy * head;
    const halo = group.querySelector(".halo");
    const body = group.querySelector(".body");
    const poly = group.querySelector(".head");
    [halo, body].forEach((line) => {
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", bx);
      line.setAttribute("y2", by);
    });
    halo.setAttribute("stroke", "#ffffff");
    halo.setAttribute("stroke-width", w + 8);
    body.setAttribute("stroke", color);
    body.setAttribute("stroke-width", w);
    poly.setAttribute("fill", color);
    poly.setAttribute("stroke", "#ffffff");
    poly.setAttribute("stroke-width", "2");
    poly.setAttribute(
      "points",
      `${x2},${y2} ${bx + px * hw},${by + py * hw} ${bx - px * hw},${by - py * hw}`
    );
  }

  function arrowToward(x, y, g, len) {
    const cx = g.cx;
    const cy = (g.t + g.b) / 2;
    let dx = cx - x;
    let dy = cy - y;
    const dist = Math.hypot(dx, dy) || 1;
    dx /= dist;
    dy /= dist;
    let reach = Math.min(len, dist - 36);
    const pad = 16;
    let hx = x + dx * reach;
    let hy = y + dy * reach;
    const inside = () => hx > g.l - pad && hx < g.r + pad && hy > g.t - pad && hy < g.b + pad;
    while (inside() && reach > 24) {
      reach -= 6;
      hx = x + dx * reach;
      hy = y + dy * reach;
    }
    return { x1: x, y1: y, x2: hx, y2: hy };
  }

  function levelWord(v) {
    if (v >= 0.85) return "高";
    if (v >= 0.5) return "中";
    return "低";
  }

  function placeTag(node, x, y, show, anchor) {
    node.hidden = !show;
    if (!show) return;
    node.style.left = `${(100 * x) / VB_W}%`;
    node.style.top = `${(100 * y) / VB_H}%`;
    node.style.transform = anchor === "end" ? "translate(-100%, -50%)" : "translate(-50%, -50%)";
  }

  function render() {
    const g = geom(view.crush);
    const d = boxPath(g);
    sceneEls.boxFill.setAttribute("d", d);
    sceneEls.boxRim.setAttribute("d", d);
    sceneEls.boxEdge.setAttribute("d", d);
    sceneEls.boxClipPath.setAttribute("d", d);

    const yJuice = juiceY(g, view.juice);
    sceneEls.juice.setAttribute("x", g.l - 30);
    sceneEls.juice.setAttribute("y", yJuice);
    sceneEls.juice.setAttribute("width", g.r - g.l + 60);
    sceneEls.juice.setAttribute("height", g.b - yJuice + 40);

    const insetMid = sideInset(0.72, g.bow);
    sceneEls.juiceShine.setAttribute("cx", g.cx);
    sceneEls.juiceShine.setAttribute("cy", yJuice + 4);
    sceneEls.juiceShine.setAttribute("rx", Math.max(40, (g.r - g.l) / 2 - 36 - insetMid));
    sceneEls.juiceShine.setAttribute("ry", 8);

    sceneEls.groundShadow.setAttribute("cx", g.cx);
    sceneEls.groundShadow.setAttribute("cy", g.b + 8);
    sceneEls.groundShadow.setAttribute("rx", (g.r - g.l) / 2 - g.bow * 0.2);

    const straw = strawD(g);
    sceneEls.straw.setAttribute("d", straw);
    sceneEls.strawStripe.setAttribute("d", straw);
    sceneEls.strawJuice.setAttribute("d", straw);

    sceneEls.orange.setAttribute("transform", `translate(${g.cx + 78}, ${g.b - 68})`);

    const fDent = (g.t + g.b) / 2;
    const leftDent = g.l + sideInset((fDent - g.t) / (g.b - g.t), g.bow);
    const rightDent = g.r - sideInset((fDent - g.t) / (g.b - g.t), g.bow);
    sceneEls.wrinkles.setAttribute("opacity", String(Math.max(0, view.crush - 0.15)));
    sceneEls.wrinkles.setAttribute(
      "d",
      `M ${leftDent + 14} ${fDent - 46} Q ${leftDent + 34} ${fDent}, ${leftDent + 12} ${fDent + 46}
       M ${rightDent - 14} ${fDent - 46} Q ${rightDent - 34} ${fDent}, ${rightDent - 12} ${fDent + 46}`
    );

    const slots = slotsFor(g);
    molecules.forEach((m, i) => {
      if (!m.flying) {
        m.x = slots[i].x;
        m.y = slots[i].y;
        m.opacity = m.present ? 1 : 0;
      }
      m.el.setAttribute("cx", m.x);
      m.el.setAttribute("cy", m.y);
      m.el.setAttribute("opacity", m.present || m.flying ? m.opacity : 0);
    });

    const arrowY = g.t + 86;
    const fArrow = (arrowY - g.t) / (g.b - g.t);
    const left = g.l + sideInset(fArrow, g.bow);
    const right = g.r - sideInset(fArrow, g.bow);
    const gap = 8;
    const inn = view.arrowIn;
    const out = view.arrowOut;
    const wIn = inn < 22 ? 5.5 : 8;
    const wOut = 8;
    const topX = g.l + 34;
    const topY = g.t + 1;

    const mains = [
      { x1: left - gap - out, y1: arrowY, x2: left - gap, y2: arrowY, color: COL_OUT, w: wOut, op: view.arrows },
      { x1: left + gap + inn, y1: arrowY + 30, x2: left + gap, y2: arrowY + 30, color: COL_IN, w: wIn, op: view.arrows },
      { x1: right + gap + out, y1: arrowY, x2: right + gap, y2: arrowY, color: COL_OUT, w: wOut, op: view.arrows },
      { x1: right - gap - inn, y1: arrowY + 30, x2: right - gap, y2: arrowY + 30, color: COL_IN, w: wIn, op: view.arrows },
      { x1: topX, y1: topY - gap - out, x2: topX, y2: topY - gap, color: COL_OUT, w: wOut, op: view.arrows },
      { x1: topX, y1: topY + gap + inn, x2: topX, y2: topY + gap, color: COL_IN, w: wIn, op: view.arrows },
    ];

    const extraSeeds = [
      [48, 78],
      [36, 230],
      [54, 360],
      [650, 96],
      [662, 230],
      [640, 340],
    ];
    const extras = extraSeeds.map(([x, y]) => {
      const a = arrowToward(x, y, g, OUT_LEN);
      return { ...a, color: COL_OUT, w: wOut, op: view.extras };
    });

    mains.concat(extras).forEach((spec, i) => setArrow(arrowNodes[i], spec));

    const yIn = g.b - 52;
    const fIn = (yIn - g.t) / (g.b - g.t);
    placeTag($("tag-in"), g.l + sideInset(fIn, g.bow) + 58, yIn, true);
    placeTag($("tag-out"), 74, 56, true);
    placeTag($("tag-dir-in"), left - gap - out - 30, arrowY, view.arrows > 0.45);
    // 向外 sits on the green arrow that points out of the left wall, not beside the blue inward arrows.
    placeTag($("tag-dir-out"), left + gap + inn + 26, arrowY + 30, view.arrows > 0.45);
    placeTag(
      $("tag-same"),
      left - gap - 8,
      arrowY - 70,
      view.arrows > 0.85 && Math.abs(view.arrowIn - view.arrowOut) < 6 && view.crush < 0.2
    );
    placeTag($("tag-dent"), leftDent - 18, fDent + 28, view.crush > 0.55, "end");

    const showMol = current === 0 && molecules[COLS - 1];
    if (showMol) {
      const tip = slots[COLS - 1];
      placeTag($("tag-mol"), VB_W - 18, tip.y + 6, true, "end");
      sceneEls.leader.setAttribute("opacity", "1");
      sceneEls.leader.setAttribute("x1", tip.x + 14);
      sceneEls.leader.setAttribute("y1", tip.y);
      sceneEls.leader.setAttribute("x2", 590);
      sceneEls.leader.setAttribute("y2", tip.y + 6);
    } else {
      $("tag-mol").hidden = true;
      sceneEls.leader.setAttribute("opacity", "0");
    }

    $("fill-in").style.setProperty("--level", `${Math.max(6, view.inside * 100)}%`);
    $("fill-in").classList.toggle("is-low", view.inside < 0.45);
    $("val-in").textContent = levelWord(view.inside);
    $("fill-out").style.setProperty("--level", "100%");

    document.body.dataset.step = String(current + 1);
    document.body.dataset.inside = view.inside.toFixed(2);
    document.body.dataset.crush = view.crush.toFixed(2);
    document.body.dataset.atmo = current >= 4 ? "1" : "0";
    document.body.dataset.arrows = view.arrows.toFixed(2);
    document.body.dataset.busy = busy ? "1" : "0";
  }

  function countPresent() {
    return molecules.filter((m) => m.present).length;
  }

  function updateCount() {
    const n = countPresent();
    const countEl = $("mol-count");
    if (countEl.textContent !== String(n)) {
      countEl.textContent = String(n);
      countEl.classList.remove("pop");
      void countEl.offsetWidth;
      countEl.classList.add("pop");
    }
    molecules.forEach((m, i) => {
      const dot = $("dotbank").children[i];
      if (!dot) return;
      dot.className = `mini ${m.flying ? "leaving" : m.present ? "on" : "off"}`;
    });
    document.body.dataset.molecules = String(n);
  }

  function renderLegend() {
    const el = $("legend");
    if (current === 0) {
      el.innerHTML = "小圓點代表空氣分子。";
      return;
    }
    const blue = current >= 4 ? "藍色向內推，就係大氣壓力" : "藍色向內推（盒外）";
    const same = current === 1 ? '<span class="same-note">而家氣壓相同</span>' : "";
    el.innerHTML =
      `<span class="key-item"><i class="swatch in"></i>綠色向外推（盒內）</span>` +
      `<span class="key-item"><i class="swatch out"></i>${blue}</span>` +
      same;
  }

  function updateChrome() {
    const step = STEPS[current];
    $("step-badge").textContent = `第 ${current + 1} 步 / 共 7 步`;
    $("sr-step").textContent = `第 ${current + 1} 步，共 7 步。`;
    $("caption-title").textContent = step.title;
    $("caption-body").textContent = step.caption;
    renderLegend();
    $("meter-note").textContent = step.meter;
    $("recap").hidden = current !== LAST;
    const banner = $("atmo-banner");
    const showAtmo = current >= 4;
    if (showAtmo && banner.hidden) {
      banner.hidden = false;
      banner.classList.remove("pop");
      void banner.offsetWidth;
      banner.classList.add("pop");
    } else if (!showAtmo) {
      banner.hidden = true;
    }
    const outName = $("name-out");
    const nextName = showAtmo ? "大氣壓力" : "盒外氣壓";
    if (outName.textContent !== nextName) {
      outName.textContent = nextName;
      outName.classList.remove("pop");
      void outName.offsetWidth;
      outName.classList.add("pop");
    }
    $("next").textContent = step.next;
    $("next").setAttribute("aria-label", step.next);
    $("back").disabled = busy || current === 0;
    $("next").disabled = busy;
    document.querySelectorAll("#dots span").forEach((dot, i) => {
      dot.className = i === current ? "now" : i < current ? "done" : "";
    });
  }

  function setBusy(value) {
    busy = value;
    document.body.dataset.busy = value ? "1" : "0";
    $("svg-wrap").setAttribute("aria-busy", value ? "true" : "false");
    $("back").disabled = value || current === 0;
    $("next").disabled = value;
  }

  function tween(ms, update, token) {
    if (reduced || ms <= 0) {
      update(1);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const t0 = performance.now();
      function frame(now) {
        if (token !== runId) {
          resolve();
          return;
        }
        const p = Math.min(1, (now - t0) / ms);
        const e = 1 - (1 - p) ** 3;
        update(e);
        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  function sleep(ms, token) {
    return new Promise((resolve) => {
      setTimeout(resolve, reduced ? 0 : ms);
    }).then(() => token === runId);
  }

  function tweenValues(keys, target, ms, token) {
    const start = {};
    keys.forEach((k) => {
      start[k] = view[k];
    });
    return tween(ms, (e) => {
      keys.forEach((k) => {
        view[k] = start[k] + (target[k] - start[k]) * e;
      });
      render();
    }, token);
  }

  function along(points, e) {
    const lengths = [];
    let total = 0;
    for (let i = 1; i < points.length; i += 1) {
      const d = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      lengths.push(d);
      total += d;
    }
    let dist = Math.max(0, Math.min(1, e)) * total;
    for (let i = 1; i < points.length; i += 1) {
      const seg = lengths[i - 1];
      if (dist <= seg || i === points.length - 1) {
        const t = seg ? Math.min(1, dist / seg) : 0;
        return {
          x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
          y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
        };
      }
      dist -= seg;
    }
    return points[points.length - 1];
  }

  function floatDelta(n) {
    if (reduced) return;
    const path = sceneEls.straw;
    const len = path.getTotalLength();
    const tip = path.getPointAtLength(Math.max(0, len - 8));
    const el = document.createElement("div");
    el.className = "floater";
    el.textContent = `走咗 ${n} 個`;
    el.style.left = `${(100 * tip.x) / VB_W}%`;
    el.style.top = `${(100 * tip.y) / VB_H}%`;
    $("svg-wrap").appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  async function animateStraw(token) {
    const juice = sceneEls.strawJuice;
    const len = Math.max(1, juice.getTotalLength());
    const slug = Math.min(40, len * 0.2);
    juice.style.strokeDasharray = `${slug} ${len}`;
    juice.style.opacity = "1";
    await tween(760, (e) => {
      juice.style.strokeDashoffset = String(-e * (len + slug));
    }, token);
    juice.style.opacity = "0";
  }

  async function flyOne(m, pts, delay, token) {
    const alive = await sleep(delay, token);
    if (!alive) return;
    m.flying = true;
    updateCount();
    const poly = [{ x: m.x, y: m.y }, ...pts];
    await tween(740, (e) => {
      const pos = along(poly, e);
      m.x = pos.x;
      m.y = pos.y;
      m.opacity = e < 0.78 ? 1 : 1 - (e - 0.78) / 0.22;
      m.el.setAttribute("cx", m.x);
      m.el.setAttribute("cy", m.y);
      m.el.setAttribute("opacity", m.opacity);
    }, token);
    if (token !== runId) return;
    m.present = false;
    m.flying = false;
    m.opacity = 0;
    m.el.setAttribute("opacity", "0");
    updateCount();
  }

  async function flyOut(list, token) {
    const path = sceneEls.straw;
    const len = path.getTotalLength();
    if (len < 10) {
      list.forEach((m) => {
        m.present = false;
        m.flying = false;
        m.opacity = 0;
      });
      updateCount();
      return;
    }
    const pts = [0.04, 0.32, 0.66, 1].map((t) => {
      const p = path.getPointAtLength(len * t);
      return { x: p.x, y: p.y };
    });
    floatDelta(list.length);
    const juiceAnim = animateStraw(token);
    await Promise.all(list.map((m, idx) => flyOne(m, pts, idx * 55, token)));
    await juiceAnim;
  }

  function applyInstant(target) {
    Object.keys(view).forEach((k) => {
      if (k in target) view[k] = target[k];
    });
    molecules.forEach((m, i) => {
      m.present = !!target.mask[i];
      m.flying = false;
      m.opacity = m.present ? 1 : 0;
    });
    render();
    updateCount();
  }

  async function animateTo(target, token) {
    const leaving = molecules.filter((m, i) => m.present && !target.mask[i]);
    if (leaving.length) {
      await Promise.all([
        tweenValues(["juice"], target, 900, token),
        flyOut(leaving, token),
      ]);
      if (token !== runId) return;
    }
    const keys = ["arrowIn", "arrowOut", "arrows", "extras", "crush", "inside", "juice"];
    const need = keys.some((k) => Math.abs(view[k] - target[k]) > 0.01);
    if (need) {
      if (target.crush > view.crush + 0.4 && !reduced) {
        $("svg-wrap").classList.add("shake");
        setTimeout(() => $("svg-wrap").classList.remove("shake"), 500);
      }
      const ms = target.crush > view.crush + 0.4 ? 1100 : 780;
      await tweenValues(keys, target, ms, token);
      if (token !== runId) return;
    }
    applyInstant(target);
  }

  async function go(step, animate) {
    const token = ++runId;
    current = Math.max(0, Math.min(LAST, step));
    const target = STEPS[current];
    setBusy(true);
    updateChrome();
    if (!animate || reduced) applyInstant(target);
    else await animateTo(target, token);
    if (token !== runId) return;
    setBusy(false);
    updateChrome();
  }

  function bootMolecules() {
    for (let i = 0; i < MOL_COUNT; i += 1) {
      const node = svgEl("circle", {
        r: 7.2,
        fill: "#f7fcff",
        stroke: "#1d6ea5",
        "stroke-width": 2.6,
        opacity: 1,
      });
      sceneEls.molecules.appendChild(node);
      molecules.push({ i, x: 0, y: 0, opacity: 1, present: true, flying: false, el: node });
    }
    const bank = $("dotbank");
    for (let i = 0; i < MOL_COUNT; i += 1) {
      const dot = document.createElement("span");
      dot.className = "mini on";
      bank.appendChild(dot);
    }
  }

  function bootArrows() {
    for (let i = 0; i < 12; i += 1) {
      const node = makeArrowGroup();
      sceneEls.arrows.appendChild(node);
      arrowNodes.push(node);
    }
  }

  function bootOutside() {
    const spots = [
      [48, 188],
      [96, 246],
      [34, 310],
      [132, 108],
      [628, 188],
      [668, 260],
      [604, 330],
      [652, 140],
    ];
    spots.forEach(([x, y], i) => {
      const node = svgEl("circle", {
        cx: x,
        cy: y,
        r: i % 2 ? 5 : 4,
        fill: "#7eb4d0",
        opacity: 0.75,
        class: "drift",
      });
      node.style.animationDelay = `${i * 0.35}s`;
      sceneEls.outside.appendChild(node);
    });
  }

  function bootDots() {
    const wrap = $("dots");
    for (let i = 0; i < 7; i += 1) {
      wrap.appendChild(document.createElement("span"));
    }
  }

  function bob(now) {
    if (!busy && !reduced) {
      molecules.forEach((m) => {
        if (!m.present || m.flying) return;
        const dy = Math.sin(now / 420 + m.i) * 3.2;
        m.el.setAttribute("cy", m.y + dy);
      });
    }
    requestAnimationFrame(bob);
  }

  $("next").addEventListener("click", () => {
    if (busy) return;
    if (current === LAST) go(0, false);
    else go(current + 1, true);
  });
  $("back").addEventListener("click", () => {
    if (busy || current === 0) return;
    go(current - 1, false);
  });
  $("reset").addEventListener("click", () => {
    go(0, false);
  });
  document.addEventListener("keydown", (event) => {
    const tag = event.target && event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      $("next").click();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      $("back").click();
    } else if (event.key === "Home") {
      event.preventDefault();
      $("reset").click();
    }
  });

  bootMolecules();
  bootArrows();
  bootOutside();
  bootDots();

  const params = new URLSearchParams(location.search);
  const queryStep = parseInt(params.get("step") || "1", 10);
  const start = queryStep >= 1 && queryStep <= 7 ? queryStep - 1 : 0;
  go(start, false);
  requestAnimationFrame(bob);

  window.__lesson = {
    go,
    get step() {
      return current + 1;
    },
    get busy() {
      return busy;
    },
  };
})();
