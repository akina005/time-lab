// 简单的时间实验室逻辑
document.addEventListener("DOMContentLoaded", () => {
  const timeEl = document.getElementById("clock-time");
  const dateEl = document.getElementById("clock-date");
  const tzSelect = document.getElementById("timezone-select");

  const worldZones = [
    { id: "time-bj", tz: "Asia/Shanghai" },
    { id: "time-ldn", tz: "Europe/London" },
    { id: "time-ny", tz: "America/New_York" },
    { id: "time-tyo", tz: "Asia/Tokyo" }
  ];

  // 倒计时相关
  let targetTimestamp = null;
  const countdownForm = document.getElementById("countdown-form");
  const countdownLabelEl = document.getElementById("countdown-label");
  const countdownDetailEl = document.getElementById("countdown-detail");

  function formatTimeWithTZ(date, timeZone, opts) {
    const options = Object.assign(
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      },
      opts || {}
    );

    if (timeZone) {
      options.timeZone = timeZone;
    }

    const formatter = new Intl.DateTimeFormat("zh-CN", options);
    return formatter.format(date);
  }

  function updateMainClock(now) {
    const selected = tzSelect ? tzSelect.value : "local";
    const tz = selected === "local" ? null : selected;

    timeEl.textContent = formatTimeWithTZ(now, tz);

    const dateText = formatTimeWithTZ(now, tz, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short"
    });

    dateEl.textContent = dateText;
  }

  function updateWorldClocks(now) {
    worldZones.forEach(({ id, tz }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = formatTimeWithTZ(now, tz);
    });
  }

  function setProgress(barId, textId, value, label) {
    const bar = document.getElementById(barId);
    const text = document.getElementById(textId);
    if (!bar || !text) return;

    const pct = Math.max(0, Math.min(100, value * 100));
    bar.style.width = pct.toFixed(2) + "%";
    text.textContent = `${label} ${pct.toFixed(1)}%`;
  }

  function updateProgress(now) {
    // 一天进度
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const dayProgress =
      (now.getTime() - startOfDay.getTime()) /
      (endOfDay.getTime() - startOfDay.getTime());

    // 一年进度
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    const yearProgress =
      (now.getTime() - startOfYear.getTime()) /
      (endOfYear.getTime() - startOfYear.getTime());

    setProgress("day-progress-bar", "day-progress-text", dayProgress, "今天已过去");
    setProgress("year-progress-bar", "year-progress-text", yearProgress, "今年已过去");
  }

  function updateCountdown(now) {
    if (!targetTimestamp) return;

    if (!countdownLabelEl || !countdownDetailEl) return;

    const diff = targetTimestamp - now.getTime();
    const totalSeconds = Math.floor(Math.abs(diff) / 1000);

    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (diff >= 0) {
      countdownLabelEl.textContent = "距离那一刻还有：";
    } else {
      countdownLabelEl.textContent = "那一刻已经过去：";
    }

    countdownDetailEl.textContent =
      `${days} 天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`;
  }

  function tick() {
    const now = new Date();
    updateMainClock(now);
    updateWorldClocks(now);
    updateProgress(now);
    updateCountdown(now);
  }

  // 监听时区选择变化
  if (tzSelect) {
    tzSelect.addEventListener("change", () => {
      tick();
    });
  }

  // 监听倒计时表单
  if (countdownForm) {
    countdownForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const dateInput = document.getElementById("target-date");
      const timeInput = document.getElementById("target-time");
      if (!dateInput) return;

      const dateValue = dateInput.value;
      const timeValue = timeInput && timeInput.value ? timeInput.value : "00:00";

      if (!dateValue) {
        alert("请选择一个日期");
        return;
      }

      const [year, month, day] = dateValue.split("-").map(Number);
      const [hour, minute] = timeValue.split(":").map(Number);

      const target = new Date(
        year,
        (month || 1) - 1,
        day || 1,
        hour || 0,
        minute || 0,
        0,
        0
      );

      targetTimestamp = target.getTime();
      tick(); // 立即刷新一次显示
    });
  }

  // 每秒刷新
  tick();
  setInterval(tick, 1000);
});
