/**
 * MK INSUVESTA SERVICES — NFC DIGITAL CARD JAVASCRIPT ENGINE
 * Handles vCard Generation, QR Code, Interactive SIP & EMI Calculators, 
 * Tab Switching, and WhatsApp Lead Routing.
 */

// Contact Master Record
const CONTACT_DATA = {
  fullName: "Mukesh K. Brahmbhatt",
  firstName: "Mukesh",
  lastName: "Brahmbhatt",
  middleName: "K.",
  organization: "MK InsuVesta Services",
  tagline: "Insure with Confidence, Investment with Ease",
  title: "AMFI Registered Mutual Fund Distributor & Financial Advisor",
  phone: "+91 98989 98238",
  cleanPhone: "919898998238",
  email: "mksh.brahmbhatt@gmail.com",
  street: "Flat No-K502, Anand ilyf, Nr. Vaishnodevi Underpass, Vaishnodevi to Zundal Circle, Tragad, S.P. Ring Road",
  city: "Ahmedabad",
  state: "Gujarat",
  postalCode: "382470",
  country: "India",
  facebook: "https://www.facebook.com/share/1CqA5ZW2k8/",
  instagram: "https://www.instagram.com/mksh.brahmbhatt?utm_source=qr&stkn=MWRuNmp3dms2Zmw4bg==",
  notes: "AMFI Registered Mutual Fund Distributor (NJ Wealth Partner) | LIC Life Insurance Advisor | TATA AIG General Insurance Advisor | HDFC Pension Agent (NPS) | Andromeda Loan DSA Partner (Home, Business, Personal Loans)"
};

// Initialize DOM Events
document.addEventListener("DOMContentLoaded", () => {
  initLogoAutoDetect();
  initProfileImageAutoDetect();
  initTabNavigation();
  initContactDownloadButtons();
  initQrModalAndSharing();
  initSipCalculator();
  initEmiCalculator();
  initYear();
});

/**
 * 0. Smart Profile Photo Auto-Detect (.jpg, .jpeg, .png, .webp)
 */
function initProfileImageAutoDetect() {
  const avatar = document.getElementById("avatarImg");
  const ring = document.querySelector(".avatar-ring");
  if (!avatar) return;

  const candidateFormats = [
    "profile.jpg",
    "profile.jpeg",
    "profile.png",
    "profile.webp",
    "profile.JPG",
    "profile.JPEG",
    "profile.PNG",
    "assets/profile.jpg",
    "assets/profile.jpeg",
    "assets/profile.png"
  ];

  let index = 0;

  function tryNext() {
    if (index < candidateFormats.length) {
      const src = candidateFormats[index++];
      const testImg = new Image();
      testImg.onload = function() {
        avatar.src = src;
        avatar.style.display = "block";
        if (ring) ring.classList.remove("use-svg-fallback");
      };
      testImg.onerror = function() {
        tryNext();
      };
      testImg.src = src;
    } else {
      // If no local image file found, show luxury seal
      if (ring) ring.classList.add("use-svg-fallback");
    }
  }

  tryNext();
}

/**
 * 0.1 Smart Logo Auto-Detect (.png, .jpg, .jpeg, .webp)
 */
function initLogoAutoDetect() {
  const logoImg = document.getElementById("bannerLogoImg");
  const fallback = document.getElementById("svgLogoFallback");
  if (!logoImg) return;

  const candidateLogos = [
    "logo.png",
    "logo.jpg",
    "logo.jpeg",
    "logo.webp",
    "logo.PNG",
    "logo.JPG",
    "logo.JPEG",
    "assets/logo.png",
    "assets/logo.jpg"
  ];

  let lIndex = 0;

  function tryNextLogo() {
    if (lIndex < candidateLogos.length) {
      const src = candidateLogos[lIndex++];
      const testImg = new Image();
      testImg.onload = function() {
        logoImg.src = src;
        logoImg.style.display = "block";
        if (fallback) fallback.style.display = "none";
      };
      testImg.onerror = function() {
        tryNextLogo();
      };
      testImg.src = src;
    } else {
      logoImg.style.display = "none";
      if (fallback) fallback.style.display = "flex";
    }
  }

  tryNextLogo();
}

// Update Copyright Year
function initYear() {
  const yrEl = document.getElementById("currentYear");
  if (yrEl) yrEl.textContent = new Date().getFullYear();
}

/**
 * 1. vCard 3.0 Generation (.vcf file download)
 */
function downloadVCard() {
  const vCardContent = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${CONTACT_DATA.lastName};${CONTACT_DATA.firstName};${CONTACT_DATA.middleName};;`,
    `FN:${CONTACT_DATA.fullName}`,
    `ORG:${CONTACT_DATA.organization};`,
    `TITLE:${CONTACT_DATA.title}`,
    `TEL;TYPE=CELL,VOICE,PREF:${CONTACT_DATA.phone}`,
    `TEL;TYPE=WORK,VOICE:${CONTACT_DATA.phone}`,
    `EMAIL;TYPE=INTERNET,WORK,PREF:${CONTACT_DATA.email}`,
    `ADR;TYPE=WORK,POSTAL,PARCEL:;;${CONTACT_DATA.street};${CONTACT_DATA.city};${CONTACT_DATA.state};${CONTACT_DATA.postalCode};${CONTACT_DATA.country}`,
    `URL;TYPE=Facebook:${CONTACT_DATA.facebook}`,
    `URL;TYPE=Instagram:${CONTACT_DATA.instagram}`,
    `NOTE:${CONTACT_DATA.notes}`,
    "END:VCARD"
  ].join("\r\n");

  const blob = new Blob([vCardContent], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.setAttribute("download", `${CONTACT_DATA.fullName.replace(/\s+/g, "_")}_MK_InsuVesta.vcf`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);

  showToast("Contact (.vcf) downloaded! Open to save to Phone.");
}

function initContactDownloadButtons() {
  const saveBtn = document.getElementById("saveContactBtn");
  const stickySaveBtn = document.getElementById("stickySaveContactBtn");
  const modalSaveBtn = document.getElementById("modalSaveContactBtn");

  if (saveBtn) saveBtn.addEventListener("click", downloadVCard);
  if (stickySaveBtn) stickySaveBtn.addEventListener("click", downloadVCard);
  if (modalSaveBtn) modalSaveBtn.addEventListener("click", downloadVCard);
}

/**
 * 2. Tab Navigation System
 */
function initTabNavigation() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");

      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
        targetPane.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function openCalculatorTab(type) {
  const calcTabBtn = document.querySelector('[data-target="tab-calculators"]');
  if (calcTabBtn) calcTabBtn.click();
  switchCalculator(type);
}

function openServiceDetail(serviceKey) {
  const servicesTabBtn = document.querySelector('[data-target="tab-services"]');
  if (servicesTabBtn) servicesTabBtn.click();
  setTimeout(() => {
    const card = document.querySelector(`.service-card[data-service="${serviceKey}"]`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.style.transform = "scale(1.03)";
      card.style.borderColor = "var(--gold-primary)";
      setTimeout(() => {
        card.style.transform = "";
        card.style.borderColor = "";
      }, 1500);
    }
  }, 100);
}

/**
 * 3. QR Code & Web Share API
 */
let qrCodeInstance = null;

function initQrModalAndSharing() {
  const qrBtn = document.getElementById("qrBtn");
  const shareBtn = document.getElementById("shareBtn");
  const qrModal = document.getElementById("qrModal");
  const closeQrModal = document.getElementById("closeQrModal");
  const shareUrlInput = document.getElementById("shareUrlInput");
  const copyUrlBtn = document.getElementById("copyUrlBtn");
  const nativeShareBtn = document.getElementById("nativeShareBtn");

  const currentUrl = window.location.href;
  if (shareUrlInput) shareUrlInput.value = currentUrl;

  function openQr() {
    qrModal.classList.add("show");
    const container = document.getElementById("qrcodeContainer");
    if (container && !qrCodeInstance && typeof QRCode !== "undefined") {
      container.innerHTML = "";
      qrCodeInstance = new QRCode(container, {
        text: currentUrl,
        width: 170,
        height: 170,
        colorDark: "#060e1d",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }
  }

  function closeQr() {
    qrModal.classList.remove("show");
  }

  if (qrBtn) qrBtn.addEventListener("click", openQr);
  if (closeQrModal) closeQrModal.addEventListener("click", closeQr);

  // Close on backdrop click
  if (qrModal) {
    qrModal.addEventListener("click", (e) => {
      if (e.target === qrModal) closeQr();
    });
  }

  // Web Share API
  async function triggerNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mukesh K. Brahmbhatt | MK InsuVesta Services",
          text: "Connect with Mukesh K. Brahmbhatt - AMFI Registered Mutual Fund Distributor, LIC Advisor, TATA AIG General Insurance & Andromeda Loans Partner.",
          url: currentUrl
        });
      } catch (err) {
        console.log("Share skipped", err);
      }
    } else {
      openQr();
    }
  }

  if (shareBtn) shareBtn.addEventListener("click", triggerNativeShare);
  if (nativeShareBtn) nativeShareBtn.addEventListener("click", triggerNativeShare);

  if (copyUrlBtn) {
    copyUrlBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(currentUrl).then(() => {
        showToast("Card link copied to clipboard!");
      }).catch(() => {
        showToast("Link: " + currentUrl);
      });
    });
  }
}

/**
 * 4. Interactive SIP Calculator
 */
function initSipCalculator() {
  const amountSlider = document.getElementById("sipAmount");
  const rateSlider = document.getElementById("sipRate");
  const yearsSlider = document.getElementById("sipYears");

  const amountDisplay = document.getElementById("sipAmountDisplay");
  const rateDisplay = document.getElementById("sipRateDisplay");
  const yearsDisplay = document.getElementById("sipYearsDisplay");

  const investedEl = document.getElementById("sipInvested");
  const returnsEl = document.getElementById("sipReturns");
  const totalValueEl = document.getElementById("sipTotalValue");

  function calculateSIP() {
    const P = parseFloat(amountSlider.value);
    const annualRate = parseFloat(rateSlider.value);
    const years = parseFloat(yearsSlider.value);

    // Displays
    amountDisplay.textContent = Number(P).toLocaleString("en-IN");
    rateDisplay.textContent = annualRate;
    yearsDisplay.textContent = years;

    const n = years * 12; // Total months
    const i = (annualRate / 100) / 12; // Monthly interest rate

    // SIP Future Value formula: M = P * [ ( (1 + i)^n - 1 ) / i ] * (1 + i)
    const futureValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const totalInvested = P * n;
    const wealthGained = futureValue - totalInvested;

    investedEl.textContent = formatIndianCurrency(totalInvested);
    returnsEl.textContent = formatIndianCurrency(wealthGained);
    totalValueEl.textContent = formatIndianCurrency(futureValue);
  }

  if (amountSlider && rateSlider && yearsSlider) {
    amountSlider.addEventListener("input", calculateSIP);
    rateSlider.addEventListener("input", calculateSIP);
    yearsSlider.addEventListener("input", calculateSIP);
    calculateSIP();
  }
}

/**
 * 5. Interactive Loan EMI Calculator
 */
function initEmiCalculator() {
  const loanSlider = document.getElementById("loanAmount");
  const rateSlider = document.getElementById("loanRate");
  const tenureSlider = document.getElementById("loanTenure");

  const loanDisplay = document.getElementById("loanAmountDisplay");
  const rateDisplay = document.getElementById("loanRateDisplay");
  const tenureDisplay = document.getElementById("loanTenureDisplay");

  const emiEl = document.getElementById("loanMonthlyEmi");
  const interestEl = document.getElementById("loanTotalInterest");
  const paymentEl = document.getElementById("loanTotalPayment");

  function calculateEMI() {
    const P = parseFloat(loanSlider.value);
    const annualRate = parseFloat(rateSlider.value);
    const years = parseFloat(tenureSlider.value);

    // Displays
    loanDisplay.textContent = Number(P).toLocaleString("en-IN");
    rateDisplay.textContent = annualRate;
    tenureDisplay.textContent = years;

    const n = years * 12; // months
    const r = (annualRate / 100) / 12; // monthly interest

    // EMI formula: E = P * r * (1 + r)^n / [ (1 + r)^n - 1 ]
    let monthlyEmi = 0;
    if (r === 0) {
      monthlyEmi = P / n;
    } else {
      monthlyEmi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = monthlyEmi * n;
    const totalInterest = totalPayment - P;

    emiEl.textContent = formatIndianCurrency(monthlyEmi);
    interestEl.textContent = formatIndianCurrency(totalInterest);
    paymentEl.textContent = formatIndianCurrency(totalPayment);
  }

  if (loanSlider && rateSlider && tenureSlider) {
    loanSlider.addEventListener("input", calculateEMI);
    rateSlider.addEventListener("input", calculateEMI);
    tenureSlider.addEventListener("input", calculateEMI);
    calculateEMI();
  }
}

function switchCalculator(type) {
  const btnSip = document.getElementById("btnShowSip");
  const btnEmi = document.getElementById("btnShowEmi");
  const containerSip = document.getElementById("sipCalcContainer");
  const containerEmi = document.getElementById("emiCalcContainer");

  if (type === "sip") {
    btnSip.classList.add("active");
    btnEmi.classList.remove("active");
    containerSip.classList.remove("hidden");
    containerEmi.classList.add("hidden");
  } else {
    btnEmi.classList.add("active");
    btnSip.classList.remove("active");
    containerEmi.classList.remove("hidden");
    containerSip.classList.add("hidden");
  }
}

/**
 * 6. Helper: Indian Currency Formatter
 */
function formatIndianCurrency(num) {
  const rounded = Math.round(num);
  return "₹ " + rounded.toLocaleString("en-IN");
}

/**
 * 7. WhatsApp Routing Handlers
 */
function inquireService(serviceName) {
  const msg = encodeURIComponent(`Hello Mukesh ji, I am interested in *${serviceName}* from MK InsuVesta Services. Please provide me with details and guidance.`);
  window.open(`https://wa.me/${CONTACT_DATA.cleanPhone}?text=${msg}`, "_blank");
}

function inquireSipPlan() {
  const amount = document.getElementById("sipAmountDisplay").textContent;
  const rate = document.getElementById("sipRateDisplay").textContent;
  const years = document.getElementById("sipYearsDisplay").textContent;
  const maturity = document.getElementById("sipTotalValue").textContent;

  const msg = encodeURIComponent(`Hello Mukesh ji, I calculated a Mutual Fund SIP plan on your MK InsuVesta Digital Card:
- *Monthly SIP*: ₹ ${amount}
- *Expected Return*: ${rate}%
- *Tenure*: ${years} Years
- *Estimated Maturity*: ${maturity}

I would like to start this SIP with your AMFI guidance. Please help me proceed.`);

  window.open(`https://wa.me/${CONTACT_DATA.cleanPhone}?text=${msg}`, "_blank");
}

function inquireLoanEligibility() {
  const amount = document.getElementById("loanAmountDisplay").textContent;
  const rate = document.getElementById("loanRateDisplay").textContent;
  const tenure = document.getElementById("loanTenureDisplay").textContent;
  const emi = document.getElementById("loanMonthlyEmi").textContent;

  const msg = encodeURIComponent(`Hello Mukesh ji, I checked Loan EMI calculation on your MK InsuVesta Digital Card:
- *Loan Amount*: ₹ ${amount}
- *Interest Rate*: ${rate}%
- *Tenure*: ${years} Years
- *Monthly EMI*: ${emi}

Please let me know Andromeda DSA's best loan offers and eligibility.`);

  window.open(`https://wa.me/${CONTACT_DATA.cleanPhone}?text=${msg}`, "_blank");
}

function handleLeadFormSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("clientName").value.trim();
  const phone = document.getElementById("clientPhone").value.trim();
  const service = document.getElementById("serviceInterest").value;
  const message = document.getElementById("clientMessage").value.trim();

  let formattedMsg = `*New Consultation Request (MK InsuVesta)*\n` +
    `👤 *Name*: ${name}\n` +
    `📱 *Phone*: ${phone}\n` +
    `💼 *Service*: ${service}`;

  if (message) {
    formattedMsg += `\n📝 *Notes*: ${message}`;
  }

  window.open(`https://wa.me/${CONTACT_DATA.cleanPhone}?text=${encodeURIComponent(formattedMsg)}`, "_blank");
  showToast("Routing to WhatsApp...");
}

/**
 * 8. Toast Helper
 */
function showToast(message) {
  const toast = document.getElementById("toastMessage");
  const text = document.getElementById("toastText");
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}
