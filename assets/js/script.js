document.addEventListener("DOMContentLoaded", () => {
  const scriptURL = "https://script.google.com/macros/s/AKfycbxru3-7RT-dceQraVQpFjPX4zTBo3UVYh9IISq6EAChV2KhUu6-_XYjqT6iBTdLUH78vQ/exec";
  const form = document.getElementById("myForm");
  if (!form) return;
  const msg = document.getElementById("msg");
  const submitBtn = form.querySelector('button[type="submit"]');

  const setMessage = (text, type) => {
    if (!msg) return;
    msg.textContent = text;
    msg.classList.remove("message--success", "message--error", "message--pending");
    if (type) msg.classList.add(`message--${type}`);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) {
      setMessage("Please fill out all required fields.", "error");
      return;
    }

    submitBtn?.classList.add("is-loading");
    if (submitBtn) submitBtn.disabled = true;
    setMessage("Submitting...", "pending");

    try {
      const response = await fetch(scriptURL, {
        method: "POST",
        body: new FormData(form),
      });

      if (!response.ok) throw new Error("Network");
      setMessage("Submitted successfully!", "success");
      form.reset();
    } catch (err) {
      setMessage("Submission failed. Try again.", "error");
    } finally {
      submitBtn?.classList.remove("is-loading");
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
