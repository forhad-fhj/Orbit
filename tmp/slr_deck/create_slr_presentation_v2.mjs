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
  muted: "#596270",
  lightMuted: "#7A8492",
  panel: "#F1F2F4",
  panel2: "#EAF5FB",
  rule: "#B8BCC4",
  accent: "#3D8DFF",
  accentSoft: "#D0EDFA",
  green: "#2C8B68",
  red: "#D85C5C",
  white: "#FFFFFF",
};

function addText(slide, value, x, y, w, h, style = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = value;
  box.text.style = {
    fontSize: style.fontSize ?? 20,
    typeface: "Helvetica Neue",
    color: style.color ?? C.ink,
    bold: style.bold ?? false,
    alignment: style.alignment ?? "left",
    verticalAlignment: style.verticalAlignment ?? "top",
    autoFit: style.autoFit ?? "shrinkText",
    wrap: "square",
  };
  return box;
}

function addPanel(slide, x, y, w, h, fill = C.panel, stroke = "none") {
  return slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: stroke, width: stroke === "none" ? 0 : 1 },
  });
}

function addLine(slide, x, y, w, color = C.rule, width = 1) {
  return slide.shapes.add({
    geometry: "line",
    position: { left: x, top: y, width: w, height: 0 },
    fill: "none",
    line: { style: "solid", fill: color, width },
  });
}

function addTitle(slide, title, no, subtitle = "") {
  addText(slide, title, 41, 34, 1138, 86, { fontSize: 39, bold: false });
  if (subtitle) {
    addText(slide, subtitle, 41, 118, 960, 44, {
      fontSize: 20,
      color: C.muted,
    });
  }
  addText(slide, String(no).padStart(2, "0"), 1184, 659, 55, 25, {
    fontSize: 13,
    alignment: "right",
    verticalAlignment: "bottom",
  });
}

function addNotes(slide, talkTrack, sources) {
  slide.speakerNotes.textFrame.setText(
    `${talkTrack}\n\n[Sources]\n${sources.join("\n")}`,
  );
  slide.speakerNotes.setVisible(true);
}

function addSection(slide, label) {
  addText(slide, label.toUpperCase(), 41, 145, 360, 26, {
    fontSize: 13,
    bold: true,
    color: C.accent,
  });
}

function bulletList(slide, items, x, y, w, options = {}) {
  const gap = options.gap ?? 58;
  const dot = options.dot ?? C.accent;
  items.forEach((item, i) => {
    const yy = y + i * gap;
    slide.shapes.add({
      geometry: "ellipse",
      position: { left: x, top: yy + 9, width: 10, height: 10 },
      fill: dot,
      line: { style: "solid", fill: dot, width: 0 },
    });
    addText(slide, item, x + 28, yy, w - 28, options.height ?? 42, {
      fontSize: options.fontSize ?? 20,
      color: options.color ?? C.ink,
    });
  });
}

function evidenceCard(slide, label, claim, detail, x, y, w, h, color = C.accent) {
  addPanel(slide, x, y, w, h, C.panel);
  addPanel(slide, x, y, 8, h, color, color);
  addText(slide, label, x + 26, y + 22, w - 52, 34, {
    fontSize: 24,
    bold: true,
  });
  addText(slide, claim, x + 26, y + 66, w - 52, 56, {
    fontSize: 19,
    color: C.ink,
  });
  addText(slide, detail, x + 26, y + h - 54, w - 52, 32, {
    fontSize: 15,
    color: C.muted,
  });
}

function metric(slide, value, label, x, y, w, color = C.accent) {
  addPanel(slide, x, y, w, 148, C.panel);
  addText(slide, value, x + 22, y + 24, w - 44, 48, {
    fontSize: 39,
    bold: true,
    color,
    alignment: "center",
  });
  addText(slide, label, x + 22, y + 88, w - 44, 42, {
    fontSize: 16,
    color: C.ink,
    alignment: "center",
  });
}

function twoColText(slide, leftTitle, leftItems, rightTitle, rightItems) {
  addText(slide, leftTitle, 72, 184, 500, 36, { fontSize: 26, bold: true });
  bulletList(slide, leftItems, 75, 238, 500, { gap: 70, height: 56, fontSize: 19 });
  addText(slide, rightTitle, 690, 184, 500, 36, { fontSize: 26, bold: true });
  bulletList(slide, rightItems, 693, 238, 500, {
    gap: 70,
    height: 56,
    fontSize: 19,
    dot: C.green,
  });
}

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(TMP_DIR, { recursive: true });
  await fs.writeFile(
    path.join(TMP_DIR, "source-notes.txt"),
    [
      "Deck source: C:/Users/forha/Downloads/SLR.pdf",
      "Topic: CHW-assisted mHealth for Sylhet tea-garden maternal and child health awareness.",
      "Deck version: fuller 14-slide presentation for a 10-12 minute talk.",
    ].join("\n"),
    "utf8",
  );

  const deck = Presentation.create({ slideSize: { width: W, height: H } });

  // 1. Title
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addText(slide, "SYSTEMATIC LITERATURE REVIEW", 41, 42, 560, 32, {
      fontSize: 17,
      bold: true,
      color: C.accent,
    });
    addLine(slide, 41, 104, 1197);
    addText(
      slide,
      "CHW-Assisted mHealth for Sylhet Tea-Garden Families",
      41,
      204,
      1040,
      170,
      { fontSize: 54, verticalAlignment: "bottom" },
    );
    addText(
      slide,
      "Strengthening maternal and child health awareness through evidence-based, low-literacy design",
      41,
      492,
      850,
      64,
      { fontSize: 27, color: C.muted },
    );
    addText(slide, "Md. Forhad Hasan Jewel and Muhammad Milon", 41, 604, 850, 34, {
      fontSize: 21,
    });
    addNotes(slide, "Start with the review question: whether a CHW-assisted mHealth app can realistically improve maternal and child health awareness among tea-garden families in Sylhet. Position the deck as evidence synthesis plus design implications.", [
      "SLR.pdf, page 1: title and abstract.",
    ]);
  }

  // 2. The setting
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addTitle(slide, "Sylhet tea gardens need a solution designed for their reality", 2);
    addSection(slide, "Context");
    metric(slide, "360k", "workers and family members on Sylhet tea plantations", 60, 240, 246);
    metric(slide, "2/3", "women and girls form a major share of the workforce", 355, 240, 246, C.green);
    metric(slide, "BDT 187", "daily wage leaves little margin for maternal nutrition", 650, 240, 246, C.red);
    metric(slide, "180m+", "mobile subscriptions make phone-based support plausible", 945, 240, 246);
    addText(
      slide,
      "The design challenge is not only sending messages. It is making guidance understandable, trusted, reachable, and usable under plantation conditions.",
      72,
      540,
      1065,
      68,
      { fontSize: 25, color: C.ink, alignment: "center" },
    );
    addNotes(slide, "Explain why the paper focuses on tea gardens rather than Bangladesh as a whole. National averages hide a specific mix of poverty, language, low literacy, hard-to-reach clinics, and employer-controlled plantation life.", [
      "SLR.pdf, pages 1-3: introduction and tea-garden health context.",
      "SLR.pdf, page 2: mobile subscription context and access barriers.",
    ]);
  }

  // 3. Problem structure
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addTitle(slide, "The health burden is created by overlapping barriers", 3);
    addSection(slide, "Problem");
    twoColText(
      slide,
      "Health and service barriers",
      [
        "Rare antenatal and postnatal check-ups delay early risk detection.",
        "Vaccination schedules slip when dates, travel, and clinic access do not line up.",
        "Pregnancy diet often stays unchanged despite anemia and undernutrition risks.",
      ],
      "Social and technical barriers",
      [
        "Functional literacy is limited, so text-heavy interfaces exclude many users.",
        "Families may share one phone, often controlled by someone other than the mother.",
        "Rain, weak signal, and low-end devices make always-online apps fragile.",
      ],
    );
    addNotes(slide, "This slide deepens the context from the previous one. Emphasize that the intervention has to work across health, social, language, and infrastructure barriers together.", [
      "SLR.pdf, pages 2-4: tea-garden health burdens, low literacy, device sharing, and connectivity constraints.",
    ]);
  }

  // 4. Review objective and questions
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addTitle(slide, "The review asks what can be trusted before building", 4);
    addSection(slide, "Research focus");
    addText(slide, "The paper does not claim a finished product. It asks what existing evidence can support, and where field research is still required.", 72, 178, 1050, 58, {
      fontSize: 25,
      color: C.muted,
    });
    evidenceCard(slide, "RQ1", "What usability barriers and socio-technical friction points would mothers and CHWs face?", "Focus: literacy, language, shared phones, infrastructure, trust.", 72, 290, 330, 190);
    evidenceCard(slide, "RQ2", "How could CHW-mediated audio and mobile guidance improve awareness and timely care-seeking?", "Focus: health knowledge, retention, reminders, referral behavior.", 475, 290, 330, 190, C.green);
    evidenceCard(slide, "RQ3", "Which HCI features matter most for usability and sustained adoption?", "Focus: pictorial checklists, audio, offline use, CHW dashboards.", 878, 290, 330, 190, C.red);
    addNotes(slide, "Use the three research questions to show that the review is not only medical. It connects maternal health outcomes, CHW workflow, and human-computer interaction.", [
      "SLR.pdf, page 5: questions guiding the review.",
    ]);
  }

  // 5. Search strategy
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addTitle(slide, "The search combined health delivery, CHWs, HCI, and tea gardens", 5);
    addSection(slide, "Method");
    const rows = [
      ["S1", "mHealth app + community health worker + maternal health + Bangladesh"],
      ["S2", "mHealth + child health + low-resource + Bangladesh"],
      ["S3", "HCI + mHealth + low-literacy + maternal"],
      ["S4", "tea garden workers + health + maternal + Bangladesh"],
      ["S5", "mobile health app + vaccination + reminders + rural"],
    ];
    rows.forEach((row, i) => {
      const y = 193 + i * 67;
      addPanel(slide, 72, y, 96, 46, i % 2 ? C.panel : C.panel2);
      addText(slide, row[0], 72, y + 9, 96, 28, { fontSize: 20, bold: true, alignment: "center" });
      addText(slide, row[1], 195, y + 8, 900, 32, { fontSize: 21, color: C.ink });
    });
    addText(slide, "Databases: Google Scholar, IEEE Xplore, ACM Digital Library, PubMed/PMC, and ScienceDirect.", 72, 563, 1020, 38, {
      fontSize: 22,
      color: C.muted,
    });
    addNotes(slide, "Explain that the search was deliberately interdisciplinary. A maternal health app for tea gardens cannot be assessed only through clinical papers; usability and CHW delivery literature matter too.", [
      "SLR.pdf, pages 5-7: search strings, database list, and Boolean search template.",
    ]);
  }

  // 6. Screening funnel and source distribution
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addTitle(slide, "The final evidence base included 45 papers", 6);
    addSection(slide, "Evidence base");
    slide.charts.add("bar", {
      position: { left: 55, top: 175, width: 525, height: 390 },
      categories: ["Initial", "Title screen", "Abstract review", "Full text"],
      series: [{ name: "Papers left", values: [158, 82, 45, 45], fill: C.accent }],
      hasLegend: false,
      barOptions: { direction: "column", grouping: "clustered", gapWidth: 65 },
      yAxis: {
        visible: true,
        min: 0,
        max: 170,
        majorUnit: 40,
        majorGridlines: { style: "solid", fill: "#EDEDED", width: 1 },
        textStyle: { fontSize: 11, fill: C.muted },
      },
      xAxis: { textStyle: { fontSize: 11, fill: C.ink } },
      dataLabels: { showValue: true, position: "outEnd", textStyle: { fontSize: 12, fill: C.ink, bold: true } },
      chartFill: C.white,
      chartLine: { style: "solid", fill: C.white, width: 0 },
      plotAreaFill: { type: "none" },
    });
    const sourceRows = [
      ["Google Scholar", "62"],
      ["PubMed / PMC", "35"],
      ["IEEE Xplore", "28"],
      ["ACM Digital Library", "18"],
      ["ScienceDirect", "15"],
    ];
    addText(slide, "Retrieved papers by source", 705, 178, 420, 34, { fontSize: 25, bold: true });
    sourceRows.forEach((row, i) => {
      const y = 238 + i * 55;
      addPanel(slide, 705, y, 430, 37, i % 2 ? C.panel : C.panel2);
      addText(slide, row[0], 724, y + 8, 250, 24, { fontSize: 17 });
      addText(slide, row[1], 1038, y + 8, 70, 24, { fontSize: 17, bold: true, alignment: "right" });
    });
    addNotes(slide, "Keep this slide concise: the point is credibility and scope. Mention that the final 45 papers were read in full and thematically analyzed.", [
      "SLR.pdf, pages 6-7: source distribution and paper-pool narrowing table.",
    ]);
  }

  // 7. Findings overview
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addTitle(slide, "Five themes explain what the literature is really saying", 7);
    addSection(slide, "Analysis");
    const themes = [
      ["1", "CHWs are the linchpin", "They translate, explain, follow up, and create trust."],
      ["2", "Text-only interfaces fail", "Pictures and voice are essential for low-literacy users."],
      ["3", "Voice helps, infrastructure limits it", "Pre-loaded audio avoids failed calls and weak networks."],
      ["4", "Reminders change behavior", "Vaccination and ANC reminders show measurable gains."],
      ["5", "Tea-garden trials are missing", "Most evidence comes from adjacent settings, not Sylhet plantations."],
    ];
    themes.forEach((t, i) => {
      const x = i < 3 ? 70 + i * 390 : 265 + (i - 3) * 390;
      const y = i < 3 ? 205 : 435;
      addPanel(slide, x, y, 315, 150, C.panel);
      addText(slide, t[0], x + 22, y + 22, 42, 36, { fontSize: 28, bold: true, color: i === 4 ? C.red : C.accent });
      addText(slide, t[1], x + 74, y + 24, 205, 30, { fontSize: 21, bold: true });
      addText(slide, t[2], x + 74, y + 70, 205, 50, { fontSize: 16, color: C.muted });
    });
    addNotes(slide, "This is the bridge into the evidence slides. The five themes are the heart of the review and give the presentation its professional structure.", [
      "SLR.pdf, pages 7-9: five thematic clusters from the analysis section.",
    ]);
  }

  // 8. Outcome evidence
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addTitle(slide, "mHealth shows measurable gains, especially when reminders are used", 8);
    addSection(slide, "Evidence");
    slide.charts.add("bar", {
      position: { left: 60, top: 170, width: 610, height: 390 },
      categories: ["ANC attendance", "Vaccination odds", "BD uptake", "CHW coverage"],
      series: [{ name: "Evidence signal", values: [30, 2.15, 3.6, 90], fill: C.accent }],
      hasLegend: false,
      barOptions: { direction: "bar", grouping: "clustered", gapWidth: 58 },
      xAxis: {
        visible: true,
        min: 0,
        max: 100,
        majorUnit: 25,
        majorGridlines: { style: "solid", fill: "#EDEDED", width: 1 },
        textStyle: { fontSize: 11, fill: C.muted },
      },
      yAxis: { textStyle: { fontSize: 12, fill: C.ink }, line: { style: "solid", fill: C.rule, width: 1 } },
      dataLabels: { showValue: true, position: "outEnd", textStyle: { fontSize: 12, fill: C.ink, bold: true } },
      chartFill: C.white,
      chartLine: { style: "solid", fill: C.white, width: 0 },
      plotAreaFill: { type: "none" },
    });
    evidenceCard(slide, "How to read this", "The figures are not one pooled metric; they summarize different evidence signals.", "ANC: 20-40% rise; vaccination OR: 2.15; Bangladesh uptake: 3.6x; CHW coverage: above 90%.", 735, 177, 430, 180);
    evidenceCard(slide, "Interpretation", "The direction of evidence is consistent: reminders and CHW follow-up can improve attendance, vaccination, and knowledge.", "The review avoids formal meta-analysis because study designs are heterogeneous.", 735, 400, 430, 170, C.green);
    addNotes(slide, "Walk through the numbers carefully. Make it clear the chart is a presentation aid, not a formal meta-analysis. The review supports cautious confidence, not overclaiming.", [
      "SLR.pdf, page 4: ANC attendance, vaccination, CHW effectiveness, and health knowledge evidence.",
      "SLR.pdf, page 11: limitation about heterogeneous study designs and no formal meta-analysis.",
    ]);
  }

  // 9. CHW role
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addTitle(slide, "CHWs turn digital content into local action", 9);
    addSection(slide, "Delivery model");
    evidenceCard(slide, "Language bridge", "A trusted worker can explain formal health advice in everyday speech.", "Important where Sylheti, Chattisheuli, and tribal languages shape daily communication.", 72, 220, 330, 235);
    evidenceCard(slide, "Care tracker", "Digital checklists help CHWs track visits, risks, referrals, and overdue mothers.", "Bangladesh tablet-supported CHW work sustained visit coverage above 90%.", 475, 220, 330, 235, C.green);
    evidenceCard(slide, "Trust builder", "Mothers may act more readily when guidance comes through a known person.", "The review repeatedly finds CHW-mediated delivery stronger than direct-to-user messaging.", 878, 220, 330, 235);
    addText(slide, "Implementation caution: extra app tasks need supervision, compensation, and recognition, otherwise CHW motivation may fall.", 92, 545, 1050, 54, {
      fontSize: 24,
      alignment: "center",
    });
    addNotes(slide, "This slide should sound human, not technical. The CHW is the connective tissue: she interprets messages, follows up, and helps families decide when to seek care.", [
      "SLR.pdf, pages 7-8: CHWs as linchpin, Bangladesh CHW coverage evidence, and motivation concern.",
    ]);
  }

  // 10. HCI requirements
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addTitle(slide, "Low-literacy HCI is not decoration; it determines usability", 10);
    addSection(slide, "Interface design");
    const items = [
      ["Pictorial checklists", "Use tappable icons for danger signs, ANC tasks, nutrition, and vaccination steps."],
      ["Voice narration", "Narrate each screen in the language mothers actually use at home."],
      ["Flat navigation", "Keep paths short; every additional tap adds a chance for confusion."],
      ["Offline-first operation", "Pre-load guidance so the system works when signal disappears."],
      ["Privacy-aware reminders", "Design around shared household phones and message visibility."],
    ];
    items.forEach((item, i) => {
      const y = 178 + i * 82;
      addPanel(slide, 74, y, 50, 50, i % 2 ? C.green : C.accent);
      addText(slide, String(i + 1), 74, y + 9, 50, 30, { fontSize: 24, bold: true, color: C.white, alignment: "center" });
      addText(slide, item[0], 158, y - 2, 400, 32, { fontSize: 24, bold: true });
      addText(slide, item[1], 158, y + 35, 860, 34, { fontSize: 19, color: C.muted });
    });
    addNotes(slide, "Use this as the most design-oriented slide. The review argues that a normal text-heavy app would fail many intended users, so HCI choices are core health decisions.", [
      "SLR.pdf, pages 3 and 8: low-literacy HCI evidence, pictorial interfaces, voice narration, flat menus, and local language need.",
      "SLR.pdf, page 12: shared-phone and network-reliability questions.",
    ]);
  }

  // 11. Proposed feature architecture
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addTitle(slide, "A useful tool would combine mother guidance and CHW control", 11);
    addSection(slide, "Feature proposal");
    addLine(slide, 138, 335, 990, C.rule, 2);
    const nodes = [
      ["Mother mode", "audio + pictorial guidance", 72, C.green],
      ["CHW checklist", "home visit workflow", 303, C.accent],
      ["Care schedule", "ANC, PNC, vaccines", 534, C.accent],
      ["Offline sync", "store now, sync later", 765, C.green],
      ["Dashboard", "overdue cases + referrals", 996, C.red],
    ];
    nodes.forEach(([head, body, x, color]) => {
      addPanel(slide, x, 208, 170, 245, C.panel);
      addPanel(slide, x, 208, 170, 10, color, color);
      addText(slide, head, x + 15, 258, 140, 34, { fontSize: 23, bold: true, alignment: "center" });
      addText(slide, body, x + 17, 330, 136, 58, { fontSize: 17, color: C.muted, alignment: "center" });
    });
    addText(slide, "Core features: pictorial checklists, pre-loaded Bangla/Sylheti/Chattisheuli audio, vaccination tracker, ANC/PNC schedules, danger-sign alerts, CHW dashboard.", 80, 535, 1120, 66, {
      fontSize: 23,
      alignment: "center",
    });
    addNotes(slide, "Stress that this is a literature-grounded architecture, not a validated product. It shows what the evidence points toward for prototyping.", [
      "SLR.pdf, pages 9-10: proposed feature map and feature-rationale table.",
    ]);
  }

  // 12. Why tea-garden evidence still matters
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addTitle(slide, "The biggest evidence gap is inside the tea gardens themselves", 12);
    addSection(slide, "Critical gap");
    addText(slide, "No peer-reviewed study in the review piloted this exact CHW-plus-mHealth model inside a Sylhet tea garden.", 80, 170, 1040, 102, {
      fontSize: 39,
      bold: true,
      color: C.ink,
    });
    evidenceCard(slide, "Adjacent settings", "Evidence comes from similar LMIC contexts, not plantation trials.", "Useful, but not identical to plantation power structures.", 72, 365, 330, 160);
    evidenceCard(slide, "Language specificity", "Chattisheuli and tribal-language interfaces remain untested.", "Formal Bangla audio may still miss everyday comprehension.", 475, 365, 330, 160, C.green);
    evidenceCard(slide, "Institutional context", "Health posts are often employer-linked and under-resourced.", "Care-seeking depends on labour schedules and mobility constraints.", 878, 365, 330, 160, C.red);
    addNotes(slide, "This slide prevents overclaiming. The review's strongest scholarly contribution may be identifying the absence of direct tea-garden trials.", [
      "SLR.pdf, pages 8-9: absence of peer-reviewed mHealth trials inside Bangladeshi tea gardens and limits of adjacent evidence.",
      "SLR.pdf, page 13: distinctive tea-garden conditions.",
    ]);
  }

  // 13. Limitations
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addTitle(slide, "The review is useful, but its limits must shape the next study", 13);
    addSection(slide, "Limitations");
    twoColText(
      slide,
      "Review limitations",
      [
        "Searches were restricted to English-language publications and major databases.",
        "The field changes quickly; the review search ended in January 2025.",
        "Study designs varied too much for a meaningful formal meta-analysis.",
      ],
      "Design limitations",
      [
        "Tea-garden-specific mHealth evidence is nearly absent.",
        "Device ownership, shared-phone practices, and network reliability need mapping.",
        "Chattisheuli audio and culturally grounded visuals need participatory validation.",
      ],
    );
    addNotes(slide, "A professional presentation should not hide limitations. Explain that these constraints do not invalidate the review; they clarify what the next research step must test directly.", [
      "SLR.pdf, pages 9-12: review limitations, search cutoff, heterogeneity, and need to map the technology landscape.",
    ]);
  }

  // 14. Next research agenda and close
  {
    const slide = deck.slides.add();
    slide.background.fill = C.white;
    addText(slide, "Cautious yes", 41, 42, 360, 36, { fontSize: 28, color: C.accent, bold: true });
    addText(slide, "The evidence supports co-design and field testing, not immediate deployment.", 41, 185, 1030, 132, {
      fontSize: 52,
      verticalAlignment: "bottom",
    });
    const steps = [
      ["1", "Co-design with mothers and CHWs inside tea gardens"],
      ["2", "Map devices, language, phone sharing, and network reliability"],
      ["3", "Prototype pictorial and audio-first workflows"],
      ["4", "Run a cluster-randomized or stepped-wedge field trial"],
      ["5", "Plan sustainability before donor or pilot support ends"],
    ];
    steps.forEach((step, i) => {
      const y = 400 + i * 43;
      addText(slide, step[0], 55, y, 28, 28, { fontSize: 21, bold: true, color: i === 4 ? C.red : C.accent });
      addText(slide, step[1], 102, y, 930, 30, { fontSize: 21 });
    });
    addNotes(slide, "Close with the paper's balanced answer: CHW-backed mHealth is promising because reminders, CHW support, pictorial design, voice, and offline function all have support. But deployment should wait for participatory design and a proper trial in the actual tea-garden setting.", [
      "SLR.pdf, pages 11-13: research directions and conclusion.",
    ]);
  }

  for (const [index, slide] of deck.slides.items.entries()) {
    const stem = `v2-slide-${String(index + 1).padStart(2, "0")}`;
    await writeBlob(path.join(TMP_DIR, `${stem}.png`), await deck.export({ slide, format: "png", scale: 1 }));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(TMP_DIR, `${stem}.layout.json`), await layout.text(), "utf8");
  }

  await writeBlob(
    path.join(TMP_DIR, "slr_deck_v2_montage.webp"),
    await deck.export({ format: "webp", montage: true, scale: 1 }),
  );
  const snapshot = await deck.inspect({
    kind: "slide,textbox,shape,chart,table,notes",
    maxChars: 24000,
  });
  await fs.writeFile(path.join(TMP_DIR, "deck-v2-inspect.ndjson"), snapshot.ndjson, "utf8");

  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(FINAL_PPTX);
  console.log(FINAL_PPTX);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
