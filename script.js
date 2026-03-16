const state = {
  availableRewards: 9691068,
  upcomingRewards: 2000000,
  dailyLimitRemain: 9700000,
  dailyLimitTotal: 10000000,
  fee: 30,
  currentUser: null,
  amount: 0,
  lastCompleted: null,
  transactions: [
    {
      title: "LIVE rewards income",
      time: "03/16/2026, 09:00:00 AM",
      amount: "USD9,691,068.00",
      rawAmount: 9691068
    }
  ]
};

const screens = document.querySelectorAll(".screen");
const transactionsList = document.getElementById("transactionsList");
const usernameInput = document.getElementById("usernameInput");
const amountInput = document.getElementById("amountInput");
const profileCard = document.getElementById("profileCard");
const profileImage = document.getElementById("profileImage");
const profileDisplay = document.getElementById("profileDisplay");
const profileUsername = document.getElementById("profileUsername");
const profileFollowers = document.getElementById("profileFollowers");
const confirmModal = document.getElementById("confirmModal");

function money(n) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function shortMoney(n) {
  return Number(n).toLocaleString("en-US", {
    maximumFractionDigits: 0
  });
}

function normalizeUsername(name) {
  return String(name || "").trim().replace(/^@+/, "").toLowerCase();
}

function goTo(screenId) {
  screens.forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(screenId);
  if (target) target.classList.add("active");
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderCompleteDetails() {
  if (!state.lastCompleted) return;

  setText("detailsUser", `TikTok(@${state.lastCompleted.username})`);
  setText("detailsTime", state.lastCompleted.time);
  setText("txId", state.lastCompleted.txId);
  setText("detailsAmount", money(state.lastCompleted.amount));
  setText("detailsFee", `${money(state.fee)} USD`);
  setText("detailsReceive", `${money(state.lastCompleted.receive)} USD`);
}

function resetTransferForm() {
  state.currentUser = null;
  state.amount = 0;
  usernameInput.value = "";
  amountInput.value = 0;
  profileCard.classList.add("hidden");
  if (profileImage) profileImage.src = "";
  if (profileDisplay) profileDisplay.textContent = "";
  if (profileUsername) profileUsername.textContent = "";
  if (profileFollowers) profileFollowers.textContent = "";
  updateUserViews();
  updateAmountViews();
}

function clearTransferInputsOnly() {
  state.currentUser = null;
  state.amount = 0;
  usernameInput.value = "";
  amountInput.value = 0;
  profileCard.classList.add("hidden");
  if (profileImage) profileImage.src = "";
  if (profileDisplay) profileDisplay.textContent = "";
  if (profileUsername) profileUsername.textContent = "";
  if (profileFollowers) profileFollowers.textContent = "";
  updateUserViews();
  updateAmountViews();
}

function renderTransactions() {
  transactionsList.innerHTML = "";
  state.transactions.forEach((tx) => {
    const row = document.createElement("div");
    row.className = "tx-item";
    row.innerHTML = `
      <div>
        <div class="tx-title">${tx.title}</div>
        <div class="tx-time">${tx.time}</div>
      </div>
      <div class="tx-amount">${tx.amount}</div>
    `;
    transactionsList.appendChild(row);
  });
}

function renderHome() {
  setText("miniAvailable", `USD${money(state.availableRewards)}`);
  setText("miniUpcoming", `● USD${money(state.upcomingRewards)}`);
  setText("balanceMain", shortMoney(state.availableRewards));
  setText("limitLabel", `$${(state.dailyLimitRemain / 1000000).toFixed(1)}M/$${(state.dailyLimitTotal / 1000000).toFixed(1)}M`);
  setText("limitPlain", `${(state.dailyLimitRemain / 1000000).toFixed(1)} / ${(state.dailyLimitTotal / 1000000).toFixed(1)}M`);

  const totalIn = state.transactions
    .filter((t) => Number(t.rawAmount || 0) > 0)
    .reduce((sum, t) => sum + Number(t.rawAmount || 0), 0);
  const totalOut = state.transactions
    .filter((t) => Number(t.rawAmount || 0) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.rawAmount || 0)), 0);

  setText("inTotal", `USD${money(totalIn)}`);
  setText("outTotal", `USD${money(totalOut)}`);
  renderTransactions();
}

function updateUserViews() {
  const username = state.currentUser ? state.currentUser.username : "sageastra";
  setText("sheetUser", `TikTok (@${username})`);
}

function updateAmountViews() {
  const receive = Math.max(0, state.amount - state.fee);
  amountInput.value = state.amount;
  setText("receiveView", `USD ${money(receive)}`);
  setText("sheetAmount", `${money(state.amount)} USD`);
  setText("sheetFee", `${money(state.fee)} USD`);
  setText("sheetReceive", `${money(receive)} USD`);
}

async function lookupUser(username) {
  const clean = normalizeUsername(username);

  if (!clean) {
    state.currentUser = null;
    profileCard.classList.add("hidden");
    updateUserViews();
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/tiktok/${clean}`);
    const data = await res.json();

    if (!data.found) {
      state.currentUser = null;
      profileCard.classList.add("hidden");
      updateUserViews();
      return;
    }

    state.currentUser = {
      username: data.username,
      name: data.name,
      followers: Number(data.followers || 0),
      pfp: data.pfp
    };

    profileCard.classList.remove("hidden");
    profileImage.src = data.pfp || "";
    profileDisplay.textContent = data.name || data.username;
    profileUsername.textContent = `@${data.username}`;
    profileFollowers.textContent = `${Number(data.followers || 0).toLocaleString()} followers`;
    updateUserViews();
  } catch (err) {
    state.currentUser = null;
    profileCard.classList.add("hidden");
    updateUserViews();
  }
}

document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]");
  if (go) {
    if (go.dataset.go === "screen-home") {
      resetTransferForm();
    }
    goTo(go.dataset.go);
  }
});

usernameInput.addEventListener("input", (e) => {
  lookupUser(e.target.value);
});

amountInput.addEventListener("input", (e) => {
  state.amount = Math.max(0, Math.floor(Number(e.target.value || 0)));
  updateAmountViews();
});

document.getElementById("fillAll").addEventListener("click", () => {
  if (!state.currentUser) return;
  state.amount = Math.min(state.availableRewards, state.dailyLimitRemain);
  updateAmountViews();
});

document.getElementById("openConfirm").addEventListener("click", () => {
  if (!state.currentUser) {
    alert("Enter a valid TikTok username first");
    return;
  }

  if (state.amount <= 0) {
    alert("Enter transfer amount");
    return;
  }

  if (state.amount > state.availableRewards) {
    alert("Amount exceeds available rewards");
    return;
  }

  if (state.amount > state.dailyLimitRemain) {
    alert("Amount exceeds daily limit");
    return;
  }

  confirmModal.classList.remove("hidden");
});

document.getElementById("closeConfirm").addEventListener("click", () => {
  confirmModal.classList.add("hidden");
});

document.getElementById("confirmTransfer").addEventListener("click", async () => {
  confirmModal.classList.add("hidden");
  goTo("screen-loading");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const completedAmount = Number(state.amount);
  const completedUsername = state.currentUser.username;
  const now = new Date().toLocaleString("en-US");
  const txId = String(Date.now());
  const receive = Math.max(0, completedAmount - state.fee);

  state.lastCompleted = {
    amount: completedAmount,
    username: completedUsername,
    time: now,
    txId,
    receive
  };

  state.availableRewards -= completedAmount;
  state.dailyLimitRemain -= completedAmount;
  state.transactions.unshift({
    title: `Transfer to @${completedUsername}`,
    time: now,
    amount: `-USD${money(completedAmount)}`,
    rawAmount: -completedAmount
  });

  setText("bannerTitle", "Money sent successfully");
  setText("bannerText", `${money(completedAmount)} USD sent to @${completedUsername}`);

  renderHome();
  renderCompleteDetails();
  goTo("screen-complete");

  clearTransferInputsOnly();
});

renderHome();
updateUserViews();
updateAmountViews();
renderCompleteDetails();
