<script setup>
import { ref, onMounted, inject, watch, nextTick, computed } from 'vue';
import * as markerjs2 from 'markerjs2';
import Moveable from "vue3-moveable";
import imagetest from '../../assets/Images/testimg.jpg';

let imgRef = ref(null);
let downloadButton = ref(null);
let originalImageSrc = null;

const selectedImage = inject('selectedImage');
const savedImages = inject('savedImages');
const images = inject('images');
const stickers = ref([]);
const selectedSticker = ref(null);

const throttleDrag = 1;
const throttleResize = 0;

const showSticker = computed(() => stickers.value.length > 0);

const confirmMerge = async () => {
    try {
        const mergedImageSrc = await mergeImages();
        imgRef.value.src = mergedImageSrc;
        downloadButton.value.href = mergedImageSrc;
        clearStickers();
    } catch (error) {
        console.error("Merge failed", error);
    }
}

const addSticker = (stickerSrc) => {
    const imgRect = imgRef.value.getBoundingClientRect();

    const defaultWidth = 150;
    const defaultHeight = 150;

    const newSticker = {
        id: Date.now(),
        src: stickerSrc,
        style: {
            position: 'absolute',
            leftPercent: 50,
            topPercent: 50,
            widthPercent: (defaultWidth / imgRect.width) * 100,
            heightPercent: (defaultHeight / imgRect.height) * 100,
            transform: 'translate(-50%, -50%) rotate(0deg) scale(1, 1)'
        }
    };

    stickers.value.push(newSticker);
    nextTick(() => {
        selectedSticker.value = newSticker.id;
    });
};

const onDrag = ({ target, clientX, clientY }) => {
    const sticker = stickers.value.find(s => s.id === parseInt(target.dataset.id));
    if (sticker && imgRef.value) {
        const imgRect = imgRef.value.getBoundingClientRect();
        const stickerRect = target.getBoundingClientRect();

        let x = clientX - imgRect.left;
        let y = clientY - imgRect.top;

        x = Math.max(stickerRect.width / 2, Math.min(x, imgRect.width - stickerRect.width / 2));
        y = Math.max(stickerRect.height / 2, Math.min(y, imgRect.height - stickerRect.height / 2));

        sticker.style.leftPercent = (x / imgRect.width) * 100;
        sticker.style.topPercent = (y / imgRect.height) * 100;
    }
};

const onResize = ({ target, width, height }) => {
    const sticker = stickers.value.find(s => s.id === parseInt(target.dataset.id));
    if (sticker && imgRef.value) {
        const imgRect = imgRef.value.getBoundingClientRect();

        const widthPercent = (width / imgRect.width) * 100;
        const heightPercent = (height / imgRect.height) * 100;

        sticker.style.widthPercent = widthPercent;
        sticker.style.heightPercent = heightPercent;
    }
};

const onRotate = (e) => {
    e.target.style.transform = e.drag.transform;
    const sticker = stickers.value.find(s => s.id === parseInt(e.target.dataset.id));
    if (sticker) {
        sticker.style.transform = e.drag.transform;
    }
};

const deleteSticker = (id) => {
    stickers.value = stickers.value.filter(sticker => sticker.id !== id);
    if (selectedSticker.value === id) {
        selectedSticker.value = null;
    }
};

const clearStickers = () => {
    stickers.value = [];
    selectedSticker.value = null;
};

const selectSticker = (id) => {
    selectedSticker.value = id;
};

const mergeImages = () => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const baseImage = new Image();

        baseImage.onload = () => {
            canvas.width = baseImage.width;
            canvas.height = baseImage.height;
            ctx.drawImage(baseImage, 0, 0);

            console.log('Canvas size:', { width: canvas.width, height: canvas.height });
            console.log('Original image size:', { width: baseImage.width, height: baseImage.height });

            const loadStickers = stickers.value.map(sticker => {
                return new Promise((resolveSticker) => {
                    const img = new Image();
                    img.onload = () => resolveSticker(img);
                    img.onerror = () => resolveSticker(null);
                    img.src = sticker.src;
                });
            });

            Promise.all(loadStickers).then(stickerImages => {
                stickerImages.forEach((stickerImg, index) => {
                    if (stickerImg) {
                        const sticker = stickers.value[index];
                        const leftPercent = sticker.style.leftPercent;
                        const topPercent = sticker.style.topPercent;
                        const widthPercent = sticker.style.widthPercent;
                        const heightPercent = sticker.style.heightPercent;

                        console.log(`Sticker ${index + 1} size before merge:`, { widthPercent, heightPercent });

                        const leftPx = (leftPercent / 100) * canvas.width;
                        const topPx = (topPercent / 100) * canvas.height;
                        const width = (widthPercent / 100) * canvas.width;
                        const height = (heightPercent / 100) * canvas.height;

                        let rotation = 0;
                        let scaleX = 1;
                        let scaleY = 1;
                        const transformMatch = sticker.style.transform.match(/rotate\(([-\d.]+)deg\) scale\(([-\d.]+),\s*([-\d.]+)\)/);
                        if (transformMatch) {
                            rotation = parseFloat(transformMatch[1]);
                            scaleX = parseFloat(transformMatch[2]);
                            scaleY = parseFloat(transformMatch[3]);
                        }

                        console.log(`Sticker ${index + 1} scale factors:`, { scaleX, scaleY });

                        ctx.save();
                        ctx.translate(leftPx, topPx);
                        ctx.rotate(rotation * Math.PI / 180);

                        const finalWidth = width * scaleX;
                        const finalHeight = height * scaleY;

                        console.log(`Sticker ${index + 1} size after merge:`, { finalWidth, finalHeight });

                        ctx.drawImage(stickerImg, -finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight);
                        ctx.restore();
                    }
                });
                resolve(canvas.toDataURL('image/png'));
            });
        };

        baseImage.onerror = reject;
        baseImage.src = imgRef.value.src;
    });
};


const showMarkerArea = async () => {
    try {
        const mergedImageSrc = await mergeImages();
        clearStickers();
        const markerArea = new markerjs2.MarkerArea(imgRef.value);
        markerArea.availableMarkerTypes = markerArea.ALL_MARKER_TYPES;
        markerArea.uiStyleSettings.redoButtonVisible = true;
        markerArea.uiStyleSettings.zoomButtonVisible = true;
        markerArea.uiStyleSettings.zoomOutButtonVisible = true;
        markerArea.uiStyleSettings.clearButtonVisible = true;
        markerArea.settings.displayMode = 'popup';
        markerArea.settings.defaultColor = ['#000000'];

        markerArea.settings.defaultFontFamilies = ['Poetsen One', 'Indie Flower', 'Dela Gothic One', 'DynaPuff', 'Pixelify Sans', 'Gluten', 'Teko'];

        markerArea.addRenderEventListener((dataUrl) => {
            savedImages.value.push(dataUrl);
            imgRef.value.src = dataUrl;
            downloadButton.value.href = dataUrl;
        });

        imgRef.value.src = mergedImageSrc;
        downloadButton.value.href = mergedImageSrc;
        markerArea.show();
    } catch (error) {
        console.error("Merge failed", error);
    }
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        originalImageSrc = reader.result;
        imgRef.value.src = originalImageSrc;
        downloadButton.value.href = originalImageSrc;
        images.value.push({ src: originalImageSrc, alt: file.name });
        emit('newImage', originalImageSrc);
    };

    if (file) {
        reader.readAsDataURL(file);
    }
};

onMounted(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imagetest;
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        originalImageSrc = canvas.toDataURL('image/png');
        downloadButton.value.href = originalImageSrc;
    };
});

watch(stickers, (newStickers) => {
    console.log(`Total stickers on canvas: ${newStickers.length}`);
}, { deep: true });

watch(selectedImage, (newValue) => {
    if (newValue) {
        imgRef.value.src = newValue;
        downloadButton.value.href = newValue;
    }
});

defineExpose({ addSticker });
</script>

<template>
    <div class="flex flex-col">
        <div class="bg-Surface w-[52vw] h-auto flex items-center justify-center rounded-xl p-10 relative">
            <div class="relative">
                <img class="w-auto max-w-[48vw] h-auto min-h-[60vh] max-h-[75vh] object-fill rounded-xl" ref="imgRef"
                    :src="selectedImage || imagetest" alt="Test img" />
                <div v-for="sticker in stickers" :key="sticker.id" :style="{
                    position: 'absolute',
                    left: `${sticker.style.leftPercent}%`,
                    top: `${sticker.style.topPercent}%`,
                    width: `${sticker.style.widthPercent}%`,
                    height: `${sticker.style.heightPercent}%`,
                    transform: sticker.style.transform
                }" :data-id="sticker.id" class="sticker" @mousedown="selectSticker(sticker.id)">
                    <img :src="sticker.src" style="width: 100%; height: 100%; object-fit: contain;" />
                    <button @click="deleteSticker(sticker.id)" class="delete-btn">
                        X
                    </button>
                </div>

                <Moveable v-if="selectedSticker" class="moveable" :target="`.sticker[data-id='${selectedSticker}']`"
                    :draggable="true" :rotatable="true" :resizable="true" :origin="false" :keepRatio="true"
                    :throttleDrag="throttleDrag" :throttleResize="throttleResize"
                    :renderDirections="['nw', 'ne', 'sw', 'se']" :rotationPosition="'top'" @drag="onDrag" @resize="onResize"
                    @rotate="onRotate" />

            </div>
        </div>
        <div class="mt-5 flex items-center justify-center gap-5">
            <button v-if="showSticker" class="bg-Secondary " @click="confirmMerge">Confirm</button>
            <button v-if="showSticker" class="bg-Secondary " @click="clearStickers">Cancel</button>
            <label for="file-upload"
                class="bg-Secondary rounded-2xl w-[6vw] h-[6vh] content-center text-center hover:cursor-pointer">
                Import
            </label>
            <input id="file-upload" type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
            <button class="bg-Secondary rounded-2xl w-[6vw] h-[6vh]" @click="showMarkerArea">
                Edit
            </button>
            <a class="bg-Secondary rounded-2xl w-[6vw] h-[6vh] flex items-center justify-center" ref="downloadButton"
                :href="originalImageSrc" download="image.png">
                Download
            </a>
        </div>
    </div>
</template>

<style scoped>
.sticker {
    position: absolute;
    cursor: move;
}

.delete-btn {
    position: absolute;
    top: -30px;
    right: -20px;
    background: red;
    color: white;
    border: none;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    max-width: 40px;
    max-height: 40px;
    font-size: 12px;
    cursor: pointer;
}
</style>


// next fix
// Fix onResize more sensitive
// Sticker can't go to other gallery same with saved image