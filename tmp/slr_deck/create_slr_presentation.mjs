import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const FINAL_PPTX =
  "C:\\Users\\forha\\OneDrive\\Desktop\\Orbit\\SLR_mHealth_Tea_Garden_Presentation.pptx";
const TMP_DIR = "C:\\Users\\forha\\OneDrive\\Desktop\\Orbit\\tmp\\slr_deck";

const W = 1280;
const H = 720;
const C = {
  ink: "#000000",
  muted: "#5D6470",
  panel: "#F2F2F2",
  rule: "#B8BCC4",
  accent: "#3D8DFF",
  accentLight: "#D0EDFA",
  paleBlue: "#EAF5FB",
  danger: "#D85C5C",
  green: "#2B8A67",
  white: "#FFFFFF",
};

function textBox(slide, text, x, y, w, h, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    fontSize: style.fontSize ?? 22,
    typeface: "Helvetica Neue",
    color: style.color ?? C.ink,
    bold: style.bold ?? false,
    alignment: style.alignment ?? "left",
    verticalAlignment: style.verticalAlignment ?? "top",
    autoFit: style.autoFit ?? "shrinkText",
    wrap: "square",
  };
  return shape;
}

function line(slide, x, y, w, color = C.rule, width = 1) {
  return slide.shapes.add({
    geometry: "line",
    position: { left: x, top: y, width: w, height: 0 },
    fill: "none",
    line: { style: "solid", fill: color, width },
  });
}

function panel(slide, x, y, w, h, fill = C.panel, stroke = "none") {
  return slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: stroke, width: stroke === "none" ? 0 : 1 },
  });
}

function addSlideTitle(slide, title, no, subtitle = "") {
  textBox(slide, title, 41, 36, 1045, 98, { fontSize: 39, bold: false });
  if (subtitle) {
    textBox(slide, subtitle, 41, 122, 920, 46, {
      fontSize: 21,
      color: C.muted,
    });
  }
  textBox(slide, String(no).padStart(2, "0"), 1184, 659, 55, 25, {
    fontSize: 13,
    alignment: "right",
    verticalAlignment: "bottom",
  });
}

function addNotes(slide, presenter, sources) {
  slide.speakerNotes.textFrame.setText(
    `${presenter}\n\n[Sources]\n${sources.join("\n")}`,
  );
  slide.speakerNotes.setVisible(true);
}

function statBlock(slide, value, label, x, y, w = 250, accent = C.accent) {
  panel(slide, x, y, w, 154, C.panel);
  textBox(slide, value, x + 24, y + 26, w - 48, 52, {
    fontSize: 40,
    bold: true,
    color: accent,
  });
  textBox(slide, label, x + 24, y + 92, w - 48, 45, {
    fontSize: 18,
    color: C.ink,
  });
}

function card(slide, heading, body, x, y, w, h, accent = C.accent) {
  panel(slide, x, y, w, h, C.panel);
  panel(slide, x, y, 7, h, accent, accent);
  textBox(slide, heading, x + 26, y + 24, w - 52, 40, {
    fontSize: 26,
    bold: true,
  });
  textBox(slide, body, x + 26, y + 77, w - 52, h - 96, {
    fontSize: 19,
    color: C.ink,
  });
}

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(TMP_DIR, { recursive: true });
  const deck = Presentation.create({ slideSize: { width: W, height: H } });

  // 1. Title
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    textBox(slide, "SLR", 41, 41, 180, 64, { fontSize: 32 });
    line(slide, 41, 146, 1197, C.rule, 1);
    textBox(
      slide,
      "CHW-Assisted mHealth for Sylhet Tea-Garden Families",
      41,
      206,
      1035,
      185,
      { fontSize: 54, bold: false, verticalAlignment: "bottom" },
    );
    textBox(
      slide,
      "Evidence review for maternal and child health awareness",
      41,
      505,
      780,
      55,
      { fontSize: 28, color: C.muted },
    );
    textBox(slide, "Md. Forhad Hasan Jewel and Muhammad Milon", 41, 586, 820, 38, {
      fontSize: 22,
      color: C.ink,
    });
    addNotes(slide, "Open by framing the paper as a review of what the evidence supports, what it does not yet prove, and why that distinction matters for Sylhet tea-garden families.", [
      "SLR.pdf, page 1: title and abstract.",
    ]);
  }

  // 2. Context and stakes
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addSlideTitle(slide, "The problem is not only access; it is fit", 2);
    textBox(
      slide,
      "Tea-garden families face overlapping barriers that a generic health app would miss.",
      41,
      150,
      700,
      70,
      { fontSize: 27, color: C.muted },
    );
    statBlock(slide, "360k", "workers and family members live on Sylhet tea plantations", 41, 300);
    statBlock(slide, "2/3", "women and girls make up much of the tea-garden workforce", 350, 300, 250, C.green);
    statBlock(slide, "187", "BDT daily wage reported in the review context", 659, 300, 250, C.danger);
    statBlock(slide, "180m+", "active mobile subscriptions create a possible delivery channel", 968, 300, 250);
    line(slide, 41, 584, 1197, C.rule, 1);
    textBox(slide, "Design implication: awareness support must work around low literacy, shared devices, language diversity, and weak infrastructure.", 41, 610, 1050, 48, {
      fontSize: 22,
      color: C.ink,
    });
    addNotes(slide, "Use this slide to set up the design challenge. The review argues that national progress hides harsher local conditions in Sylhet tea estates, while phone access makes mHealth plausible if the interface is shaped for the community.", [
      "SLR.pdf, pages 1-3: introduction, tea-garden context, and mobile subscription context.",
      "SLR.pdf, page 2: low literacy, language, clinic access, and wage context.",
    ]);
  }

  // 3. Review method
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addSlideTitle(slide, "The review narrowed 158 records to 45 papers", 3, "Modified PRISMA process, searches from November 2024 to January 2025.");
    const xs = [72, 375, 678, 981];
    const stages = [
      ["158", "initial records", "five database searches"],
      ["82", "after title screening", "off-topic papers removed"],
      ["45", "after abstract review", "abstracts and conclusions assessed"],
      ["45", "full-text included", "quality check and thematic analysis"],
    ];
    line(slide, 105, 395, 1040, C.rule, 2);
    stages.forEach((s, i) => {
      panel(slide, xs[i], 230, 210, 210, i === 3 ? C.paleBlue : C.panel, i === 3 ? C.accent : "none");
      textBox(slide, s[0], xs[i] + 28, 262, 154, 55, {
        fontSize: 45,
        bold: true,
        color: i === 3 ? C.accent : C.ink,
        alignment: "center",
      });
      textBox(slide, s[1], xs[i] + 22, 331, 166, 45, {
        fontSize: 21,
        bold: true,
        alignment: "center",
      });
      textBox(slide, s[2], xs[i] + 22, 385, 166, 42, {
        fontSize: 16,
        color: C.muted,
        alignment: "center",
      });
    });
    textBox(slide, "Sources searched: Google Scholar, IEEE Xplore, ACM Digital Library, PubMed/PMC, and ScienceDirect.", 72, 540, 1040, 42, {
      fontSize: 22,
      color: C.ink,
    });
    addNotes(slide, "Explain that the paper is a systematic review rather than a field trial. The funnel makes the screening process visible without asking the audience to read the full method section.", [
      "SLR.pdf, pages 5-7: research questions, search strings, databases, inclusion criteria, and screening table.",
    ]);
  }

  // 4. Evidence that interventions can move outcomes
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addSlideTitle(slide, "The strongest evidence is for reminders and CHW follow-up", 4);
    slide.charts.add("bar", {
      position: { left: 56, top: 145, width: 590, height: 430 },
      categories: ["ANC attendance", "Vaccination odds", "BD vaccination uptake", "CHW visit coverage"],
      series: [
        { name: "Evidence signal", values: [30, 2.15, 3.6, 90], fill: C.accent },
      ],
      hasLegend: false,
      barOptions: { direction: "bar", grouping: "clustered", gapWidth: 60 },
      xAxis: {
        visible: true,
        min: 0,
        max: 100,
        majorUnit: 25,
        majorGridlines: { style: "solid", fill: "#EDEDED", width: 1 },
        textStyle: { fontSize: 11, fill: C.muted },
      },
      yAxis: {
        textStyle: { fontSize: 12, fill: C.ink },
        line: { style: "solid", fill: C.rule, width: 1 },
      },
      dataLabels: { showValue: true, position: "outEnd", textStyle: { fontSize: 12, fill: C.ink, bold: true } },
      chartFill: C.white,
      chartLine: { style: "solid", fill: C.white, width: 0 },
      plotAreaFill: { type: "none" },
    });
    card(slide, "Mobile reminders", "Raised ANC attendance in several rural trials and improved vaccination timing.", 704, 154, 475, 120);
    card(slide, "CHW-supported delivery", "Local health workers make messages credible, understandable, and actionable.", 704, 305, 475, 120, C.green);
    card(slide, "Low-literacy HCI", "Pictures and voice outperform text-heavy interfaces for first-time or non-literate users.", 704, 456, 475, 120, C.danger);
    textBox(slide, "Note: chart values use different units; it visualizes relative evidence strength, not one pooled effect size.", 56, 610, 720, 32, {
      fontSize: 16,
      color: C.muted,
    });
    addNotes(slide, "Be explicit that the numbers are not a single metric: ANC is a percent increase range summarized at 30 percent, vaccination odds are OR 2.15, Bangladesh vaccination uptake is 3.6x, and CHW coverage is above 90 percent. The point is that multiple evidence streams point in the same practical direction.", [
      "SLR.pdf, pages 4 and 8: ANC, vaccination, CHW effectiveness, and HCI findings.",
      "SLR.pdf, page 11: limitation that heterogeneous studies were not pooled into a formal meta-analysis.",
    ]);
  }

  // 5. CHW as bridge
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addSlideTitle(slide, "CHWs are the delivery layer that makes mHealth usable", 5);
    const x = 72;
    const y = 185;
    card(slide, "Trust", "Mothers are more likely to act when advice comes through a known local worker.", x, y, 330, 280);
    card(slide, "Translation", "CHWs can explain content in everyday speech, not formal health vocabulary.", x + 405, y, 330, 280, C.green);
    card(slide, "Follow-up", "Dashboards and checklists help workers track visits, risk signs, and overdue care.", x + 810, y, 330, 280, C.accent);
    line(slide, 72, 525, 1136, C.rule, 1);
    textBox(slide, "Risk to watch: adding app tasks without supervision, recognition, or compensation can weaken CHW motivation over time.", 72, 552, 980, 52, {
      fontSize: 24,
      color: C.ink,
    });
    addNotes(slide, "Present the CHW not as an accessory, but as the human bridge between evidence, technology, language, and household decision-making. Then note the workload caveat, because adoption depends on CHWs too.", [
      "SLR.pdf, pages 7-8: CHWs as linchpin and visit coverage above 90 percent in the Bangladesh tablet-supported trial.",
      "SLR.pdf, page 8: concern about CHW motivation and the need for supportive supervision.",
    ]);
  }

  // 6. HCI requirements
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addSlideTitle(slide, "For low-literacy users, interface choices become health choices", 6);
    textBox(slide, "The review treats these as minimum requirements, not optional enhancements.", 41, 134, 850, 45, {
      fontSize: 24,
      color: C.muted,
    });
    const items = [
      ["Pictorial checklists", "Symptoms and tasks must be recognizable without reading."],
      ["Voice narration", "Audio should explain screens in Bangla, Sylheti, or Chattisheuli."],
      ["Flat navigation", "Fewer taps reduces confusion for first-time smartphone users."],
      ["Offline operation", "Core guidance should work when the network fails."],
      ["Shared-phone privacy", "Reminders must account for who actually holds the device."],
    ];
    items.forEach((item, i) => {
      const yy = 205 + i * 77;
      panel(slide, 72, yy, 48, 48, i % 2 === 0 ? C.accent : C.green, "none");
      textBox(slide, String(i + 1), 72, yy + 6, 48, 36, {
        fontSize: 24,
        bold: true,
        color: C.white,
        alignment: "center",
      });
      textBox(slide, item[0], 146, yy - 2, 410, 36, { fontSize: 25, bold: true });
      textBox(slide, item[1], 146, yy + 35, 840, 34, { fontSize: 20, color: C.muted });
    });
    addNotes(slide, "Use this slide to shift from outcomes to design. The paper argues that text-first apps are not neutral; in this setting, they actively exclude the people the system is supposed to help.", [
      "SLR.pdf, pages 3 and 8: HCI evidence on graphics, voice, flat menus, local language, and low-literacy use.",
      "SLR.pdf, page 12: need to map device ownership, handset types, shared phones, and network reliability.",
    ]);
  }

  // 7. Proposed architecture
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addSlideTitle(slide, "The proposed tool pairs mother-facing guidance with CHW control", 7);
    line(slide, 110, 345, 1040, C.rule, 2);
    const nodes = [
      ["Mother", "audio + pictorial guidance", 70, C.green],
      ["CHW app", "visit checklist + danger signs", 310, C.accent],
      ["Tracker", "ANC, PNC, vaccines", 550, C.accent],
      ["Offline sync", "works without live signal", 790, C.green],
      ["Dashboard", "overdue visits + referrals", 1030, C.danger],
    ];
    nodes.forEach(([h, b, x, color]) => {
      panel(slide, x, 218, 180, 245, C.panel);
      panel(slide, x, 218, 180, 10, color, color);
      textBox(slide, h, x + 18, 257, 144, 38, { fontSize: 26, bold: true, alignment: "center" });
      textBox(slide, b, x + 18, 320, 144, 72, { fontSize: 18, color: C.muted, alignment: "center" });
    });
    textBox(slide, "Feature map: pictorial checklists, pre-loaded audio, regional language support, visit tracking, vaccination reminders, referral alerts.", 91, 535, 1045, 58, {
      fontSize: 24,
      color: C.ink,
      alignment: "center",
    });
    addNotes(slide, "Make clear that this is a feature-level architecture synthesized from the literature, not a validated product. The review specifically says field testing and participatory co-design must come before deployment.", [
      "SLR.pdf, pages 9-10: proposed feature map and feature-rationale table.",
      "SLR.pdf, pages 12-13: conclusion that the design is ready for scrutiny and controlled testing, not rollout.",
    ]);
  }

  // 8. Evidence gap
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addSlideTitle(slide, "The main finding is also the main gap", 8);
    textBox(slide, "No peer-reviewed study in the review tested this exact CHW-plus-mHealth model inside a Sylhet tea garden.", 82, 180, 1020, 135, {
      fontSize: 42,
      bold: true,
      color: C.ink,
    });
    const gaps = [
      ["Setting transfer", "Rural villages, urban slums, and East African farming contexts are useful but not identical."],
      ["Language uncertainty", "Chattisheuli and tribal languages need direct interface testing."],
      ["Study design", "Evidence ranges from RCTs to small usability studies, so pooled precision would mislead."],
    ];
    gaps.forEach((g, i) => {
      card(slide, g[0], g[1], 72 + i * 385, 392, 330, 145, i === 1 ? C.green : C.accent);
    });
    addNotes(slide, "This is the caution slide. The literature supports the direction, but the review repeatedly warns that tea gardens have distinctive economic, linguistic, and institutional conditions.", [
      "SLR.pdf, pages 8-9: absence of peer-reviewed mHealth trials inside Bangladeshi tea gardens.",
      "SLR.pdf, page 11: review limitations, adjacent-context inference, heterogeneous designs, and language issues.",
    ]);
  }

  // 9. Close
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    textBox(slide, "Cautious yes", 41, 41, 360, 64, { fontSize: 32 });
    textBox(slide, "The evidence supports co-design and field testing, not immediate deployment.", 41, 205, 1010, 150, {
      fontSize: 54,
      bold: false,
      verticalAlignment: "bottom",
    });
    const steps = [
      ["1", "Co-design with tea-garden mothers and CHWs"],
      ["2", "Map phones, sharing, network reliability, and language use"],
      ["3", "Run a cluster or stepped-wedge field trial"],
      ["4", "Plan the handoff before the pilot ends"],
    ];
    steps.forEach((s, i) => {
      const yy = 440 + i * 43;
      textBox(slide, s[0], 44, yy, 34, 30, { fontSize: 21, bold: true, color: C.accent });
      textBox(slide, s[1], 92, yy, 850, 32, { fontSize: 22, color: C.ink });
    });
    addNotes(slide, "Close by resolving the opening question. The review's answer is that CHW-backed mHealth is promising, especially for reminders, awareness, and follow-up, but it must be tested inside the actual community before anyone treats it as a solution.", [
      "SLR.pdf, pages 11-13: next research directions and conclusion.",
    ]);
  }

  for (const [index, slide] of deck.slides.items.entries()) {
    const png = await deck.export({ slide, format: "png", scale: 1 });
    await writeBlob(path.join(TMP_DIR, `slide-${String(index + 1).padStart(2, "0")}.png`), png);
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(TMP_DIR, `slide-${String(index + 1).padStart(2, "0")}.layout.json`), await layout.text(), "utf8");
  }

  const montage = await deck.export({ format: "webp", montage: true, scale: 1 });
  await writeBlob(path.join(TMP_DIR, "slr_deck_montage.webp"), montage);

  const snapshot = await deck.inspect({ kind: "slide,textbox,shape,chart,table,notes", maxChars: 16000 });
  await fs.writeFile(path.join(TMP_DIR, "deck-inspect.ndjson"), snapshot.ndjson, "utf8");

  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(FINAL_PPTX);
  console.log(FINAL_PPTX);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
