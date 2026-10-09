(() => {
    const canvas = document.getElementById('hap-canvas');

    if (!canvas) {
        return;
    }

    const context = canvas.getContext('2d');
    const status = document.getElementById('viewer-status');
    const previousButton = document.getElementById('frame-prev');
    const nextButton = document.getElementById('frame-next');
    const autoplayButton = document.getElementById('frame-autoplay');
    const frameRange = document.getElementById('frame-range');
    const frameCount = document.getElementById('frame-count');
    const columns = 4;
    const rows = 4;
    const totalFrames = columns * rows;
    const visibleHeightByRow = [.91, .88, .84, .78];
    const image = new Image();
    let frame = 0;
    let frameBoxes = [];
    let maximumWidth = 0;
    let maximumHeight = 0;
    let isDragging = false;
    let lastPointerX = 0;
    let dragRemainder = 0;
    let autoplayTimer = null;

    const setFrame = (nextFrame) => {
        frame = (nextFrame % totalFrames + totalFrames) % totalFrames;
        frameRange.value = String(frame);
        frameCount.value = `${String(frame + 1).padStart(2, '0')} / ${totalFrames}`;

        const box = frameBoxes[frame];
        const scale = Math.min(canvas.width / (maximumWidth * 1.17), canvas.height / (maximumHeight * 1.17));
        const destinationWidth = box.width * scale;
        const destinationHeight = box.height * scale;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
            image,
            box.x,
            box.y,
            box.width,
            box.height,
            (canvas.width - destinationWidth) / 2,
            (canvas.height - destinationHeight) / 2,
            destinationWidth,
            destinationHeight,
        );
    };

    const stopAutoplay = () => {
        if (autoplayTimer !== null) {
            window.clearInterval(autoplayTimer);
            autoplayTimer = null;
        }

        autoplayButton.setAttribute('aria-pressed', 'false');
        autoplayButton.innerHTML = '<span aria-hidden="true">▶</span> Putar otomatis';
    };

    const findDeviceBox = (pixels, imageWidth, cellLeft, cellTop, cellRight, cellBottom) => {
        const width = cellRight - cellLeft;
        const height = cellBottom - cellTop;
        const visited = new Uint8Array(width * height);
        const queue = new Int32Array(width * height);
        let largest = null;

        for (let index = 0; index < visited.length; index += 1) {
            if (visited[index]) {
                continue;
            }

            visited[index] = 1;
            const localX = index % width;
            const localY = Math.floor(index / width);
            const alphaIndex = ((cellTop + localY) * imageWidth + cellLeft + localX) * 4 + 3;

            if (pixels[alphaIndex] < 80) {
                continue;
            }

            let head = 0;
            let tail = 1;
            let left = localX;
            let right = localX;
            let top = localY;
            let bottom = localY;
            queue[0] = index;

            while (head < tail) {
                const position = queue[head];
                head += 1;
                const x = position % width;
                const y = Math.floor(position / width);
                left = Math.min(left, x);
                right = Math.max(right, x);
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);

                const neighbors = [
                    x > 0 ? position - 1 : -1,
                    x < width - 1 ? position + 1 : -1,
                    y > 0 ? position - width : -1,
                    y < height - 1 ? position + width : -1,
                ];

                for (const neighbor of neighbors) {
                    if (neighbor < 0 || visited[neighbor]) {
                        continue;
                    }

                    visited[neighbor] = 1;
                    const neighborX = neighbor % width;
                    const neighborY = Math.floor(neighbor / width);
                    const neighborAlpha = ((cellTop + neighborY) * imageWidth + cellLeft + neighborX) * 4 + 3;

                    if (pixels[neighborAlpha] >= 80) {
                        queue[tail] = neighbor;
                        tail += 1;
                    }
                }
            }

            if (!largest || tail > largest.area) {
                largest = { area: tail, left, right, top, bottom };
            }
        }

        if (!largest) {
            return { x: cellLeft, y: cellTop, width, height };
        }

        const padding = 3;
        const left = Math.max(0, largest.left - padding);
        const top = Math.max(0, largest.top - padding);
        const right = Math.min(width, largest.right + padding + 1);
        const bottom = Math.min(height, largest.bottom + padding + 1);

        return { x: cellLeft + left, y: cellTop + top, width: right - left, height: bottom - top };
    };

    image.onload = () => {
        try {
            const sourceCanvas = document.createElement('canvas');
            sourceCanvas.width = image.naturalWidth;
            sourceCanvas.height = image.naturalHeight;
            const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
            sourceContext.drawImage(image, 0, 0);
            const pixels = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';

            frameBoxes = Array.from({ length: totalFrames }, (_, index) => {
                const column = index % columns;
                const row = Math.floor(index / columns);
                const cellTop = Math.round(row * sourceCanvas.height / rows);
                const cellBottom = Math.round((row + 1) * sourceCanvas.height / rows);

                return findDeviceBox(
                    pixels,
                    sourceCanvas.width,
                    Math.round(column * sourceCanvas.width / columns),
                    cellTop,
                    Math.round((column + 1) * sourceCanvas.width / columns),
                    cellTop + Math.round((cellBottom - cellTop) * visibleHeightByRow[row]),
                );
            });

            maximumWidth = Math.max(...frameBoxes.map((box) => box.width));
            maximumHeight = Math.max(...frameBoxes.map((box) => box.height));
            setFrame(0);
            status.hidden = true;
            previousButton.disabled = false;
            nextButton.disabled = false;
            autoplayButton.disabled = false;
            frameRange.disabled = false;
        } catch (error) {
            status.textContent = 'Gambar tidak dapat disiapkan. Periksa file sprite hAP.';
        }
    };

    image.onerror = () => {
        status.textContent = 'Gambar hAP tidak ditemukan.';
    };

    previousButton.addEventListener('click', () => {
        stopAutoplay();
        setFrame(frame - 1);
    });

    nextButton.addEventListener('click', () => {
        stopAutoplay();
        setFrame(frame + 1);
    });

    frameRange.addEventListener('input', () => {
        stopAutoplay();
        setFrame(Number(frameRange.value));
    });

    autoplayButton.addEventListener('click', () => {
        if (autoplayTimer !== null) {
            stopAutoplay();
            return;
        }

        autoplayButton.setAttribute('aria-pressed', 'true');
        autoplayButton.innerHTML = '<span aria-hidden="true">Ⅱ</span> Jeda putaran';
        autoplayTimer = window.setInterval(() => setFrame(frame + 1), 175);
    });

    canvas.addEventListener('pointerdown', (event) => {
        if (frameBoxes.length === 0) {
            return;
        }

        stopAutoplay();
        isDragging = true;
        lastPointerX = event.clientX;
        dragRemainder = 0;
        canvas.classList.add('is-dragging');
        canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener('pointermove', (event) => {
        if (!isDragging) {
            return;
        }

        dragRemainder += event.clientX - lastPointerX;
        lastPointerX = event.clientX;
        const pixelsPerFrame = Math.max(12, Math.min(24, canvas.clientWidth / 24));
        const steps = Math.trunc(dragRemainder / pixelsPerFrame);

        if (steps !== 0) {
            setFrame(frame + steps);
            dragRemainder -= steps * pixelsPerFrame;
        }
    });

    const endDrag = () => {
        isDragging = false;
        canvas.classList.remove('is-dragging');
    };

    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('lostpointercapture', endDrag);
    canvas.addEventListener('keydown', (event) => {
        if (frameBoxes.length === 0) {
            return;
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            stopAutoplay();
            setFrame(frame + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });

    image.src = canvas.dataset.sprite;
})();
