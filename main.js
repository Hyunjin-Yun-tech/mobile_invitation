/* ==========================================================================
   NETFLIX THEME MOBILE INVITATION - APPLICATION LOGIC
   ========================================================================== */

// --------------------------------------------------------------------------
// WEDDING CONFIGURATION DATA (쉽게 변경할 수 있는 설정)
// --------------------------------------------------------------------------
const WEDDING_CONFIG = {
  groom: {
    name: "윤현진",
    phone: "010-5060-1095",
    father: "윤정만",
    mother: "김남숙",
    fatherPhone: "010-3554-5330",
    motherPhone: "010-3718-5339",
    bank: "기업은행",
    account: "158-108983-01-011",
    accountHolder: "윤현진",
    fatherBank: "농협은행",
    fatherAccount: "733010-52-144864",
    motherBank: "농협은행",
    motherAccount: "733010-52-130326"
  },
  bride: {
    name: "한지수",
    phone: "010-3609-0766",
    father: "한범석",
    mother: "이지량",
    fatherPhone: "010-8891-6816",
    motherPhone: "010-4920-0766",
    bank: "하나은행",
    account: "87391-0308-17107",
    accountHolder: "한지수",
    fatherBank: "농협은행",
    fatherAccount: "302-1333-7410-91",
    motherBank: "국민은행",
    motherAccount: "720501-01-249004"
  },
  weddingDate: "2026-10-09T13:00:00+09:00", // 예식 일시 ISO 8601
  dateFormatted: "2026년 10월 9일 금요일 오후 1:00",
  venue: {
    name: "노블발렌티 삼성점",
    hall: "단독홀",
    address: "서울특별시 강남구 봉은사로 637 (노블발렌티 삼성점)",
    naverMapUrl: "https://map.naver.com/v5/search/%EB%85%B8%EB%B8%94%EB%B0%9C%EB%A0%8C%ED%8B%B0%20%EC%82%BC%EC%84%B1%EC%A0%90",
    kakaoMapUrl: "https://map.kakao.com/link/search/%EB%85%B8%EB%B8%94%EB%B0%9C%EB%A0%8C%ED%8B%B0%20%EC%82%BC%EC%84%B1%EC%A0%90",
    tmapUrl: "tmap://search?name=노블발렌티삼성점"
  }
};

// --------------------------------------------------------------------------
// DOM LOADED INITIALIZATION
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initDDayTimer();
  initAudioSynth();
  initHeaderScroll();
  initAccordion();
  initRSVPModal();
  initLightbox();
  initGuestbook();
  initScrollAnimations();
});

// --------------------------------------------------------------------------
// 1. BACKGROUND MUSIC & INTRO SPLASH
// --------------------------------------------------------------------------
let audioCtx = null;
let isAudioPlaying = false;
let audioEl = null;
let synthTimer = null;

function startBGM() {
  isAudioPlaying = true;
  const audioToggleBtn = document.getElementById("audioToggleBtn");
  if (audioToggleBtn) {
    audioToggleBtn.classList.add("playing");
    audioToggleBtn.style.color = "#E50914";
  }

  if (!audioEl) {
    audioEl = document.getElementById("bgmAudio");
  }

  if (audioEl) {
    audioEl.play().then(() => {
      showToast("🎵 로맨틱 웨딩 BGM이 시작되었습니다.");
    }).catch((e) => {
      console.log("Audio play error:", e);
    });
  }
}

function stopBGM() {
  isAudioPlaying = false;
  const audioToggleBtn = document.getElementById("audioToggleBtn");
  if (audioToggleBtn) {
    audioToggleBtn.classList.remove("playing");
    audioToggleBtn.style.color = "#FFFFFF";
  }

  if (audioEl) {
    audioEl.pause();
  }
  if (synthTimer) {
    clearInterval(synthTimer);
    synthTimer = null;
  }
  showToast("🔇 배경음악이 일시정지되었습니다.");
}

function toggleBGM() {
  if (isAudioPlaying) {
    stopBGM();
  } else {
    startBGM();
  }
}

function playSynthMelody() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 392.00, 261.63];
    let noteIdx = 0;

    if (synthTimer) clearInterval(synthTimer);
    synthTimer = setInterval(() => {
      if (!isAudioPlaying || !audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[noteIdx], now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 1.1);

      noteIdx = (noteIdx + 1) % notes.length;
    }, 650);
  } catch (e) {
    console.log("Audio synth error");
  }
}

function initAudioSynth() {
  const tudumBtn = document.getElementById("btnTudumStart");
  const splashScreen = document.getElementById("splashScreen");
  const audioToggleBtn = document.getElementById("audioToggleBtn");

  if (tudumBtn) {
    tudumBtn.addEventListener("click", () => {
      splashScreen.classList.add("hidden");
      startBGM(); // 메인 화면 진입 시 BGM 자동 재생!
      setTimeout(() => {
        splashScreen.remove();
      }, 900);
    });
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", () => {
      toggleBGM(); // 음표 버튼 클릭 시 BGM 켜기/끄기
    });
  }
}

// --------------------------------------------------------------------------
// 2. D-DAY REALTIME COUNTDOWN
// --------------------------------------------------------------------------
function initDDayTimer() {
  const ddayNumEl = document.getElementById("ddayDays");
  const ddayHoursEl = document.getElementById("ddayHours");
  const ddayMinsEl = document.getElementById("ddayMins");
  const ddaySecsEl = document.getElementById("ddaySecs");

  const targetTime = new Date(WEDDING_CONFIG.weddingDate).getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const diff = targetTime - now;

    if (diff <= 0) {
      if (ddayNumEl) ddayNumEl.innerText = "00";
      if (ddayHoursEl) ddayHoursEl.innerText = "00";
      if (ddayMinsEl) ddayMinsEl.innerText = "00";
      if (ddaySecsEl) ddaySecsEl.innerText = "00";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (ddayNumEl) ddayNumEl.innerText = days < 10 ? `0${days}` : days;
    if (ddayHoursEl) ddayHoursEl.innerText = hours < 10 ? `0${hours}` : hours;
    if (ddayMinsEl) ddayMinsEl.innerText = mins < 10 ? `0${mins}` : mins;
    if (ddaySecsEl) ddaySecsEl.innerText = secs < 10 ? `0${secs}` : secs;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// --------------------------------------------------------------------------
// 3. HEADER SCROLL EFFECT
// --------------------------------------------------------------------------
function initHeaderScroll() {
  const headerBar = document.getElementById("headerBar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      headerBar.classList.add("scrolled");
    } else {
      headerBar.classList.remove("scrolled");
    }
  });
}

// --------------------------------------------------------------------------
// 4. ACCORDION (GIFT ACCOUNT BOXES)
// --------------------------------------------------------------------------
function initAccordion() {
  const accountBoxes = document.querySelectorAll(".account-box");
  accountBoxes.forEach(box => {
    const btn = box.querySelector(".account-header-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        box.classList.toggle("open");
      });
    }
  });
}

// --------------------------------------------------------------------------
// GOOGLE SHEETS API INTEGRATION
// (신랑·신부님의 구글 앱스 스크립트 웹앱 URL을 입력하시면 구글 시트로 실시간 전송됩니다)
// --------------------------------------------------------------------------
const GOOGLE_SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxOPV_FCSUrf_2Y0NUZx0EUJm8RYl81phnXwrnJSZhqC5LKjVYmsm0M2bNA7IMVOXg8/exec"; 

function sendToGoogleSheets(payload) {
  if (!GOOGLE_SHEETS_WEBAPP_URL) return;
  fetch(GOOGLE_SHEETS_WEBAPP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  }).catch(err => console.log("Google Sheets send error:", err));
}

// --------------------------------------------------------------------------
// 5. RSVP MODAL
// --------------------------------------------------------------------------
function initRSVPModal() {
  const rsvpModal = document.getElementById("rsvpModal");
  const openBtns = document.querySelectorAll(".btn-trigger-rsvp");
  const closeBtn = document.getElementById("closeRsvpBtn");
  const form = document.getElementById("rsvpForm");

  openBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      rsvpModal.classList.add("active");
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      rsvpModal.classList.remove("active");
    });
  }

  // 모달 바깥 여백 클릭 시 닫기
  if (rsvpModal) {
    rsvpModal.addEventListener("click", (e) => {
      if (e.target === rsvpModal) {
        rsvpModal.classList.remove("active");
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const side = form.querySelector("input[name='rsvpSide']:checked")?.value || "신랑측";
      const name = document.getElementById("rsvpName").value.trim();
      const count = document.getElementById("rsvpCount").value;

      if (!name) {
        showToast("⚠️ 성함을 입력해 주세요.");
        return;
      }

      // 구글 시트로 실시간 전송
      sendToGoogleSheets({
        type: "rsvp",
        side: side,
        name: name,
        count: count,
        meal: "미정",
        message: ""
      });

      // 로컬 스토리지 데이터 저장
      const rsvpList = JSON.parse(localStorage.getItem("wedding_rsvp_list") || "[]");
      rsvpList.push({ side, name, count, date: new Date().toLocaleString() });
      localStorage.setItem("wedding_rsvp_list", JSON.stringify(rsvpList));

      showToast(`🎉 ${name}님, 참석 여부가 성공적으로 전달되었습니다!`);
      form.reset();
      rsvpModal.classList.remove("active");
    });
  }
}

// --------------------------------------------------------------------------
// 6. LIGHTBOX PHOTO GALLERY
// --------------------------------------------------------------------------
let currentGalleryIdx = 0;
let galleryImages = [];

function initLightbox() {
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImg = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxCloseBtn");
  const prevBtn = document.getElementById("lightboxPrevBtn");
  const nextBtn = document.getElementById("lightboxNextBtn");
  const thumbStrip = document.getElementById("lightboxThumbStrip");

  const cards = document.querySelectorAll(".gallery-item-card img");
  galleryImages = Array.from(cards).map(img => img.src);

  // 갤러리 하단 섬네일 리스트 생성
  if (thumbStrip) {
    thumbStrip.innerHTML = galleryImages.map((src, i) => `
      <div class="lightbox-thumb-item" data-idx="${i}">
        <img src="${src}" alt="섬네일 ${i + 1}">
      </div>
    `).join("");

    thumbStrip.querySelectorAll(".lightbox-thumb-item").forEach(item => {
      item.addEventListener("click", () => {
        const idx = parseInt(item.getAttribute("data-idx"), 10);
        currentGalleryIdx = idx;
        showLightboxImage();
      });
    });
  }

  cards.forEach((img, idx) => {
    img.addEventListener("click", () => {
      currentGalleryIdx = idx;
      if (thumbStrip) thumbStrip.style.display = "flex";
      if (prevBtn) prevBtn.style.display = "flex";
      if (nextBtn) nextBtn.style.display = "flex";
      showLightboxImage();
      lightboxModal.classList.add("active");
    });
  });

  // 출연진(신랑/신부) 프로필 사진 클릭 시 팝업 띄우기 (하단 리스트 및 화살표 안뜨게 설정)
  const castAvatars = document.querySelectorAll(".cast-avatar");
  castAvatars.forEach(avatar => {
    avatar.addEventListener("click", () => {
      const img = avatar.querySelector("img");
      if (!img) return;
      
      if (lightboxImg) lightboxImg.src = img.src;
      if (thumbStrip) thumbStrip.style.display = "none";
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      lightboxModal.classList.add("active");
    });
  });

  // 셔틀버스 [약도 보기] 버튼 클릭 시 팝업 띄우기 (하단 리스트 및 화살표 안뜨게 단독 팝업)
  const btnShuttleMap = document.getElementById("btnViewShuttleMap");
  if (btnShuttleMap) {
    btnShuttleMap.addEventListener("click", () => {
      if (lightboxImg) lightboxImg.src = "assets/shuttle_map.jpg";
      if (thumbStrip) thumbStrip.style.display = "none";
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      lightboxModal.classList.add("active");
    });
  }

  function showLightboxImage() {
    if (lightboxImg) {
      lightboxImg.src = galleryImages[currentGalleryIdx];
    }
    // 섬네일 하이라이트 및 자동 스크롤
    if (thumbStrip) {
      const thumbs = thumbStrip.querySelectorAll(".lightbox-thumb-item");
      thumbs.forEach((t, i) => {
        if (i === currentGalleryIdx) {
          t.classList.add("active");
          t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } else {
          t.classList.remove("active");
        }
      });
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      lightboxModal.classList.remove("active");
    });
  }

  // 팝업 배경/여백 클릭 시 닫기
  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal || e.target.classList.contains("lightbox-content")) {
        lightboxModal.classList.remove("active");
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentGalleryIdx = (currentGalleryIdx - 1 + galleryImages.length) % galleryImages.length;
      showLightboxImage();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentGalleryIdx = (currentGalleryIdx + 1) % galleryImages.length;
      showLightboxImage();
    });
  }
}

// --------------------------------------------------------------------------
// 7. GUESTBOOK CRUD (LOCAL STORAGE)
// --------------------------------------------------------------------------
const SAMPLE_GUESTBOOK = [];

function initGuestbook() {
  const gbListEl = document.getElementById("guestbookList");
  const form = document.getElementById("guestbookForm");

  function getStoredGuestbook() {
    const data = localStorage.getItem("wedding_guestbook");
    return data ? JSON.parse(data) : SAMPLE_GUESTBOOK;
  }

  function renderGuestbook() {
    const list = getStoredGuestbook();
    if (!gbListEl) return;
    if (list.length === 0) {
      gbListEl.innerHTML = `
        <div class="guestbook-empty" style="text-align:center; padding: 24px 10px; color: var(--text-sub); font-size: 0.85rem;">
          첫 번째 축하 메시지의 주인공이 되어주세요! ❤️
        </div>
      `;
      return;
    }
    gbListEl.innerHTML = list.map(item => `
      <div class="guestbook-card">
        <div class="gb-header">
          <span class="gb-author">${escapeHtml(item.name)}</span>
          <span class="gb-stars">${item.rating || '⭐⭐⭐⭐⭐'}</span>
        </div>
        <div class="gb-message">${escapeHtml(item.message)}</div>
        <div class="gb-date">${item.date}</div>
      </div>
    `).join("");
  }

  function fetchGuestbookFromGoogleSheets() {
    if (!GOOGLE_SHEETS_WEBAPP_URL) return;
    fetch(GOOGLE_SHEETS_WEBAPP_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          localStorage.setItem("wedding_guestbook", JSON.stringify(data));
          renderGuestbook();
        }
      })
      .catch(err => console.log("Fetch guestbook sync error:", err));
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("gbName");
      const msgInput = document.getElementById("gbMessage");

      const name = nameInput.value.trim();
      const message = msgInput.value.trim();

      if (!name || !message) {
        showToast("⚠️ 축하 메시지와 성함을 입력해 주세요.");
        return;
      }

      const list = getStoredGuestbook();
      const today = new Date();
      const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

      // 구글 시트로 실시간 전송
      sendToGoogleSheets({
        type: "guestbook",
        author: name,
        content: message
      });

      list.unshift({
        name,
        message,
        date: dateStr,
        rating: "⭐⭐⭐⭐⭐"
      });

      localStorage.setItem("wedding_guestbook", JSON.stringify(list));
      nameInput.value = "";
      msgInput.value = "";
      renderGuestbook();
      showToast("❤️ 소중한 축하 메시지가 등록되었습니다!");

      setTimeout(() => {
        fetchGuestbookFromGoogleSheets();
      }, 1200);
    });
  }

  renderGuestbook();
  fetchGuestbookFromGoogleSheets();
}

// --------------------------------------------------------------------------
// 8. CLIPBOARD COPY & TOAST NOTIFICATION
// --------------------------------------------------------------------------
function copyToClipboard(text, msg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(msg || "📋 클립보드에 복사되었습니다.");
  }).catch(() => {
    // Fallback
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showToast(msg || "📋 클립보드에 복사되었습니다.");
  });
}

function showToast(text) {
  let toast = document.getElementById("toastMsg");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastMsg";
    toast.className = "toast-msg";
    document.body.appendChild(toast);
  }

  toast.innerText = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

// Window global functions for inline onclick handlers
window.copyAddress = function() {
  copyToClipboard(WEDDING_CONFIG.venue.address, "📍 예식장 주소가 복사되었습니다.");
};

window.copyAccount = function(num) {
  copyToClipboard(num, "💳 계좌번호가 복사되었습니다.");
};

function initScrollAnimations() {
  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
}
