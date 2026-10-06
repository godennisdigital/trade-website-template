const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const quoteForm = document.querySelector("#contact-form");
const phoneInput = document.querySelector("#phone-number");
const formStatus = document.querySelector("#form-status");
const year = document.querySelector("#current-year");

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element && value !== undefined && value !== null) {
    element.textContent = value;
  }
};

const setHtml = (selector, value) => {
  const element = document.querySelector(selector);
  if (element && value !== undefined && value !== null) {
    element.innerHTML = value;
  }
};

const setAttributeByConfig = (selector, attribute, value) => {
  const element = document.querySelector(selector);
  if (element && value !== undefined && value !== null) {
    element.setAttribute(attribute, value);
  }
};

const applyTheme = (theme) => {
  if (!theme) return;

  const root = document.documentElement;
  if (theme.colorScheme) {
    root.style.colorScheme = theme.colorScheme;
  }

  const palette = theme.colors || {};
  Object.entries(palette).forEach(([name, value]) => {
    root.style.setProperty(`--${name}`, value);
  });
};

const applyImages = (images) => {
  if (!images) return;

  const heroImage = document.querySelector('[data-config="heroImage"]');
  if (heroImage && images.hero) {
    if (images.hero.src) heroImage.src = images.hero.src;
    if (images.hero.srcset) heroImage.srcset = images.hero.srcset;
    if (images.hero.sizes) heroImage.sizes = images.hero.sizes;
    if (images.hero.alt) heroImage.alt = images.hero.alt;
  }

  const aboutImage = document.querySelector('[data-config="aboutImage"]');
  if (aboutImage && images.about) {
    if (images.about.src) aboutImage.src = images.about.src;
    if (images.about.srcset) aboutImage.srcset = images.about.srcset;
    if (images.about.sizes) aboutImage.sizes = images.about.sizes;
    if (images.about.alt) aboutImage.alt = images.about.alt;
  }

  (images.work || []).forEach((image, index) => {
    const element = document.querySelector(`[data-config="workImage-${index}"]`);
    if (!element) return;
    if (image.src) element.src = image.src;
    if (image.srcset) element.srcset = image.srcset;
    if (image.sizes) element.sizes = image.sizes;
    if (image.alt) element.alt = image.alt;
  });
};

const applyMap = (mapConfig) => {
  const mapFrame = document.querySelector('[data-config="serviceMap"]');
  if (!mapFrame || !mapConfig) return;
  if (mapConfig.title) mapFrame.title = mapConfig.title;
  if (mapConfig.src) mapFrame.src = mapConfig.src;
};

const applyQuoteFormOptions = (quoteConfig) => {
  const select = document.querySelector('[data-config="serviceSelect"]');
  if (!select || !quoteConfig) return;

  const options = quoteConfig.services || [];
  const defaultOption = quoteConfig.defaultOption || 'Select a service';
  select.innerHTML = `<option value="" disabled selected>${defaultOption}</option>`;

  options.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label;
    select.appendChild(opt);
  });
};

const applySlogans = (slogans) => {
  if (!slogans) return;

  const entries = {
    imageCaption: '[data-config="imageCaption"]',
    aboutTagline: '[data-config="aboutTagline"]',
    mapTag: '[data-config="areaMapTag"]',
    footerTagline: '[data-config="footerTagline"]',
    businessTagline: '[data-config="heroProofBody"]'
  };

  Object.entries(entries).forEach(([key, selector]) => {
    const value = slogans[key];
    if (value !== undefined && value !== null) {
      const element = document.querySelector(selector);
      if (element) element.textContent = value;
    }
  });
};

const applyConfig = (config) => {
  if (!config) {
    return;
  }

  const business = config.business || {};
  const seo = config.seo || {};
  const hero = config.hero || {};
  const about = config.about || {};
  const area = config.area || {};
  const work = config.work || {};
  const reviews = config.reviews || {};
  const quote = config.quote || {};
  const footer = config.footer || {};

  applyTheme(config.theme);
  applyImages(config.images);
  applyMap(config.map);
  applyQuoteFormOptions(config.quote);
  applySlogans(config.slogans);

  if (seo.title) {
    document.title = seo.title;
  }

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && seo.description) {
    metaDescription.setAttribute('content', seo.description);
  }

  if (config.notice) {
    setHtml('[data-config="noticeText"]', config.notice.text.replace('·', '<span>·</span>'));
    setText('[data-config="noticeLink"]', config.notice.linkText);
  }

  setText('[data-config="brandName"]', business.brandName || business.name || 'APEX');
  setText('[data-config="brandTagline"]', business.brandTagline || 'PLUMBING & HEATING');
  setText('[data-config="brandInitial"]', business.brandInitial || 'A');
  setAttributeByConfig('[data-config="brandHomeLabel"]', 'aria-label', `${business.name || 'Business'} home`);

  document.querySelectorAll('[data-config-attr="href:phoneHref"]').forEach((element) => {
    element.href = `tel:${business.phone || '+440000000000'}`;
  });

  setHtml('[data-config="navPhone"]', `<span aria-hidden="true">☎</span> ${business.phoneDisplay || business.phone || '020 7946 0958'}`);
  setHtml('[data-config="heroTitle"]', hero.title || 'When water won\'t wait, <em>we\'re already on our way.</em>');
  setText('[data-config="heroEyebrow"]', hero.eyebrow || 'South London\'s local plumbing team');
  setText('[data-config="heroLede"]', hero.lede || 'Fast, reliable plumbing and heating repairs.');
  setHtml('[data-config="heroPrimaryButton"]', `${hero.primaryButton || 'Call our team'} <span aria-hidden="true">↗</span>`);
  setHtml('[data-config="heroSecondaryButton"]', `${hero.secondaryButton || 'Request a free quote'} <span aria-hidden="true">↓</span>`);
  setText('[data-config="heroProofTitle"]', hero.proofTitle || 'Trusted across South London');
  setText('[data-config="heroProofBody"]', hero.proofBody || 'Friendly help, straightforward pricing');
  setText('[data-config="heroImageNoteTitle"]', hero.imageNoteTitle || 'Here when you need us');
  setText('[data-config="heroImageNoteBody"]', hero.imageNoteBody || 'Emergency callouts, 24/7');

  (config.trustStrip || []).forEach((item, index) => {
    const selector = `[data-config="trustStrip-${index}"]`;
    const element = document.querySelector(selector);
    if (element) {
      element.innerHTML = `<span aria-hidden="true">✳</span> ${item}`;
    }
  });

  (config.services || []).forEach((service, index) => {
    const titleSelector = `[data-config="service-title-${index}"]`;
    const descSelector = `[data-config="service-description-${index}"]`;
    const titleElement = document.querySelector(titleSelector);
    const descElement = document.querySelector(descSelector);
    if (titleElement) titleElement.textContent = service.title || '';
    if (descElement) descElement.textContent = service.description || '';
  });

  setText('[data-config="aboutEyebrow"]', about.eyebrow || 'A little about Apex');
  setHtml('[data-config="aboutHeading"]', about.heading || 'Respect for your home.<br><em>Care in every detail.</em>');
  setText('[data-config="aboutIntro"]', about.intro || '');
  setText('[data-config="aboutSupporting"]', about.supporting || '');
  setHtml('[data-config="aboutCta"]', `${about.cta || 'Tell us what you need'} <span aria-hidden="true">↗</span>`);
  setText('[data-config="aboutTagline"]', about.tagline || 'BUILT ON TRUST, NOT SHORTCUTS.');
  setHtml('[data-config="aboutExperienceYears"]', `${about.experienceYears || '15'}<span>${about.experienceSuffix || '+'}</span>`);
  setHtml('[data-config="aboutExperienceLabel"]', (about.experienceLabel || 'YEARS<br>ON THE TOOLS').replace('\n', '<br>'));

  setText('[data-config="areaEyebrow"]', area.eyebrow || 'Close by, ready to help');
  setHtml('[data-config="areaHeading"]', area.heading || 'South London<br><em>is our home turf.</em>');
  setText('[data-config="areaDescription"]', area.description || '');
  setText('[data-config="areaCta"]', `${area.cta || 'Check your postcode'} `);
  setHtml('[data-config="areaCta"]', `${area.cta || 'Check your postcode'} <span aria-hidden="true">↗</span>`);
  (area.list || []).forEach((item, index) => {
    const element = document.querySelector(`[data-config="area-item-${index}"]`);
    if (element) element.textContent = item;
  });
  setText('[data-config="areaMapTag"]', area.mapTag || 'LOCAL TEAM, LOCAL KNOW-HOW');

  setText('[data-config="workEyebrow"]', work.eyebrow || 'A few jobs, done right');
  setHtml('[data-config="workHeading"]', work.heading || 'The work speaks<br><em>for itself.</em>');
  setText('[data-config="workIntro"]', work.intro || '');
  (work.items || []).forEach((item, index) => {
    const category = document.querySelector(`[data-config="workItem-category-${index}"]`);
    const title = document.querySelector(`[data-config="workItem-title-${index}"]`);
    if (category) category.textContent = item.category || '';
    if (title) title.textContent = item.title || '';
  });

  setText('[data-config="reviewsEyebrow"]', reviews.eyebrow || 'Kind words from the neighbourhood');
  setHtml('[data-config="reviewsHeading"]', reviews.heading || 'Good people.<br><em>Good work.</em>');
  setText('[data-config="reviewsRating"]', reviews.rating || '5.0');
  setText('[data-config="reviewsRatingLabel"]', reviews.ratingLabel || 'From our South London customers');
  (reviews.items || []).forEach((item, index) => {
    const quoteSelector = `[data-config="review-quote-${index}"]`;
    const initialsSelector = `[data-config="review-initials-${index}"]`;
    const nameSelector = `[data-config="review-name-${index}"]`;
    const locationSelector = `[data-config="review-location-${index}"]`;
    const quoteElement = document.querySelector(quoteSelector);
    const initialsElement = document.querySelector(initialsSelector);
    const nameElement = document.querySelector(nameSelector);
    const locationElement = document.querySelector(locationSelector);
    if (quoteElement) quoteElement.textContent = `“${item.quote || ''}”`;
    if (initialsElement) initialsElement.textContent = item.initials || '';
    if (nameElement) nameElement.textContent = item.name || '';
    if (locationElement) locationElement.textContent = item.location || '';
  });

  setText('[data-config="quoteEyebrow"]', quote.eyebrow || "Let's get it sorted");
  setHtml('[data-config="quoteHeading"]', quote.heading || "Tell us what's<br><em>going on.</em>");
  setText('[data-config="quoteDescription"]', quote.description || '');
  setHtml('[data-config="quotePhone"]', `<span aria-hidden="true">☎</span> ${business.phoneDisplay || business.phone || '020 7946 0958'}`);
  setText('[data-config="quoteSmallPrint"]', quote.smallPrint || 'Available 24 hours, every day');
  setText('[data-config="formNote"]', quote.formNote || "No obligation. We'll use your details to respond to your enquiry.");

  setHtml('[data-config="footerTagline"]', footer.tagline || 'Good work. Done properly.<br>Keeping South London homes running.');
  setText('[data-config="footerGetInTouch"]', footer.getInTouchHeading || 'Get in touch');
  setHtml('[data-config="footerPhone"]', business.phoneDisplay || business.phone || '020 7946 0958');
  setHtml('[data-config="footerEmail"]', business.email || 'info@business.com');
  setText('[data-config="footerAddressLineOne"]', footer.addressLineOne || business.streetAddress || '123 High Street');
  setText('[data-config="footerAddressLineTwo"]', footer.addressLineTwo || `${business.locality || 'London'}, ${business.postcode || 'SW9 8XY'}`);
  setText('[data-config="footerAvailabilityHeading"]', footer.availableHeading || 'Here when you need us');
  setHtml('[data-config="footerAvailability"]', footer.availability || 'Emergency callouts<br>Monday to Sunday, 24/7');
  setText('[data-config="footerCopyright"]', footer.copyright || business.name || 'Business Name');
  setText('[data-config="footerLocation"]', footer.locationText || 'South London, UK');
};

const initialiseConfig = async () => {
  try {
    const response = await fetch('./site.config.json');
    if (!response.ok) {
      throw new Error('Config file not found');
    }
    const config = await response.json();
    applyConfig(config);
  } catch {
    // Skip config hydration silently and keep the default content in the HTML.
  }
};

if (year) {
  year.textContent = new Date().getFullYear();
}

initialiseConfig();

if (menuToggle && siteNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    siteNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
    siteNav.classList.toggle("is-open", !isExpanded);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

if (phoneInput && quoteForm && formStatus) {
  phoneInput.addEventListener("input", () => {
    phoneInput.setCustomValidity("");
    formStatus.textContent = "";
  });

  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "";

    const phoneDigits = phoneInput.value.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      phoneInput.setCustomValidity("Enter a valid phone number with 10 to 15 digits.");
      phoneInput.reportValidity();
      return;
    }

    phoneInput.setCustomValidity("");
    const formData = new FormData(quoteForm);

    try {
      const response = await fetch(quoteForm.action, {
        method: quoteForm.method,
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Form submission failed with status ${response.status}.`);
      }

      formStatus.textContent = `Thanks, ${formData.get("name")}. Your request has been sent. We'll be in touch soon.`;
      quoteForm.reset();
    } catch {
      formStatus.textContent = "We couldn't send your request. Please try again or call us directly.";
    }
  });
}
