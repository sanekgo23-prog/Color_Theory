// ===================== Цветовые утилиты =====================
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// ===================== Генераторы палитр =====================
function generateAnalogous(baseHue, count, baseS, baseL) {
    const palette = [];
    const step = Math.floor(Math.random() * 16 + 15);
    for (let i = 0; i < count; i++) {
        let h = (baseHue + i * step) % 360;
        let s = clamp(baseS + Math.floor(Math.random() * 31 - 15), 20, 100);
        let l = clamp(baseL + Math.floor(Math.random() * 21 - 10), 20, 90);
        palette.push([h, s, l]);
    }
    return palette;
}

function generateComplementary(baseHue, count, baseS, baseL) {
    const compHue = (baseHue + 180) % 360;
    const firstHalf = Math.ceil(count / 2);
    const secondHalf = count - firstHalf;
    const palette = [];
    for (let i = 0; i < firstHalf; i++) {
        let s = clamp(baseS + Math.floor(Math.random() * 21 - 10), 30, 90);
        let l = clamp(baseL + Math.floor(Math.random() * 31 - 15), 30, 80);
        palette.push([baseHue, s, l]);
    }
    for (let i = 0; i < secondHalf; i++) {
        let s = clamp(baseS + Math.floor(Math.random() * 21 - 10), 30, 90);
        let l = clamp(baseL + Math.floor(Math.random() * 31 - 15), 30, 80);
        palette.push([compHue, s, l]);
    }
    return palette;
}

function generateTriadic(baseHue, count, baseS, baseL) {
    const hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
    const perGroup = Math.floor(count / 3);
    const remainder = count % 3;
    const palette = [];
    for (let i = 0; i < hues.length; i++) {
        let groupCount = perGroup + (i < remainder ? 1 : 0);
        for (let j = 0; j < groupCount; j++) {
            let s = clamp(baseS + Math.floor(Math.random() * 31 - 15), 25, 95);
            let l = clamp(baseL + Math.floor(Math.random() * 31 - 15), 30, 85);
            palette.push([hues[i], s, l]);
        }
    }
    return palette;
}

function generateTetradic(baseHue, count, baseS, baseL) {
    const hues = [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360];
    const perGroup = Math.floor(count / 4);
    const remainder = count % 4;
    const palette = [];
    for (let i = 0; i < hues.length; i++) {
        let groupCount = perGroup + (i < remainder ? 1 : 0);
        for (let j = 0; j < groupCount; j++) {
            let s = clamp(baseS + Math.floor(Math.random() * 31 - 15), 30, 90);
            let l = clamp(baseL + Math.floor(Math.random() * 31 - 15), 35, 85);
            palette.push([hues[i], s, l]);
        }
    }
    return palette;
}

function generateMonochromatic(baseHue, count, baseS, baseL) {
    const palette = [];
    for (let i = 0; i < count; i++) {
        let s = clamp(baseS + (i - Math.floor(count / 2)) * 15, 15, 100);
        let l = clamp(baseL + (i - Math.floor(count / 2)) * 12, 20, 90);
        s = clamp(s + Math.floor(Math.random() * 21 - 10), 15, 100);
        l = clamp(l + Math.floor(Math.random() * 17 - 8), 20, 90);
        palette.push([baseHue, s, l]);
    }
    return palette;
}

function generatePastel(count) {
    const palette = [];
    const baseHue = Math.floor(Math.random() * 360);
    const step = Math.floor(Math.random() * 21 + 20);
    for (let i = 0; i < count; i++) {
        let h = (baseHue + i * step) % 360;
        let s = Math.floor(Math.random() * 26 + 20);
        let l = Math.floor(Math.random() * 21 + 70);
        palette.push([h, s, l]);
    }
    return palette;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function generatePalette(count, baseS, baseL, mode = null) {
    const modes = ["analogous", "complementary", "triadic", "tetradic", "monochromatic", "pastel"];
    if (!mode) mode = modes[Math.floor(Math.random() * modes.length)];
    const baseHue = Math.floor(Math.random() * 360);
    let rawColors;
    switch (mode) {
        case "analogous": rawColors = generateAnalogous(baseHue, count, baseS, baseL); break;
        case "complementary": rawColors = generateComplementary(baseHue, count, baseS, baseL); break;
        case "triadic": rawColors = generateTriadic(baseHue, count, baseS, baseL); break;
        case "tetradic": rawColors = generateTetradic(baseHue, count, baseS, baseL); break;
        case "monochromatic": rawColors = generateMonochromatic(baseHue, count, baseS, baseL); break;
        case "pastel": rawColors = generatePastel(count); break;
        default: rawColors = generateAnalogous(baseHue, count, baseS, baseL);
    }
    rawColors.sort((a, b) => a[0] - b[0]);
    const hexColors = rawColors.map(([h, s, l]) => rgbToHex(...hslToRgb(h, s, l)));
    return { colors: hexColors, mode: mode };
}

// ===================== UI-логика =====================
document.addEventListener('DOMContentLoaded', () => {
    const segmentsGroup = document.getElementById('segments-group');
    const innerCircle = document.getElementById('inner-hole');
    const svg = document.getElementById('ring-svg');
    const countText = document.getElementById('color-count-text');
    const modeText = document.getElementById('mode-text');
    const legendDiv = document.getElementById('legend');
    const generateBtn = document.getElementById('generate-btn');
    const countSlider = document.getElementById('count-slider');
    const satSlider = document.getElementById('sat-slider');
    const lightSlider = document.getElementById('light-slider');
    const countVal = document.getElementById('count-value');
    const satVal = document.getElementById('sat-value');
    const lightVal = document.getElementById('light-value');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const randomModeBtn = document.getElementById('random-mode');
    const modeDescriptionDiv = document.getElementById('mode-description');

    // Тонкая настройка
    const tuningToggle = document.getElementById('tuning-toggle');
    const tuningContent = document.getElementById('tuning-content');
    const toggleIcon = document.getElementById('toggle-icon');

    if (tuningToggle && tuningContent && toggleIcon) {
        tuningToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (tuningContent.classList.contains('open')) {
                tuningContent.classList.remove('open');
                toggleIcon.textContent = '▸';
                setTimeout(() => {
                    if (!tuningContent.classList.contains('open')) {
                        tuningContent.style.display = 'none';
                    }
                }, 300);
            } else {
                tuningContent.style.display = 'flex';
                tuningContent.offsetHeight;
                tuningContent.classList.add('open');
                toggleIcon.textContent = '▾';
            }
        });
    }

    const modeDescriptions = {
        analogous: 'Сочетание соседних оттенков на цветовом круге. Создаёт спокойные, гармоничные композиции без резких контрастов.',
        complementary: 'Два цвета, расположенные напротив друг друга. Дают энергичный, динамичный контраст.',
        triadic: 'Три цвета, равномерно распределённые по кругу. Обеспечивают баланс и яркость, сохраняя гармонию.',
        tetradic: 'Две пары комплементарных цветов. Позволяет создавать богатые, многогранные палитры.',
        monochromatic: 'Одноцветовая схема с вариациями по насыщенности и яркости. Всегда элегантно и минималистично.',
        pastel: 'Пастельные, приглушённые тона. Придают мягкость, воздушность и уют.'
    };

    let currentMode = null;
    let animateTimer = null;
    let animationActive = false;
    let currentColors = [];

    generateAndDraw();

    generateBtn?.addEventListener('click', generateAndDraw);

    countSlider?.addEventListener('input', () => countVal.textContent = countSlider.value);
    satSlider?.addEventListener('input', () => satVal.textContent = satSlider.value);
    lightSlider?.addEventListener('input', () => lightVal.textContent = lightSlider.value);

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            updateModeDescription(currentMode);
            generateAndDraw();
        });
    });

    randomModeBtn?.addEventListener('click', animateRandomMode);

    function updateModeDescription(mode) {
        if (!modeDescriptionDiv) return;
        const names = {
            analogous: 'Аналоговая гармония',
            complementary: 'Комплементарная гармония',
            triadic: 'Триадная гармония',
            tetradic: 'Тетрадная гармония',
            monochromatic: 'Монохромная гармония',
            pastel: 'Пастельная гармония'
        };
        const desc = modeDescriptions[mode] || '';
        modeDescriptionDiv.innerHTML = `<strong>${names[mode]}</strong>${desc}`;
    }

    function animateRandomMode() {
        const modes = Array.from(modeButtons).map(b => b.dataset.mode);
        let step = 0;
        clearInterval(animateTimer);
        animateTimer = setInterval(() => {
            const idx = step % modes.length;
            modeButtons.forEach(b => b.classList.remove('active'));
            modeButtons[idx].classList.add('active');
            updateModeDescription(modes[idx]);
            step++;
            if (step >= 10) {
                clearInterval(animateTimer);
                const chosen = modes[Math.floor(Math.random() * modes.length)];
                modeButtons.forEach(b => b.classList.remove('active'));
                const chosenBtn = document.querySelector(`.mode-btn[data-mode="${chosen}"]`);
                if (chosenBtn) chosenBtn.classList.add('active');
                currentMode = chosen;
                updateModeDescription(chosen);
                generateAndDraw();
            }
        }, 80);
    }

    function getCurrentSettings() {
        return {
            count: parseInt(countSlider?.value || 5),
            sat: parseInt(satSlider?.value || 70),
            light: parseInt(lightSlider?.value || 50),
        };
    }

    function generateAndDraw() {
        const { count, sat, light } = getCurrentSettings();
        const palette = generatePalette(count, sat, light, currentMode);
        currentColors = palette.colors;
        if (!currentMode) {
            modeButtons.forEach(b => b.classList.remove('active'));
            const activeBtn = document.querySelector(`.mode-btn[data-mode="${palette.mode}"]`);
            if (activeBtn) activeBtn.classList.add('active');
            currentMode = palette.mode;
            updateModeDescription(currentMode);
        }
        drawRing(palette.colors, count, palette.mode);
        drawLegend(palette.colors);
    }

    function drawRing(colors, count, mode) {
        if (!segmentsGroup) return;
        while (segmentsGroup.firstChild) segmentsGroup.removeChild(segmentsGroup.firstChild);

        const cx = 240, cy = 240, outerR = 180, innerR = 90;
        const angle = 360 / count;
        if (countText) countText.textContent = `${count} цветов`;

        const modeNames = {
            analogous: 'Аналоговая',
            complementary: 'Комплементарная',
            triadic: 'Триада',
            tetradic: 'Тетрада',
            monochromatic: 'Монохромная',
            pastel: 'Пастельная'
        };
        if (modeText) modeText.textContent = modeNames[mode] || mode;

        if (innerCircle) {
            innerCircle.setAttribute('r', '92');
        }

        animationActive = true;
        for (let i = 0; i < count; i++) {
            const delay = i * 120;
            setTimeout(() => {
                if (!animationActive && i !== 0) return;
                const startAngle = -90 + i * angle;
                const endAngle = startAngle + angle;
                const path = describeArc(cx, cy, outerR, innerR, startAngle, endAngle);
                const segment = document.createElementNS("http://www.w3.org/2000/svg", "path");
                segment.setAttribute("d", path);
                segment.setAttribute("fill", colors[i]);
                segment.setAttribute("stroke", "#0b0c1e");
                segment.setAttribute("stroke-width", "4");
                segment.setAttribute("class", "ring-segment");
                segment.style.transformOrigin = `${cx}px ${cy}px`;
                segment.style.transition = "transform 0.2s, opacity 0.2s";
                segment.style.opacity = "0";
                segment.addEventListener("mouseenter", () => {
                    if (!animationActive) segment.style.transform = "scale(1.08)";
                    segment.setAttribute("stroke", "white");
                    segment.setAttribute("stroke-width", "3");
                });
                segment.addEventListener("mouseleave", () => {
                    segment.style.transform = "scale(1)";
                    segment.setAttribute("stroke", "#0b0c1e");
                    segment.setAttribute("stroke-width", "4");
                });
                segment.addEventListener("click", () => copyColor(colors[i]));
                segmentsGroup.appendChild(segment);
                setTimeout(() => { segment.style.opacity = "1"; }, 10);
                if (i === count - 1) {
                    setTimeout(() => { animationActive = false; }, 130);
                }
            }, delay);
        }
        if (innerCircle) svg.appendChild(innerCircle);
    }

    function describeArc(cx, cy, outerR, innerR, startAngle, endAngle) {
        const toRad = Math.PI / 180;
        const startOuter = polarToCartesian(cx, cy, outerR, startAngle);
        const endOuter = polarToCartesian(cx, cy, outerR, endAngle);
        const startInner = polarToCartesian(cx, cy, innerR, endAngle);
        const endInner = polarToCartesian(cx, cy, innerR, startAngle);
        const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
        return [
            "M", startOuter.x, startOuter.y,
            "A", outerR, outerR, 0, largeArc, 1, endOuter.x, endOuter.y,
            "L", startInner.x, startInner.y,
            "A", innerR, innerR, 0, largeArc, 0, endInner.x, endInner.y,
            "Z"
        ].join(" ");
    }

    function polarToCartesian(cx, cy, r, angleDeg) {
        const rad = (angleDeg - 90) * Math.PI / 180;
        return {
            x: cx + r * Math.cos(rad),
            y: cy + r * Math.sin(rad)
        };
    }

    function drawLegend(colors) {
        if (!legendDiv) return;
        legendDiv.innerHTML = '';
        colors.forEach(color => {
            const chip = document.createElement('div');
            chip.className = 'color-chip';
            chip.innerHTML = `
                <div class="color-swatch" style="background: ${color};"></div>
                <span class="color-hex">${color}</span>
            `;
            chip.addEventListener('click', () => copyColor(color));
            legendDiv.appendChild(chip);
        });
    }

    function copyColor(color) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(color).then(() => showToast(`Скопирован ${color}`))
                .catch(() => fallbackCopy(color));
        } else {
            fallbackCopy(color);
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast(`Скопирован ${text}`);
        } catch (err) {
            showToast('Ошибка копирования');
        }
        document.body.removeChild(textarea);
    }

    let currentToast = null;
    function showToast(message) {
        if (currentToast) {
            currentToast.remove();
            currentToast = null;
        }
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.textContent = message;
        document.body.appendChild(toast);
        currentToast = toast;
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast === currentToast) {
                    toast.remove();
                    currentToast = null;
                }
            }, 300);
        }, 1500);
    }

    // =========================== Реклама ===========================
    const adPopup = document.getElementById('ad-popup');
    const adClose = document.getElementById('ad-close');

    function showAd() {
        if (adPopup) {
            adPopup.classList.add('show');
            // Автоматически скрыть через 8 секунд
            clearTimeout(window.adTimeout);
            window.adTimeout = setTimeout(() => {
                adPopup.classList.remove('show');
            }, 8000);
        }
    }

    function hideAd() {
        if (adPopup) {
            adPopup.classList.remove('show');
        }
    }

    if (adClose) {
        adClose.addEventListener('click', hideAd);
    }

    // Показываем рекламу через 2 секунды после загрузки, затем каждые 60 секунд
    setTimeout(showAd, 2000);
    setInterval(showAd, 60000);

    // ========================= Сохранение палитры =========================
    const saveBtn = document.getElementById('save-palette-btn');
    const paletteNameInput = document.getElementById('palette-name');
    const isPublicCheckbox = document.getElementById('is-public');

    if (saveBtn && !saveBtn.dataset.listenerAttached) {
        saveBtn.dataset.listenerAttached = 'true';
        saveBtn.addEventListener('click', async (e) => {
            if (saveBtn.disabled) return;
            saveBtn.disabled = true;
            const name = paletteNameInput?.value.trim() || 'Без названия';
            const isPublic = isPublicCheckbox?.checked ?? true;
            if (currentColors.length === 0) {
                showToast('Сначала сгенерируйте палитру');
                saveBtn.disabled = false;
                return;
            }
            try {
                const response = await fetch('/save_palette', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        name: name,
                        colors: currentColors,
                        mode: currentMode,
                        is_public: isPublic
                    })
                });
                const data = await response.json();
                if (data.message) {
                    showToast(data.message);
                    if (paletteNameInput) paletteNameInput.value = '';
                } else {
                    showToast('Ошибка сохранения');
                }
            } catch (err) {
                showToast('Сервер недоступен');
                console.error(err);
            } finally {
                saveBtn.disabled = false;
            }
        });
    }
});