(() => {
  'use strict';

  document.body.classList.add('drc-device-page');

  // 实机方向相反时，只需把对应符号改为 -1。
  const YAW_SIGN = 1;
  const PITCH_SIGN = 1;
  const BAUD_RATE = 115200;

  const style = document.createElement('style');
  style.textContent = `
    .drc-device-dock{position:fixed;right:14px;bottom:14px;z-index:1000;width:190px;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}
    .drc-device-panel{position:static;width:100%;box-sizing:border-box;padding:10px;border:1px solid #ffffff30;border-radius:9px;background:#111e;color:#fff;font:11px/1.45 system-ui,sans-serif;backdrop-filter:blur(12px);color-scheme:dark;pointer-events:auto}
    .drc-device-panel strong{display:block;margin-bottom:7px;font-size:12px;letter-spacing:.04em}
    .drc-device-panel .drc-device-actions{display:flex;gap:6px}
    .drc-device-panel button{flex:1;padding:5px 6px;border:1px solid #ffffff40;border-radius:5px;background:#ffffff12;color:#fff;cursor:pointer;font:inherit}
    .drc-device-panel button:hover:not(:disabled){background:#ffffff24}
    .drc-device-panel button:disabled{cursor:not-allowed;opacity:.45}
    .drc-device-panel p{margin:6px 0 3px;color:#fffc}
    .drc-device-panel output{display:block;color:#fffc;font-variant-numeric:tabular-nums;white-space:nowrap}
    .drc-calibration-overlay{position:fixed;inset:0;z-index:2000;display:grid;place-items:center;background:transparent;cursor:wait;pointer-events:auto}
    .drc-calibration-text{color:#111;font:300 clamp(48px,7vmin,84px)/1.15 system-ui,sans-serif;letter-spacing:.04em;text-align:center;text-shadow:0 1px 18px #fff,0 0 8px #fff;opacity:0;transform-origin:center}
    .drc-calibration-overlay[data-message="true"] .drc-calibration-text{font-size:clamp(22px,3vmin,34px);font-weight:500;letter-spacing:.08em}
  `;
  document.head.append(style);

  const dock = document.createElement('div');
  dock.className = 'drc-device-dock';
  const panel = document.createElement('aside');
  panel.className = 'drc-device-panel';
  panel.setAttribute('aria-label', 'ESP32 姿态控制');
  panel.innerHTML = `
    <strong>ESP32 姿态控制</strong>
    <div class="drc-device-actions">
      <button type="button" data-action="connect">连接装置</button>
      <button type="button" data-action="calibrate" disabled>校准正面</button>
    </div>
    <p role="status">未连接</p>
    <output>Y --° / P --° / R --°</output>
  `;
  dock.append(panel);
  document.body.append(dock);

  const connectButton = panel.querySelector('[data-action="connect"]');
  const calibrateButton = panel.querySelector('[data-action="calibrate"]');
  const status = panel.querySelector('[role="status"]');
  const angles = panel.querySelector('output');
  let port = null;
  let reader = null;
  let readTask = null;
  let disconnectRequested = false;
  let calibration = null;

  function setStatus(text) {
    status.textContent = text;
  }

  function updateControls() {
    connectButton.textContent = port ? '断开装置' : '连接装置';
    calibrateButton.disabled = !port || Boolean(calibration);
  }

  function emit(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  function shortestAngle(value) {
    return ((value + 180) % 360 + 360) % 360 - 180;
  }

  function wait(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  function createCalibrationUI(current) {
    const overlay = document.createElement('div');
    overlay.className = 'drc-calibration-overlay';
    overlay.dataset.message = 'false';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    const text = document.createElement('div');
    text.className = 'drc-calibration-text';
    overlay.append(text);
    document.body.append(overlay);
    current.overlay = overlay;
    current.text = text;
  }

  function setCalibrationText(current, value, message = true) {
    current.overlay.dataset.message = String(message);
    current.text.getAnimations().forEach(animation => animation.cancel());
    current.text.textContent = value;
  }

  async function showCountdown(current, value) {
    setCalibrationText(current, String(value), false);
    await current.text.animate(
      [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: 400, easing: 'ease-out', fill: 'forwards' }
    ).finished;
    if (calibration !== current) return;
    await wait(1000);
    if (calibration !== current) return;
    await current.text.animate(
      [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.02)' }],
      { duration: 400, easing: 'ease-in', fill: 'forwards' }
    ).finished;
  }

  function showCalibrationMessage(current, value, pop = false) {
    setCalibrationText(current, value);
    return current.text.animate(
      pop
        ? [{ opacity: 0, transform: 'scale(.78)' }, { opacity: 1, transform: 'scale(1)' }]
        : [{ opacity: 0, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: pop ? 180 : 150, easing: pop ? 'cubic-bezier(.2,.9,.25,1.3)' : 'ease-out', fill: 'forwards' }
    ).finished;
  }

  function rejectCalibrationSample(current, sample) {
    if (calibration !== current || current.sample !== sample) return;
    clearTimeout(sample.watchdog);
    current.sample = null;
    sample.reject(new Error('姿态数据中断'));
  }

  function collectCalibrationAverage(current) {
    return new Promise((resolve, reject) => {
      const sample = {
        first: null,
        startedAt: 0,
        count: 0,
        sum: { r: 0, p: 0, y: 0 },
        max: { r: 0, p: 0, y: 0 },
        resolve,
        reject,
        watchdog: null
      };
      current.sample = sample;
      sample.watchdog = setTimeout(() => rejectCalibrationSample(current, sample), 650);
    });
  }

  function collectCalibrationSample(attitude) {
    const current = calibration;
    const sample = current?.sample;
    if (!sample) return;

    clearTimeout(sample.watchdog);
    sample.watchdog = setTimeout(() => rejectCalibrationSample(current, sample), 650);
    const now = performance.now();
    if (!sample.first) {
      sample.first = { ...attitude };
      sample.startedAt = now;
    }

    const delta = {
      r: shortestAngle(attitude.r - sample.first.r),
      p: shortestAngle(attitude.p - sample.first.p),
      y: shortestAngle(attitude.y - sample.first.y)
    };
    for (const axis of ['r', 'p', 'y']) {
      sample.sum[axis] += delta[axis];
      sample.max[axis] = Math.max(sample.max[axis], Math.abs(delta[axis]));
    }
    sample.count += 1;
    if (now - sample.startedAt < 2000) return;

    clearTimeout(sample.watchdog);
    current.sample = null;
    const average = {};
    for (const axis of ['r', 'p', 'y']) {
      average[axis] = sample.first[axis] + sample.sum[axis] / sample.count;
    }
    sample.resolve({
      attitude: average,
      stable: ['r', 'p', 'y'].every(axis => sample.max[axis] <= 10)
    });
  }

  function cancelCalibration() {
    const current = calibration;
    if (!current) return;
    calibration = null;
    if (current.sample) {
      const sample = current.sample;
      current.sample = null;
      clearTimeout(sample.watchdog);
      sample.reject(new Error('校准已取消'));
    }
    current.overlay?.remove();
    updateControls();
    emit('drc:sphere-calibration-state', { active: false });
  }

  async function startCalibration() {
    if (!port || calibration) return;
    const current = { overlay: null, text: null, sample: null };
    calibration = current;
    updateControls();
    emit('drc:sphere-calibration-state', { active: true });
    createCalibrationUI(current);
    setStatus('校准中，请保持静止');

    try {
      for (const value of [3, 2, 1]) {
        await showCountdown(current, value);
        if (calibration !== current) return;
      }

      while (calibration === current) {
        showCalibrationMessage(current, '请保持静止');
        const result = await collectCalibrationAverage(current);
        if (calibration !== current) return;

        if (result.stable) {
          emit('drc:sphere-calibrate', result.attitude);
          setStatus('已连接，校准完成');
          await showCalibrationMessage(current, '已经校准完毕', true);
          if (calibration !== current) return;
          await wait(1000);
          if (calibration !== current) return;
          await current.text.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration: 400, easing: 'ease-in', fill: 'forwards' }
          ).finished;
          break;
        }

        setStatus('检测到移动，正在重新校准');
        await showCalibrationMessage(current, '检测到移动，请保持静止');
        if (calibration !== current) return;
        await wait(700);
      }
    } catch {
      if (calibration === current) {
        setStatus('校准取消：姿态数据中断');
        await showCalibrationMessage(current, '数据中断，校准已取消');
        await wait(600);
      }
    } finally {
      if (calibration === current) {
        calibration = null;
        current.overlay?.remove();
        updateControls();
        emit('drc:sphere-calibration-state', { active: false });
      }
    }
  }

  function handleLine(line) {
    const text = line.trim();
    if (!text) return;

    try {
      const message = JSON.parse(text);
      if (message.type === 'calibrate') {
        emit('drc:sphere-device-button');
        return;
      }
      if (message.type !== 'attitude') return;

      const attitude = { r: message.r, p: message.p, y: message.y };
      if (!Object.values(attitude).every(Number.isFinite)) return;

      attitude.p *= PITCH_SIGN;
      attitude.y *= YAW_SIGN;
      angles.value = `Y ${attitude.y.toFixed(1)}° / P ${attitude.p.toFixed(1)}° / R ${attitude.r.toFixed(1)}°`;
      emit('drc:sphere-attitude', attitude);
      collectCalibrationSample(attitude);
    } catch {
      // 普通日志和损坏行不进入姿态接口，也不影响后续串口帧。
    }
  }

  async function readLoop(currentPort) {
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      reader = currentPort.readable.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let newline = buffer.indexOf('\n');
        while (newline >= 0) {
          handleLine(buffer.slice(0, newline));
          buffer = buffer.slice(newline + 1);
          newline = buffer.indexOf('\n');
        }
        if (buffer.length > 4096) buffer = buffer.slice(-1024);
      }
      buffer += decoder.decode();
      handleLine(buffer);
    } catch {
      if (!disconnectRequested) setStatus('连接已断开，请重新连接');
    } finally {
      try {
        reader?.releaseLock();
      } catch {
        // 端口移除时锁可能已由浏览器释放。
      }
      reader = null;
    }
  }

  async function closePort() {
    cancelCalibration();
    emit('drc:sphere-disconnected');
    if (reader) {
      try {
        await reader.cancel();
      } catch {
        // 已断开的端口无需再次取消。
      }
    }
    if (readTask) await readTask;
    if (port) {
      try {
        await port.close();
      } catch {
        // USB 移除后浏览器可能已关闭端口。
      }
      port = null;
    }
    updateControls();
  }

  async function connect() {
    disconnectRequested = false;
    connectButton.disabled = true;
    setStatus('请选择 ESP32-S3 串口');

    try {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: BAUD_RATE });
      connectButton.disabled = false;
      updateControls();
      setStatus('已连接，等待姿态数据');

      readTask = readLoop(port);
      await readTask;
      readTask = null;
      await closePort();
      if (!disconnectRequested) setStatus('连接已断开，请重新连接');
    } catch (error) {
      await closePort();
      if (error.name === 'NotFoundError') {
        setStatus('未连接：已取消串口选择');
      } else if (!disconnectRequested) {
        setStatus(`连接失败：${error.message}`);
      }
    } finally {
      readTask = null;
      connectButton.disabled = false;
      updateControls();
    }
  }

  async function disconnect() {
    disconnectRequested = true;
    connectButton.disabled = true;
    await closePort();
    angles.value = 'Y --° / P --° / R --°';
    setStatus('已断开');
    connectButton.disabled = false;
  }

  connectButton.addEventListener('click', () => {
    if (port) disconnect();
    else connect();
  });

  calibrateButton.addEventListener('click', () => {
    startCalibration();
  });
  window.addEventListener('drc:sphere-calibrate-request', () => {
    startCalibration();
  });

  if (!('serial' in navigator)) {
    connectButton.disabled = true;
    setStatus('当前浏览器不支持 Web Serial，请使用 Chrome 或 Edge');
  }
})();
