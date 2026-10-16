const defaultConfig = {
  navColor: "#0068ff",
  navImg: "",
  listColor: "#ffffff",
  listImg: "",
  chatColor: "#eef0f1",
  chatImg: "",
  bubbleMeColor: "#e5efff",
  bubbleYouColor: "#ffffff",
  bubbleTextColor: "#081c36",
};

// 1. Xử lý chuyển Tab mượt mà
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    btn.classList.add("active");
    tabContents[index].classList.add("active");
  });
});

// 2. Nạp dữ liệu cũ lên popup
chrome.storage.local.get(defaultConfig, (data) => {
  Object.keys(defaultConfig).forEach((key) => {
    const el = document.getElementById(key);
    if (el) el.value = data[key];
  });
});

// 3. Xử lý chọn file ảnh từ máy
function bindFileToInput(fileInputId, textInputId, labelId) {
  const fileEl = document.getElementById(fileInputId);
  const textEl = document.getElementById(textInputId);
  const labelEl = document.getElementById(labelId);
  if (!fileEl || !textEl || !labelEl) return;

  fileEl.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    labelEl.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      textEl.value = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

bindFileToInput("navFile", "navImg", "navFileName");
bindFileToInput("listFile", "listImg", "listFileName");
bindFileToInput("chatFile", "chatImg", "chatFileName");

window.clearImg = function (textId, labelId) {
  document.getElementById(textId).value = "";
  document.getElementById(labelId).textContent = "Tải ảnh từ máy...";
};

// 4. Nút Lưu
document.getElementById("btnSave").addEventListener("click", () => {
  const newConfig = {};
  Object.keys(defaultConfig).forEach((key) => {
    const el = document.getElementById(key);
    if (el) newConfig[key] = el.value.trim();
  });

  chrome.storage.local.set(newConfig, () => {
    window.close();
  });
});

// 5. Nút Reset Mặc định
document.getElementById("btnReset").addEventListener("click", () => {
  chrome.storage.local.set(defaultConfig, () => {
    window.close();
  });
});
