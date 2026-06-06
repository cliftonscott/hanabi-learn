"use strict";

const colors = [
  { id: "red", label: "Red" },
  { id: "yellow", label: "Yellow" },
  { id: "green", label: "Green" },
  { id: "blue", label: "Blue" },
  { id: "white", label: "White" }
];

const maxClues = 8;
const maxFuses = 3;

const lessons = [
  {
    title: "Setup and goal",
    body: "Build five fireworks, one per color, from 1 through 5. Every point is a successfully played card.",
    bullets: ["Use 8 clue tokens.", "Use 3 fuse tokens.", "Players do not see their own cards."],
    example: "Think of the score as five visible stacks. A red stack at 2 means red 3 is the next red play."
  },
  {
    title: "What a turn can do",
    body: "On your turn you do exactly one thing: clue, discard, or play.",
    bullets: ["Clue to communicate.", "Discard to recover a clue token.", "Play only when the card is known or strongly implied."],
    example: "If red is at 1 and your card is red 2, playing advances the red firework."
  },
  {
    title: "Legal clues",
    body: "A clue names one color or one rank to another player and touches every matching card in that hand.",
    bullets: ["No mixed clues like red 2.", "No clues to yourself.", "No zero-match clues."],
    example: "If Partner 1 has red 5 and red 1, a red clue must identify both red cards."
  },
  {
    title: "Failed plays",
    body: "A failed play is allowed at the table, but it is bad: the card is discarded and the team loses one fuse.",
    bullets: ["This practice app rejects failed plays as a teaching guardrail.", "Three failed plays ends the game in this model."],
    example: "Blue stack at 1 means blue 2 is next. Blue 3 would bomb."
  },
  {
    title: "Discarding",
    body: "Discarding regains a clue token, but it can throw away scarce information or a critical card.",
    bullets: ["Do not discard if all 8 clues are already available.", "Avoid discarding unknown 5s.", "Known duplicates are safer discards."],
    example: "Discarding a 5 is usually dangerous because each color has only one 5."
  },
  {
    title: "Chop basics",
    body: "The chop is the card a player is most likely to discard next, often the oldest unclued card by table convention.",
    bullets: ["Save chop cards that are important.", "Clue playable cards before they become forgotten.", "Agree on conventions before the game."],
    example: "If Partner 1's oldest card is red 5, clue red or 5 before they discard it."
  },
  {
    title: "Clue efficiency",
    body: "A strong clue either makes a card playable, saves a critical card, or gives multiple useful facts at once.",
    bullets: ["A clue that touches two playable 1s is efficient.", "A clue that saves a 5 can be worth it.", "Avoid clues that create ambiguity with no plan."],
    example: "A 1 clue that marks two starting cards can create two safe plays from one token."
  },
  {
    title: "Ready for the table",
    body: "Play slowly enough to ask what a clue means and what card is at risk next.",
    bullets: ["Track the next needed rank in each color.", "Track clue and fuse pressure.", "When unsure, clue instead of making a blind risky play."],
    example: "Complete: you have the vocabulary for legal moves and the first strategy decisions."
  }
];

const strategies = [
  {
    title: "Chop",
    body: "The chop is the card a player is expected to discard next by convention. Beginners use this to decide which card needs saving.",
    example: "Practice example: Partner 1's leftmost red 5 is critical. A red or 5 clue saves it before a discard."
  },
  {
    title: "Saving 5s",
    body: "Each color has only one 5, so losing it caps that firework at 4. Save 5s even when they are not playable yet.",
    example: "Partner 2 has white 5. A 5 clue is not a play clue yet; it is a protection clue."
  },
  {
    title: "Clue efficiency",
    body: "A clue is efficient when it produces a play, saves a crucial card, or marks several useful cards at once.",
    example: "If a rank clue touches two playable 1s, one token can create two future plays."
  },
  {
    title: "When not to discard",
    body: "Do not discard when clue tokens are full, when your card may be a 5, or when the table needs information more than tempo.",
    example: "In the starting scenario, discard is illegal at 8 clues and strategy-poor before any clues are given."
  },
  {
    title: "Common beginner error: partial clues",
    body: "A color or rank clue always identifies every matching card in that player's hand. You cannot secretly point to only one of them.",
    example: "If Partner 1 has two red cards, a red clue marks both."
  },
  {
    title: "Common beginner error: treating a bomb as illegal",
    body: "The rules allow you to attempt a bad play, but it fails and costs a fuse. This app blocks it only to teach the consequence before it happens.",
    example: "Blue 3 with blue stack at 1 would fail because blue 2 is missing."
  }
];

const initialPractice = {
  stacks: { red: 1, yellow: 1, green: 0, blue: 1, white: 0 },
  clues: 8,
  fuses: 3,
  deckCount: 35,
  selectedCard: null,
  history: [],
  players: [
    {
      id: "you",
      name: "You",
      hand: [
        card("red", 2),
        card("yellow", 4),
        card("green", 5),
        card("blue", 3),
        card("white", 1)
      ]
    },
    {
      id: "partner1",
      name: "Partner 1",
      hand: [
        card("red", 5),
        card("blue", 2),
        card("yellow", 1),
        card("green", 3),
        card("red", 1)
      ]
    },
    {
      id: "partner2",
      name: "Partner 2",
      hand: [
        card("blue", 1),
        card("yellow", 2),
        card("green", 1),
        card("white", 5),
        card("red", 3)
      ]
    }
  ]
};

const drawPile = [
  card("green", 1),
  card("white", 2),
  card("red", 3),
  card("blue", 2),
  card("yellow", 2),
  card("green", 2)
];

let practice = clonePractice(initialPractice);
let lessonIndex = 0;
const themeStorageKey = "hanabi-learn-theme";
const viewNames = ["rules", "tutorial", "practice", "strategy"];

function card(color, rank) {
  return { color, rank };
}

function clonePractice(source) {
  return {
    stacks: { ...source.stacks },
    clues: source.clues,
    fuses: source.fuses,
    deckCount: source.deckCount,
    selectedCard: source.selectedCard,
    history: [...source.history],
    players: source.players.map((player) => ({
      ...player,
      hand: player.hand.map((item) => ({ ...item }))
    }))
  };
}

function colorLabel(colorId) {
  return colors.find((item) => item.id === colorId)?.label ?? colorId;
}

function cardName(item) {
  return `${colorLabel(item.color)} ${item.rank}`;
}

function nextNeeded(colorId) {
  return practice.stacks[colorId] + 1;
}

function isPlayable(item) {
  return item.rank === nextNeeded(item.color);
}

function score() {
  return Object.values(practice.stacks).reduce((sum, value) => sum + value, 0);
}

function viewFromHash() {
  const requestedView = window.location.hash.replace("#", "");
  return viewNames.includes(requestedView) ? requestedView : "rules";
}

function showView(viewName, options = {}) {
  const nextView = viewNames.includes(viewName) ? viewName : "rules";
  const { updateHash = true, focusHeading = false } = options;

  document.querySelectorAll(".view").forEach((view) => {
    const isActive = view.id === `${nextView}-view`;
    view.classList.toggle("active", isActive);
    view.hidden = !isActive;
    view.setAttribute("aria-hidden", String(!isActive));
  });
  document.querySelectorAll(".nav-button").forEach((button) => {
    const isActive = button.dataset.view === nextView;
    button.classList.toggle("active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
  document.querySelector(`.nav-button[data-view="${nextView}"]`)?.scrollIntoView({
    block: "nearest",
    inline: "center"
  });

  if (updateHash && window.location.hash !== `#${nextView}`) {
    window.history.pushState(null, "", `#${nextView}`);
  }

  if (focusHeading) {
    const heading = document.querySelector(`#${nextView}-heading`);
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }
}

function applyThemePreference(preference) {
  const normalized = ["auto", "light", "dark"].includes(preference) ? preference : "auto";
  document.documentElement.dataset.themePreference = normalized;
  if (normalized === "dark" || normalized === "light") {
    document.documentElement.dataset.theme = normalized;
  } else {
    delete document.documentElement.dataset.theme;
  }
}

function initThemeControls() {
  const select = document.querySelector("#theme-select");
  if (!select) return;
  const savedPreference = localStorage.getItem(themeStorageKey) || "auto";
  applyThemePreference(savedPreference);
  select.value = document.documentElement.dataset.themePreference;
  select.addEventListener("change", () => {
    localStorage.setItem(themeStorageKey, select.value);
    applyThemePreference(select.value);
  });
}

function renderTutorial() {
  const progress = document.querySelector("#lesson-progress");
  const panel = document.querySelector("#lesson-panel");
  const lesson = lessons[lessonIndex];

  progress.innerHTML = lessons.map((item, index) => {
    const status = index < lessonIndex ? "done" : index === lessonIndex ? "active" : "";
    const current = index === lessonIndex ? ' aria-current="step"' : "";
    return `<button class="progress-step ${status}" type="button" data-lesson="${index}" aria-label="Lesson ${index + 1}: ${item.title}"${current}>${index + 1}. ${item.title}</button>`;
  }).join("");

  panel.innerHTML = `
    <span class="lesson-kicker">Lesson ${lessonIndex + 1} of ${lessons.length}</span>
    <h3>${lesson.title}</h3>
    <p>${lesson.body}</p>
    <ul>${lesson.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
    <div class="lesson-example"><strong>Example:</strong> ${lesson.example}</div>
  `;

  document.querySelector("#lesson-back").disabled = lessonIndex === 0;
  document.querySelector("#lesson-next").textContent = lessonIndex === lessons.length - 1 ? "Complete" : "Next";
}

function renderRulesStrategy() {
  document.querySelector("#strategy-grid").innerHTML = strategies.map((item) => `
    <article class="strategy-card">
      <h3>${item.title}</h3>
      <p>${item.body}</p>
      <div class="example"><strong>Concrete example:</strong> ${item.example}</div>
    </article>
  `).join("");
}

function renderPractice() {
  document.querySelector("#score-text").textContent = `${score()} / 25`;
  document.querySelector("#clue-text").textContent = `${practice.clues} / ${maxClues}`;
  document.querySelector("#fuse-text").textContent = `${practice.fuses} / ${maxFuses}`;
  document.querySelector("#deck-text").textContent = String(practice.deckCount);

  document.querySelectorAll(".table-stats > div").forEach((item) => {
    item.classList.remove("highlight", "warning");
  });
  document.querySelector("#score-text").parentElement.classList.add("highlight");
  if (practice.clues === 0) {
    document.querySelector("#clue-text").parentElement.classList.add("warning");
  }
  if (practice.fuses <= 1) {
    document.querySelector("#fuse-text").parentElement.classList.add("warning");
  }

  document.querySelector("#fireworks").innerHTML = colors.map((color) => {
    const current = practice.stacks[color.id];
    const needed = current >= 5 ? "complete" : `${current + 1} next`;
    const pips = [1, 2, 3, 4, 5].map((rank) => (
      `<span class="pip ${rank <= current ? "filled" : ""}"></span>`
    )).join("");
    return `
      <article class="stack-card ${color.id}" aria-label="${color.label} firework is at ${current}; ${needed}">
        <div class="stack-top">
          <span class="stack-color">${color.label}</span>
          <span class="stack-needed">${needed}</span>
        </div>
        <div class="mini-stack" aria-hidden="true">${pips}</div>
      </article>
    `;
  }).join("");

  const partners = practice.players.filter((player) => player.id !== "you");
  document.querySelector("#partners").innerHTML = partners.map((player) => `
    <article class="player-panel">
      <div class="hand-heading">
        <h3>${player.name}</h3>
        <span>Visible to you</span>
      </div>
      <div class="hand">${player.hand.map((item) => renderCard(item, false)).join("")}</div>
    </article>
  `).join("");

  const you = practice.players.find((player) => player.id === "you");
  document.querySelector("#own-hand").innerHTML = you.hand.map((item, index) => renderCard(item, true, index)).join("");
  renderSelectionSummary();
  renderClueForm();
  renderHistory();
  renderTips();
}

function renderSelectionSummary() {
  const summary = document.querySelector("#selected-summary");
  const playButton = document.querySelector("#play-card");
  const discardButton = document.querySelector("#discard-card");
  const item = selectedOwnCard();
  const hasSelection = Boolean(item);

  playButton.disabled = !hasSelection;
  discardButton.disabled = !hasSelection;

  if (!item) {
    summary.innerHTML = "<span>Select one card from your hand to preview play and discard consequences.</span><span class=\"summary-status\">No card selected</span>";
    return;
  }

  const status = isPlayable(item)
    ? "Playable now"
    : `${colorLabel(item.color)} needs ${nextNeeded(item.color)}`;
  const discardRisk = item.rank === 5
    ? "High discard risk: each 5 is unique."
    : isPlayable(item)
      ? "Discard risk: this card can score now."
      : "Discard is legal only after a clue token is spent.";

  summary.innerHTML = `<span><strong>${cardName(item)}</strong> selected. ${discardRisk}</span><span class="summary-status">${status}</span>`;
}

function renderCard(item, selectable, index = -1) {
  const selected = selectable && practice.selectedCard === index ? " selected" : "";
  const note = isPlayable(item) ? "playable" : `${colorLabel(item.color)} needs ${nextNeeded(item.color)}`;
  const label = selectable
    ? `Select ${cardName(item)}; ${note}${selected ? "; selected" : ""}`
    : `${cardName(item)}; ${note}`;
  const attrs = selectable
    ? `button type="button" data-card-index="${index}" aria-pressed="${selected ? "true" : "false"}"`
    : "div";
  const close = selectable ? "button" : "div";
  return `
    <${attrs} class="card ${item.color}${selectable ? " selectable" : ""}${selected}" aria-label="${label}">
      <span class="card-rank">${item.rank}</span>
      <span class="card-label">${colorLabel(item.color)}</span>
      <span class="card-note">${note}</span>
    </${close}>
  `;
}

function renderClueForm() {
  const target = document.querySelector("#clue-target");
  const kind = document.querySelector("#clue-kind");
  const value = document.querySelector("#clue-value");
  const partners = practice.players.filter((player) => player.id !== "you");

  const previousTarget = target.value;
  target.innerHTML = partners.map((player) => `<option value="${player.id}">${player.name}</option>`).join("");
  if (partners.some((player) => player.id === previousTarget)) {
    target.value = previousTarget;
  }

  const previousValue = value.value;
  if (kind.value === "rank") {
    value.innerHTML = [1, 2, 3, 4, 5].map((rank) => `<option value="${rank}">${rank}</option>`).join("");
  } else {
    value.innerHTML = colors.map((color) => `<option value="${color.id}">${color.label}</option>`).join("");
  }
  if ([...value.options].some((option) => option.value === previousValue)) {
    value.value = previousValue;
  }
  renderCluePreview();
}

function renderCluePreview() {
  const target = document.querySelector("#clue-target");
  const kind = document.querySelector("#clue-kind");
  const value = document.querySelector("#clue-value");
  const preview = document.querySelector("#clue-preview");
  const player = practice.players.find((item) => item.id === target.value);

  if (!player) {
    preview.textContent = "Choose a partner to preview clue legality.";
    preview.className = "clue-preview";
    return;
  }

  const matches = player.hand.filter((item) => (
    kind.value === "color" ? item.color === value.value : String(item.rank) === value.value
  ));
  const clueText = kind.value === "color" ? colorLabel(value.value) : value.value;

  if (practice.clues <= 0) {
    preview.textContent = "No clue tokens are available. Discarding can recover a token.";
    preview.className = "clue-preview invalid";
    return;
  }

  if (matches.length === 0) {
    preview.textContent = `${player.name} has no ${clueText} cards. This would be an illegal zero-match clue.`;
    preview.className = "clue-preview invalid";
    return;
  }

  const touched = matches.map((item) => cardName(item)).join(", ");
  const plural = matches.length === 1 ? "card" : "cards";
  preview.textContent = `Legal preview: ${clueText} touches ${matches.length} ${plural}: ${touched}. Costs 1 clue token.`;
  preview.className = "clue-preview valid";
}

function renderHistory() {
  const history = document.querySelector("#history-list");
  if (practice.history.length === 0) {
    history.innerHTML = "<li class=\"empty-history\"><strong>No moves yet</strong><span>Try a clue, a safe play, or a rejected bomb to build the table record.</span></li>";
    return;
  }
  history.innerHTML = practice.history.slice(-8).reverse().map((item) => `<li>${item}</li>`).join("");
}

function renderTips() {
  const riskyCard = practice.players[0].hand.find((item) => item.rank === 5);
  const tips = [
    `Next plays: ${colors.map((color) => `${color.label} ${nextNeeded(color.id)}`).join(", ")}.`,
    "At 8 clue tokens, discard is illegal. Spend a useful clue first.",
    riskyCard ? `Your ${cardName(riskyCard)} is a 5. In real play, unknown 5s deserve protection.` : "No 5 in your current hand."
  ];
  document.querySelector("#table-tips").innerHTML = tips.map((tip) => `<li>${tip}</li>`).join("");
}

function selectPanel(panelName) {
  document.querySelectorAll(".panel-tab").forEach((tab) => {
    const isActive = tab.dataset.panel === panelName;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  document.querySelectorAll(".panel-body").forEach((panel) => {
    const isActive = panel.id === `${panelName}-panel`;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });
}

function setFeedback(title, copy, note = "") {
  document.querySelector("#feedback-title").textContent = title;
  document.querySelector("#feedback-copy").textContent = copy;
  document.querySelector("#feedback-note").textContent = note || "Use this feedback to connect legality with table strategy.";
  selectPanel("feedback");
}

function addHistory(message) {
  practice.history.push(message);
}

function drawReplacement() {
  if (practice.deckCount <= 0) {
    return null;
  }
  const index = initialPractice.deckCount - practice.deckCount;
  practice.deckCount -= 1;
  return drawPile[index % drawPile.length];
}

function replaceOwnCard(index) {
  const you = practice.players.find((player) => player.id === "you");
  const replacement = drawReplacement();
  if (replacement) {
    you.hand.splice(index, 1, { ...replacement });
  } else {
    you.hand.splice(index, 1);
  }
  practice.selectedCard = null;
}

function selectedOwnCard() {
  const you = practice.players.find((player) => player.id === "you");
  if (practice.selectedCard === null || !you.hand[practice.selectedCard]) {
    return null;
  }
  return you.hand[practice.selectedCard];
}

function playSelectedCard() {
  const item = selectedOwnCard();
  if (!item) {
    setFeedback("Select a card first", "Choose one card from your hand before pressing Play.", "A real turn always names a specific card.");
    return;
  }

  if (!isPlayable(item)) {
    setFeedback(
      "Practice rejected: this would bomb",
      `${cardName(item)} is not the next ${colorLabel(item.color)} card. ${colorLabel(item.color)} needs ${nextNeeded(item.color)} next.`,
      "Rules note: at the real table, attempting this play is allowed, but it fails, discards the card, and costs 1 fuse."
    );
    addHistory(`Rejected play: ${cardName(item)} would fail.`);
    renderPractice();
    return;
  }

  practice.stacks[item.color] += 1;
  if (item.rank === 5 && practice.clues < maxClues) {
    practice.clues += 1;
  }
  addHistory(`Played ${cardName(item)} successfully.`);
  setFeedback(
    "Legal play",
    `${cardName(item)} was the next needed card, so it advanced the ${colorLabel(item.color)} firework.`,
    item.rank === 5 ? "Completing a firework restores 1 clue token if one is missing." : "After a safe play, draw a replacement card if the deck has cards."
  );
  replaceOwnCard(practice.selectedCard);
  renderPractice();
}

function discardSelectedCard() {
  const item = selectedOwnCard();
  if (!item) {
    setFeedback("Select a card first", "Choose one card from your hand before pressing Discard.", "Discarding is a specific card action.");
    return;
  }

  if (practice.clues >= maxClues) {
    setFeedback(
      "Illegal discard",
      "You cannot discard while all 8 clue tokens are already available.",
      "Spend a useful clue first; discarding exists to recover a clue token."
    );
    addHistory(`Rejected discard: clue tokens are full.`);
    renderPractice();
    return;
  }

  practice.clues += 1;
  const warning = item.rank === 5
    ? "Strategic warning: each color has only one 5, so discarding it can cap that firework."
    : isPlayable(item)
      ? "Strategic warning: this card was currently playable."
      : "This is legal. In real games, prefer known duplicates or cards proven unnecessary.";
  addHistory(`Discarded ${cardName(item)} and recovered 1 clue.`);
  setFeedback("Legal discard", `${cardName(item)} was discarded and 1 clue token returned.`, warning);
  replaceOwnCard(practice.selectedCard);
  renderPractice();
}

function giveClue(event) {
  event.preventDefault();
  const targetId = document.querySelector("#clue-target").value;
  const kind = document.querySelector("#clue-kind").value;
  const value = document.querySelector("#clue-value").value;
  const player = practice.players.find((item) => item.id === targetId);

  if (practice.clues <= 0) {
    setFeedback("Illegal clue", "You have no clue tokens available, so you cannot give a clue.", "Discarding can recover clue tokens when the clue pool is not full.");
    addHistory("Rejected clue: no clue tokens.");
    renderPractice();
    return;
  }

  const matches = player.hand
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => kind === "color" ? item.color === value : String(item.rank) === value);

  if (matches.length === 0) {
    const clueText = kind === "color" ? colorLabel(value) : value;
    setFeedback(
      "Illegal clue",
      `${player.name} has no ${clueText} cards, so this would be a zero-match clue.`,
      "A legal clue must identify at least one card and all matching cards of that color or rank."
    );
    addHistory(`Rejected clue: ${player.name} has no ${clueText} cards.`);
    renderPractice();
    return;
  }

  practice.clues -= 1;
  const touched = matches.map(({ item }) => cardName(item)).join(", ");
  const clueText = kind === "color" ? colorLabel(value) : value;
  setFeedback(
    "Legal clue",
    `${player.name} receives a ${kind} clue for ${clueText}. It touches: ${touched}.`,
    "The clue must touch every matching card in that hand, not just the one you privately care about."
  );
  addHistory(`Clued ${player.name}: ${kind} ${clueText}.`);
  renderPractice();
}

function bindEvents() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view, { focusHeading: true }));
  });

  document.querySelectorAll("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.jump, { focusHeading: true }));
  });

  window.addEventListener("hashchange", () => {
    showView(viewFromHash(), { updateHash: false, focusHeading: true });
  });

  document.querySelector("#lesson-progress").addEventListener("click", (event) => {
    const button = event.target.closest("[data-lesson]");
    if (!button) return;
    lessonIndex = Number(button.dataset.lesson);
    renderTutorial();
  });

  document.querySelector("#lesson-back").addEventListener("click", () => {
    lessonIndex = Math.max(0, lessonIndex - 1);
    renderTutorial();
  });

  document.querySelector("#lesson-next").addEventListener("click", () => {
    if (lessonIndex === lessons.length - 1) {
      setFeedback("Tutorial complete", "You finished the guided lessons. Try one legal clue, one safe play, and one rejected bomb in Practice.", "Good table confidence starts with knowing why a move is legal.");
      showView("practice");
      return;
    }
    lessonIndex += 1;
    renderTutorial();
  });

  document.querySelector("#restart-tutorial").addEventListener("click", () => {
    lessonIndex = 0;
    renderTutorial();
  });

  document.querySelector("#own-hand").addEventListener("click", (event) => {
    const button = event.target.closest("[data-card-index]");
    if (!button) return;
    practice.selectedCard = Number(button.dataset.cardIndex);
    const item = selectedOwnCard();
    setFeedback("Card selected", `${cardName(item)} selected.`, isPlayable(item) ? "This is currently playable." : `${colorLabel(item.color)} needs ${nextNeeded(item.color)} next.`);
    renderPractice();
  });

  document.querySelector("#play-card").addEventListener("click", playSelectedCard);
  document.querySelector("#discard-card").addEventListener("click", discardSelectedCard);
  document.querySelector("#clue-form").addEventListener("submit", giveClue);
  document.querySelector("#clue-kind").addEventListener("change", renderClueForm);
  document.querySelector("#clue-target").addEventListener("change", renderCluePreview);
  document.querySelector("#clue-value").addEventListener("change", renderCluePreview);

  document.querySelector("#reset-practice").addEventListener("click", () => {
    practice = clonePractice(initialPractice);
    setFeedback("Scenario reset", "The practice table is back to its starting state.", "Try Partner 1 + Color + White for an illegal clue, or blue 3 for a rejected bomb.");
    renderPractice();
  });

  document.querySelectorAll(".panel-tab").forEach((button) => {
    button.addEventListener("click", () => selectPanel(button.dataset.panel));
  });
}

initThemeControls();
renderRulesStrategy();
renderTutorial();
renderPractice();
bindEvents();
showView(viewFromHash(), { updateHash: false });
