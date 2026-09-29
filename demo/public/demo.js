"use strict";

(() => {
  const notice = "This application and its source are for testing, demonstrations, and ethical purposes in an isolated environment only. Use only on devices you own or have explicit permission to test. Stop if permission is withdrawn.";
  const devices = Object.freeze({
    "sample-a": Object.freeze({ id: "sample-a", name: "Sample device A", profile: "Fabricated compact Android phone" }),
    "sample-b": Object.freeze({ id: "sample-b", name: "Sample device B", profile: "Fabricated large Android phone" })
  });
  const byId = (id) => document.getElementById(id);
  const elements = {
    radios: [...document.querySelectorAll('input[name="sample-device"]')],
    checks: [byId("check-isolated"), byId("check-sample"), byId("check-scope")],
    readinessCount: byId("readiness-count"),
    start: byId("start-session"),
    stop: byId("stop-session"),
    export: byId("export-report"),
    reset: byId("reset-demo"),
    badge: byId("session-badge"),
    description: byId("session-description"),
    detail: byId("session-detail"),
    activeDevice: byId("active-device"),
    sessionStart: byId("session-start"),
    phoneStatus: byId("phone-status"),
    phoneDescription: byId("phone-status-description"),
    phoneDot: byId("phone-status-dot"),
    historySummary: byId("history-summary"),
    emptyHistory: byId("empty-history"),
    eventList: byId("event-list"),
    liveStatus: byId("live-status")
  };
  let activeSession = null;
  let sessions = [];
  let events = [];
  let nextSession = 1;
  const localTime = (value) => new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const selectedDevice = () => devices[elements.radios.find((input) => input.checked)?.value] || null;
  const completedChecks = () => elements.checks.filter((input) => input.checked).length;
  const announce = (message) => { elements.liveStatus.textContent = message; };

  function addEvent(title, description, sessionId = null) {
    events.push({ simulated: true, timestamp: new Date().toISOString(), sessionId, title, description });
  }

  function renderHistory() {
    const count = events.length;
    elements.emptyHistory.hidden = count > 0;
    elements.eventList.hidden = count === 0;
    elements.historySummary.textContent = count ? `${count} simulated ${count === 1 ? "event" : "events"} in this tab. Newest first.` : "No simulated events yet.";
    const rows = events.slice().reverse().map((event) => {
      const item = document.createElement("li");
      item.className = "event-item";
      const time = document.createElement("time");
      time.dateTime = event.timestamp;
      time.textContent = localTime(event.timestamp);
      time.title = new Date(event.timestamp).toLocaleString();
      const content = document.createElement("div");
      const label = document.createElement("span");
      label.className = "event-label";
      label.textContent = "Simulated event";
      const title = document.createElement("strong");
      title.textContent = event.title;
      const description = document.createElement("p");
      description.textContent = event.description;
      content.append(label, title, description);
      item.append(time, content);
      return item;
    });
    elements.eventList.replaceChildren(...rows);
  }

  function render() {
    const device = selectedDevice();
    const checkCount = completedChecks();
    const active = activeSession !== null;
    const ready = Boolean(device) && checkCount === elements.checks.length;
    elements.readinessCount.textContent = `${checkCount} of ${elements.checks.length}`;
    elements.start.disabled = active || !ready;
    elements.stop.disabled = !active;
    elements.export.disabled = events.length === 0;
    elements.reset.disabled = !device && checkCount === 0 && events.length === 0 && !active;
    elements.radios.forEach((input) => { input.disabled = active; });
    elements.checks.forEach((input) => { input.disabled = active; });
    elements.badge.classList.toggle("is-active", active);
    elements.phoneDot.classList.toggle("is-active", active);
    elements.detail.hidden = !active;

    if (active) {
      elements.badge.textContent = "Simulated · Active";
      elements.description.textContent = "Your simulated session is running in this browser. No real device is connected.";
      elements.activeDevice.textContent = devices[activeSession.deviceId].name;
      elements.sessionStart.textContent = localTime(activeSession.startedAt);
      elements.phoneStatus.textContent = "Demo session active";
      elements.phoneDescription.textContent = `${devices[activeSession.deviceId].name} · Simulated`;
    } else {
      elements.badge.textContent = ready ? "Ready to simulate" : sessions.length ? "Stopped" : "Not started";
      elements.activeDevice.textContent = "—";
      elements.sessionStart.textContent = "—";
      elements.phoneStatus.textContent = sessions.length ? "Demo session stopped" : "Demo is idle";
      elements.phoneDescription.textContent = "No session is running.";
      if (ready) {
        elements.description.textContent = `${device.name} is ready. Start a demo session to see a simulated event history.`;
      } else if (!device && checkCount < elements.checks.length) {
        elements.description.textContent = "Choose a sample device and complete all three practice checks to begin.";
      } else if (!device) {
        elements.description.textContent = "Choose a sample device to finish preparing your demo.";
      } else {
        const remaining = elements.checks.length - checkCount;
        elements.description.textContent = `Complete ${remaining} remaining practice ${remaining === 1 ? "check" : "checks"} to begin your demo.`;
      }
    }
    renderHistory();
  }

  [...elements.radios, ...elements.checks].forEach((input) => {
    input.addEventListener("change", () => {
      render();
      announce(elements.description.textContent);
    });
  });

  elements.start.addEventListener("click", () => {
    const device = selectedDevice();
    if (activeSession || !device || completedChecks() !== elements.checks.length) return;
    activeSession = {
      id: `simulated-session-${nextSession++}`,
      simulated: true,
      deviceId: device.id,
      startedAt: new Date().toISOString(),
      stoppedAt: null,
      practiceChecklist: { isolatedEnvironment: true, sampleOnlyData: true, scopeAndPermissionPlan: true },
      representsRealOwnerConsent: false
    };
    sessions.push(activeSession);
    addEvent("Practice checklist recorded", "All three practice checks are complete. This does not establish real device-owner consent.", activeSession.id);
    addEvent("Demo session started", `${device.name} is now active in this browser-only simulation. No device connection was made.`, activeSession.id);
    render();
    announce(`Simulated session started for ${device.name}. Setup is locked until you stop the session.`);
    elements.stop.focus();
  });

  elements.stop.addEventListener("click", () => {
    if (!activeSession) return;
    activeSession.stoppedAt = new Date().toISOString();
    addEvent("Demo session stopped", `${devices[activeSession.deviceId].name} is idle. Setup can now be changed.`, activeSession.id);
    activeSession = null;
    render();
    announce("Simulated session stopped. You can now change the setup or download a demo report.");
    elements.start.focus();
  });

  elements.reset.addEventListener("click", () => {
    activeSession = null;
    sessions = [];
    events = [];
    nextSession = 1;
    elements.radios.forEach((input) => { input.checked = false; });
    elements.checks.forEach((input) => { input.checked = false; });
    render();
    announce("Demo reset. All simulated sessions, selections, practice checks, and event history were cleared. Downloaded files are unchanged.");
    elements.radios[0].focus();
  });

  elements.export.addEventListener("click", () => {
    if (events.length === 0) return;
    const report = {
      reportType: "ANDRO local simulation report",
      schemaVersion: 1,
      simulated: true,
      generatedAt: new Date().toISOString(),
      ethicalNotice: notice,
      representsRealOwnerConsent: false,
      realDeviceConnections: 0,
      realDeviceDataCollected: false,
      browserPersistenceUsed: false,
      activeSessionId: activeSession?.id || null,
      sampleDevices: Object.values(devices),
      sessions,
      events
    };
    const blob = new Blob([JSON.stringify(report, null, 2) + "\n"], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `andro-simulated-report-${report.generatedAt.replace(/[:.]/g, "-")}.json`;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    announce("Simulated JSON report download requested. It contains only fabricated profiles and this tab's practice events.");
  });

  // Start clean even if the browser restores checkbox or radio values after a reload.
  elements.radios.forEach((input) => { input.checked = false; });
  elements.checks.forEach((input) => { input.checked = false; });
  render();
})();
