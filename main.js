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
  initTicketQrCode();
});

function initTicketQrCode() {
  const qrImg = document.getElementById('cgvTicketQrImg');
  if (qrImg) {
    const targetUrl = encodeURIComponent("https://mobileinvitation-pink.vercel.app/");
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${targetUrl}`;
  }
}

// --------------------------------------------------------------------------
// 1. BACKGROUND MUSIC & INTRO SPLASH
// --------------------------------------------------------------------------
let audioCtx = null;
let isAudioPlaying = false;
let audioEl = null;
let synthTimer = null;

function startBGM() {
  audioEl = document.getElementById("bgmAudio");
  const audioToggleBtn = document.getElementById("audioToggleBtn");
  if (!audioEl) return;

  audioEl.muted = false;
  audioEl.volume = 1.0;
  audioEl.play().then(() => {
    isAudioPlaying = true;
    if (audioToggleBtn) {
      audioToggleBtn.classList.add("playing");
      audioToggleBtn.style.color = "#E50914";
    }
  }).catch((e) => {
    console.log("Audio play error:", e);
  });
}

function stopBGM() {
  audioEl = document.getElementById("bgmAudio");
  const audioToggleBtn = document.getElementById("audioToggleBtn");
  isAudioPlaying = false;
  if (audioToggleBtn) {
    audioToggleBtn.classList.remove("playing");
    audioToggleBtn.style.color = "#FFFFFF";
  }
  if (audioEl) {
    audioEl.pause();
  }
  showToast("🔇 배경음악이 일시정지되었습니다.");
}

function toggleBGM() {
  audioEl = document.getElementById("bgmAudio");
  if (audioEl && !audioEl.paused) {
    stopBGM();
  } else {
    startBGM();
    showToast("🎵 배경음악이 시작되었습니다.");
  }
}

function initAudioSynth() {
  const tudumBtn = document.getElementById("btnTudumStart");
  const splashScreen = document.getElementById("splashScreen");
  const audioToggleBtn = document.getElementById("audioToggleBtn");

  const unlockAudioOnce = (e) => {
    if (e && e.target && e.target.closest("#audioToggleBtn")) return;
    startBGM();
    ["touchstart", "pointerdown", "click"].forEach(evt => {
      window.removeEventListener(evt, unlockAudioOnce);
      document.removeEventListener(evt, unlockAudioOnce);
    });
  };

  // 1. 접속 시 즉시 재생 시도
  startBGM();

  // 2. 첫 터치 시 1회만 오디오 락 해제
  ["touchstart", "pointerdown", "click"].forEach(evt => {
    window.addEventListener(evt, unlockAudioOnce, { once: true });
    document.addEventListener(evt, unlockAudioOnce, { once: true });
  });

  if (tudumBtn) {
    tudumBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      startBGM();

      // 시청하기 클릭 시 화면 스크롤을 항상 최상단으로 이동
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;

      if (splashScreen) {
        splashScreen.classList.add("hidden");
        setTimeout(() => {
          splashScreen.remove();
        }, 900);
      }
    });
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleBGM(); // 음표 버튼 클릭 시 BGM 켜기/끄기 100% 토글
    });
  }

  // ── 웹화면을 닫거나 다른 앱/탭으로 전환 시 배경음악 100% 즉시 정지 ──
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && audioEl && !audioEl.paused) {
      audioEl.pause();
      isAudioPlaying = false;
      if (audioToggleBtn) {
        audioToggleBtn.classList.remove("playing");
        audioToggleBtn.style.color = "#FFFFFF";
      }
    }
  });

  window.addEventListener("pagehide", () => {
    if (audioEl) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
  });

  window.addEventListener("beforeunload", () => {
    if (audioEl) {
      audioEl.pause();
    }
  });
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
      lockBodyScroll();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      rsvpModal.classList.remove("active");
      unlockBodyScroll();
    });
  }

  // 모달 바깥 여백 클릭 시 닫기
  if (rsvpModal) {
    rsvpModal.addEventListener("click", (e) => {
      if (e.target === rsvpModal) {
        rsvpModal.classList.remove("active");
        unlockBodyScroll();
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
      unlockBodyScroll();
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
      if (lightboxImg) {
        lightboxImg.src = "";
        lightboxImg.src = "assets/shuttle_map.jpg";
      }
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
    closeBtn.onclick = () => {
      window.closeLightbox();
    };
  }

  // 팝업 배경/여백 클릭 시 닫기
  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal || e.target.classList.contains("lightbox-content")) {
        window.closeLightbox();
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
// 6b. CAST ACCORDION (출연진 접기/펼치기)
// --------------------------------------------------------------------------
window.toggleCastSection = function() {
  const btn     = document.getElementById('castToggleBtn');
  const content = document.getElementById('castContent');
  if (!btn || !content) return;

  const isOpen = content.classList.contains('open');

  if (isOpen) {
    content.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  } else {
    content.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
};

// --------------------------------------------------------------------------
// 6c. GROUP GALLERY POPUP (비하인드컷 그룹 팝업)

// ── 모달 오픈/클로즈 시 바깥 메인페이지 스크롤 제어 ──────
function lockBodyScroll() {
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  const activeModals = document.querySelectorAll(
    '.modal-overlay.active, .venue-modal-overlay.active, .rsvp-modal-overlay.active, .group-gallery-overlay.active, .lightbox-modal.active'
  );
  if (activeModals.length === 0) {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
}

// 팝업 열려 있을 때 배경(여백) touchmove 스크롤 완벽 차단 (내부 스크롤 가능 영역은 허용)
document.addEventListener("touchmove", (e) => {
  const activeOverlay = document.querySelector(
    ".modal-overlay.active, .venue-modal-overlay.active, .rsvp-modal-overlay.active, .group-gallery-overlay.active, .lightbox-modal.active"
  );
  if (activeOverlay) {
    const scrollable = e.target.closest(
      ".cgv-ticket-scroll-body, .cgv-poster-banner, .cgv-ticket-white-card, .cgv-ticket-modal-card, .cgv-venue-modal-body, .rsvp-modal-card, .group-gallery-card, .lightbox-thumb-strip, .cgv-collapsible-section, .wedding-calendar-box"
    );
    if (!scrollable) {
      if (e.cancelable) e.preventDefault();
    }
  }
}, { passive: false });

window.openGroupGallery = function(groupId) {
  const num = groupId.replace('group', '');
  const modal = document.getElementById('groupModal' + num);
  if (modal) modal.classList.add('active');
  lockBodyScroll();
};

window.closeGroupGallery = function(groupId, event) {
  if (event && event.target !== event.currentTarget) return;
  const num = groupId.replace('group', '');
  const modal = document.getElementById('groupModal' + num);
  if (modal) modal.classList.remove('active');
  unlockBodyScroll();
};

window.openLightbox = function(src, groupSrcs) {
  // 열려있는 그룹 갤러리 팝업 먼저 닫기
  document.querySelectorAll('.group-gallery-overlay.active').forEach(el => {
    el.classList.remove('active');
  });

  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg   = document.getElementById('lightboxImg');
  const thumbStrip    = document.getElementById('lightboxThumbStrip');
  const dotsEl        = document.getElementById('lightboxDots');

  if (!lightboxModal || !lightboxImg) return;

  // 비하인드 컷 전체 28장 연속 스와이프용 이미지 리스트 (Couple -> Poster & Garden -> River)
  const ALL_BEHIND_IMAGES = [
    // Group 1: Couple (couple_main, couple1~3, groom1~3, bride1~8 - 15장)
    'assets/couple_main.jpg',
    'assets/couple1.jpg',
    'assets/couple2.JPG',
    'assets/couple3.jpg',
    'assets/groom1.jpg',
    'assets/groom2.JPG',
    'assets/groom3.JPG',
    'assets/bride1.jpg',
    'assets/bride2.jpg',
    'assets/bride3.jpg',
    'assets/bride4.jpg',
    'assets/bride5.JPG',
    'assets/bride6.jpg',
    'assets/bride7.JPG',
    'assets/bride8.JPG',

    // Group 2: Garden (garden1~6 - 6장)
    'assets/garden1.jpg',
    'assets/garden2.jpg',
    'assets/garden3.JPG',
    'assets/garden4.JPG',
    'assets/garden5.jpg',
    'assets/garden6.JPG',

    // Group 3: River (6장)
    'assets/river_main.jpg',
    'assets/river1.jpg',
    'assets/river2.jpg',
    'assets/river3.jpg',
    'assets/river4.JPG',
    'assets/river5.jpg'
  ];

  let images = ALL_BEHIND_IMAGES;
  let idx = images.indexOf(src);
  if (idx < 0) {
    images = (groupSrcs && groupSrcs.length > 0) ? groupSrcs : [src];
    idx = images.indexOf(src);
    if (idx < 0) idx = 0;
  }
  let isTransitioning = false;

  // ── 도트 (여러장일 때만) ──────────────────
  if (dotsEl) dotsEl.innerHTML = '';

  // ── 하단 썸네일 스트립 ────────────────────
  function buildThumbs() {
    if (!thumbStrip) return;
    if (images.length <= 1) {
      thumbStrip.style.display = 'none';
      thumbStrip.innerHTML = '';
      return;
    }
    thumbStrip.innerHTML = images.map((imgSrc, i) => `
      <div class="lightbox-thumb-item${i === idx ? ' active' : ''}" data-i="${i}">
        <img src="${imgSrc}" alt="썸네일 ${i + 1}">
      </div>
    `).join('');
    thumbStrip.style.display = 'flex';

    thumbStrip.querySelectorAll('.lightbox-thumb-item').forEach(item => {
      item.addEventListener('click', () => goTo(parseInt(item.dataset.i)));
    });

    // 현재 활성 썸네일 중앙 스크롤
    const activeThumb = thumbStrip.querySelector('.lightbox-thumb-item.active');
    if (activeThumb) activeThumb.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }

  function updateThumbs() {
    if (!thumbStrip) return;
    thumbStrip.querySelectorAll('.lightbox-thumb-item').forEach((t, i) => {
      t.classList.toggle('active', i === idx);
    });
    const activeThumb = thumbStrip.querySelector('.lightbox-thumb-item.active');
    if (activeThumb) activeThumb.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }

  // ── 이미지 전환 (잔상 방지 무결점 로직) ─────
  function goTo(newIdx) {
    if (isTransitioning || newIdx === idx) return;
    isTransitioning = true;

    // 1. 기존 이미지를 완전 투명(opacity: 0) 상태로 페이드 아웃
    lightboxImg.style.transition = 'opacity 0.15s ease-out';
    lightboxImg.style.opacity = '0';

    setTimeout(() => {
      idx = (newIdx + images.length) % images.length;
      const targetSrc = images[idx];

      // 2. 새 이미지를 브라우저 메모리에 로드
      const tempImg = new Image();
      tempImg.src = targetSrc;

      const displayNextImage = () => {
        lightboxImg.src = targetSrc;
        updateThumbs();
        requestAnimationFrame(() => {
          lightboxImg.style.transition = 'opacity 0.2s ease-in';
          lightboxImg.style.opacity = '1';
          setTimeout(() => {
            isTransitioning = false;
          }, 200);
        });
      };

      if (tempImg.complete) {
        displayNextImage();
      } else {
        tempImg.onload = displayNextImage;
        tempImg.onerror = displayNextImage;
      }
    }, 150);
  }

  // ── 네비게이션 버튼 ──────────────────────
  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');

  if (prevBtn) {
    const newPrev = prevBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);
    newPrev.style.display = images.length > 1 ? 'flex' : 'none';
    newPrev.addEventListener('click', () => goTo(idx - 1));
  }
  if (nextBtn) {
    const newNext = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);
    newNext.style.display = images.length > 1 ? 'flex' : 'none';
    newNext.addEventListener('click', () => goTo(idx + 1));
  }

  // ── 터치 스와이프 ─────────────────────────
  let touchStartX = 0;
  let touchStartY = 0;
  const content = lightboxModal.querySelector('.lightbox-content');
  if (content) {
    content.ontouchstart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    content.ontouchend = (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx < 0) goTo(idx + 1);
        else         goTo(idx - 1);
      }
    };
  }

  // ── 초기 표시 ────────────────────────────
  lightboxImg.src = images[idx];
  lightboxImg.classList.remove('fade-out');
  buildThumbs();
  lightboxModal.classList.add('active');
};

window.closeLightbox = function() {
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg   = document.getElementById('lightboxImg');
  if (lightboxModal) {
    lightboxModal.classList.remove('active');
  }
  if (lightboxImg) {
    setTimeout(() => {
      lightboxImg.src = '';
    }, 200);
  }
  unlockBodyScroll();
};




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

// ── 티켓 모달 (손가락으로 쓸어내려 닫기 Swipe Down to Dismiss) ──
function initTicketSwipeDown() {
  const modal = document.getElementById('synopsisModal');
  const card  = modal ? modal.querySelector('.cgv-ticket-modal-card') : null;
  const handle = card ? card.querySelector('.cgv-bottom-sheet-handle') : null;
  if (!modal || !card) return;

  let startY = 0, currentY = 0, startTime = 0, isDragging = false;

  function onTouchStart(e) {
    // 버튼이나 폼 요소 클릭이면 스와이프 제스처 무시
    if (e.target.closest('button, input, select, textarea, a')) return;

    // 내부 스크롤 영역이 최상단일 때만 아래로 스와이프 닫기 작동
    const scrollable = e.target.closest('.cgv-ticket-body, .cgv-ticket-scroll, .cgv-venue-modal-body');
    if (scrollable && scrollable.scrollTop > 5) return;

    startY = e.touches[0].clientY;
    currentY = startY;
    startTime = Date.now();
    isDragging = true;
    card.classList.add('dragging');
  }

  function onTouchMove(e) {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const dy = currentY - startY;

    if (dy > 0) {
      // 아래로 끌어당길 때 손가락을 자연스럽게 따라 내려옴
      card.style.transform = `translateY(${dy}px)`;
    }
  }

  function closeDownwards() {
    card.style.transition = 'transform 0.28s cubic-bezier(0.4, 0, 1, 1)';
    card.style.transform = 'translateY(100%)';
    setTimeout(() => {
      modal.classList.remove('active');
      unlockBodyScroll();
      card.style.transform = '';
      card.style.transition = '';
    }, 280);
  }

  function onTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('dragging');

    const dy = currentY - startY;
    const dt = Date.now() - startTime;
    const velocity = dt > 0 ? dy / dt : 0; // 속도 (px/ms)

    // 60px 이상 아래로 쓸어내렸거나, 빠르게 아래로 튕긴(Flick) 경우 닫기
    if (dy > 60 || (dy > 25 && velocity > 0.3)) {
      closeDownwards();
    } else {
      // 60px 미만인 경우 원위치 복구
      card.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'translateY(0)';
      setTimeout(() => {
        card.style.transition = '';
      }, 250);
    }
  }

  // 핸들바 클릭 시에도 사르륵 닫힘
  if (handle) {
    handle.onclick = (e) => {
      e.stopPropagation();
      closeDownwards();
    };
  }

  // 카드 전체 영역 터치 이벤트 바인딩
  card.addEventListener('touchstart', onTouchStart, { passive: true });
  card.addEventListener('touchmove',  onTouchMove,  { passive: true });
  card.addEventListener('touchend',   onTouchEnd);
}

window.openSynopsisModal = function(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  const modal = document.getElementById('synopsisModal');
  if (modal) {
    modal.classList.add('active');
    lockBodyScroll();
    initTicketSwipeDown(); // 열 때마다 스와이프 제스처 초기화
  }
};

window.closeSynopsisModal = function(e) {
  const modal = document.getElementById('synopsisModal');
  const card  = modal ? modal.querySelector('.cgv-ticket-modal-card') : null;
  
  if (card) {
    card.style.transition = 'transform 0.28s cubic-bezier(0.4, 0, 1, 1)';
    card.style.transform = 'translateY(100%)';
    setTimeout(() => {
      if (modal) modal.classList.remove('active');
      unlockBodyScroll();
      card.style.transform = '';
      card.style.transition = '';
    }, 280);
  } else if (modal) {
    modal.classList.remove('active');
    unlockBodyScroll();
  }
};


window.openVenueModal = function(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  const modal = document.getElementById('venueModal');
  if (modal) {
    modal.classList.add('active');
    lockBodyScroll();
  }
};

window.closeVenueModal = function(e) {
  const modal = document.getElementById('venueModal');
  if (modal) {
    modal.classList.remove('active');
    unlockBodyScroll();
  }
};

window.openShuttleMap = function(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImg = document.getElementById("lightboxImg");
  const prevBtn = document.getElementById("lightboxPrevBtn");
  const nextBtn = document.getElementById("lightboxNextBtn");
  const thumbStrip = document.getElementById("lightboxThumbStrip");

  if (lightboxImg) {
    lightboxImg.src = "";
    lightboxImg.src = "assets/shuttle_map.jpg";
  }
  if (thumbStrip) thumbStrip.style.display = "none";
  if (prevBtn) prevBtn.style.display = "none";
  if (nextBtn) nextBtn.style.display = "none";
  if (lightboxModal) {
    lightboxModal.classList.add("active");
    lockBodyScroll();
  }
};

window.toggleCalendarSection = function() {
  const container = document.getElementById('cgvCalendarContainer');
  if (container) {
    container.classList.toggle('show');
  }
};

// ── 카카오톡 [위치 보기] 버튼 터치 시 네이버 지도 노블발렌티 삼성점으로 100% 즉시 이동 ──
(function checkNaverMapRedirect() {
  try {
    const href = window.location.href;
    const search = window.location.search;
    const hash = window.location.hash;

    if (search.indexOf('go=navermap') !== -1 || hash.indexOf('naverMap') !== -1 || href.indexOf('navermap') !== -1 || search.indexOf('go=kakaomap') !== -1) {
      window.location.replace("https://map.naver.com/v5/search/%EB%85%B8%EB%B8%94%EB%B0%9C%EB%A0%8C%ED%8B%B0%20%EC%82%BC%EC%84%B1%EC%A0%90");
    }
  } catch(e) {}
})();

// ── 🎟️ 공유 드롭다운 메뉴 토글 & 링크 복사 ──────────────────────────
window.toggleShareDropdown = function(e) {
  if (e) {
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  const menu = document.getElementById('shareDropdownMenu');
  if (menu) {
    menu.classList.toggle('active');
  }
};

window.copyShareLink = function() {
  const shareUrl = "https://mobileinvitation-pink.vercel.app";
  copyToClipboard(shareUrl, "🎟️ 청첩장 링크가 클립보드에 복사되었습니다.");
};

// 외부 영역 터치/클릭 시 공유 드롭다운 자동 닫기
document.addEventListener('click', (e) => {
  const menu = document.getElementById('shareDropdownMenu');
  if (menu && menu.classList.contains('active') && !e.target.closest('.cgv-share-dropdown-wrapper')) {
    menu.classList.remove('active');
  }
});

const KAKAO_JAVASCRIPT_APP_KEY = "42777bbeb7baf39ddbc931d9990aef3a";

window.shareTicketLink = function() {
  const shareUrl = "https://mobileinvitation-pink.vercel.app";
  const posterUrl = "https://mobileinvitation-pink.vercel.app/assets/Thumbnail.jpg?v=20261009_thumb";
  const title = "윤현진 ♥ 한지수 결혼합니다";
  const desc = "2026년 10월 9일 금요일 오후 1시\n노블발렌티 삼성점";

  // 1. 카카오 공식 SDK 실행 (대형 포스터 사진 + [청첩장 보기/위치 보기] 2개 버튼 카드)
  if (window.Kakao) {
    if (!window.Kakao.isInitialized()) {
      try {
        window.Kakao.init(KAKAO_JAVASCRIPT_APP_KEY);
      } catch (e) {
        console.log("Kakao init:", e);
      }
    }

    if (window.Kakao.isInitialized() && window.Kakao.Share) {
      try {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: title,
            description: desc,
            imageUrl: posterUrl,
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
          buttons: [
            {
              title: '청첩장 보기',
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
            {
              title: '위치 보기',
              link: {
                mobileWebUrl: shareUrl + '?go=navermap#naverMap',
                webUrl: shareUrl + '?go=navermap#naverMap',
              },
            },
          ],
        });
        return;
      } catch (err) {
        console.log("Kakao Share send error:", err);
      }
    }
  }

  // 2. Fallback: 스마트폰 기본 공유
  if (navigator.share) {
    navigator.share({ url: shareUrl }).catch(() => {});
  } else {
    copyToClipboard(shareUrl, "🎟️ 청첩장 링크가 클립보드에 복사되었습니다.");
  }
};

window.goToRsvpSection = function() {
  const modal = document.getElementById('synopsisModal');
  const card  = modal ? modal.querySelector('.cgv-ticket-modal-card') : null;

  if (card) {
    card.style.transition = 'transform 0.3s ease';
    card.style.transform = 'translateY(100%)';
  }

  setTimeout(() => {
    if (modal) {
      modal.classList.remove('active');
      if (card) {
        card.style.transform = '';
        card.style.transition = '';
      }
    }
    unlockBodyScroll();

    const rsvpSection = document.getElementById('rsvp');
    if (rsvpSection) {
      rsvpSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, 250);
};

window.goToAccountSection = function() {
  const modal = document.getElementById('synopsisModal');
  const card  = modal ? modal.querySelector('.cgv-ticket-modal-card') : null;

  if (card) {
    card.style.transition = 'transform 0.3s ease';
    card.style.transform = 'translateY(100%)';
  }

  // 마음 전하실 곳 계좌 아코디언 상자 전부 펼치기
  document.querySelectorAll('.account-box').forEach(box => {
    box.classList.add('open');
  });

  setTimeout(() => {
    if (modal) {
      modal.classList.remove('active');
      if (card) {
        card.style.transform = '';
        card.style.transition = '';
      }
    }
    unlockBodyScroll();

    const accSection = document.getElementById('accounts');
    if (accSection) {
      accSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, 250);
};

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
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
}
