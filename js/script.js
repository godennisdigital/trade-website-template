const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const quoteForm = document.querySelector("#contact-form");
const phoneInput = document.querySelector("#phone-number");
const formStatus = document.querySelector("#form-status");
const year = document.querySelector("#current-year");

if (year) {
  year.textContent = new Date().getFullYear();
}

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
