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

// Base64 thật được giữ trong biến, ô text chỉ hiện nhãn ngắn
const imageData = { navImg: "", listImg: "", chatImg: "" };
const LABEL = "[Ảnh đã chọn từ máy]";

function setImageField(key, value) {
  imageData[key] = value;
  const el = document.getElementById(key);
  if (!el) return;
  el.value = value.startsWith("data:") ? LABEL : value;
}

function applyToForm(data) {
  Object.keys(defaultConfig).forEach((key) => {
    if (key in imageData) {
      setImageField(key, data[key] || "");
    } else {
      const el = document.getElementById(key);
      if (el) el.value = data[key];
    }
  });
}

// Nạp cài đặt hiện tại
chrome.storage.local.get(defaultConfig, applyToForm);

// Đọc ảnh và resize bằng canvas để CSS không quá nặng
function fileToResizedDataUrl(file, maxSize = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas
          .getContext("2d")
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function bindFileToInput(fileInputId, key) {
  const fileEl = document.getElementById(fileInputId);
  const textEl = document.getElementById(key);
  if (!fileEl || !textEl) return;

  fileEl.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setImageField(key, await fileToResizedDataUrl(file));
    } catch {
      alert("Không đọc được ảnh này.");
    }
  });

  // Người dùng gõ/dán link thủ công thì thay thế dữ liệu cũ
  textEl.addEventListener("input", (e) => {
    const v = e.target.value.trim();
    if (v !== LABEL) imageData[key] = v;
  });
}

bindFileToInput("navFile", "navImg");
bindFileToInput("listFile", "listImg");
bindFileToInput("chatFile", "chatImg");

// Nút "Xóa ảnh"
document.querySelectorAll(".btn-clear").forEach((btn) => {
  btn.addEventListener("click", () => {
    setImageField(btn.dataset.key, "");
    const fileEl = document.getElementById(btn.dataset.file);
    if (fileEl) fileEl.value = "";
  });
});

function isValidImage(v) {
  return v === "" || /^https?:\/\//i.test(v) || /^data:image\//i.test(v);
}

// Nút Lưu
document.getElementById("btnSave").addEventListener("click", () => {
  const newConfig = {};
  for (const key of Object.keys(defaultConfig)) {
    const el = document.getElementById(key);
    if (!el) continue;
    newConfig[key] = key in imageData ? imageData[key] : el.value.trim();
  }

  for (const key of Object.keys(imageData)) {
    if (!isValidImage(newConfig[key])) {
      alert(
        "Link ảnh phải bắt đầu bằng http:// hoặc https://, hoặc chọn ảnh từ máy.",
      );
      return;
    }
  }

  chrome.storage.local.set(newConfig, () => {
    if (chrome.runtime.lastError) {
      alert("Lưu thất bại: " + chrome.runtime.lastError.message);
      return;
    }
    window.close();
  });
});

// Nút Khôi phục mặc định
document.getElementById("btnReset").addEventListener("click", () => {
  chrome.storage.local.set(defaultConfig, () => {
    if (chrome.runtime.lastError) {
      alert("Khôi phục thất bại: " + chrome.runtime.lastError.message);
      return;
    }
    applyToForm(defaultConfig);
    window.close();
  });
});
