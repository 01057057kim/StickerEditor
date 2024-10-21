<script setup>
import { ref, onMounted, inject, watch, nextTick, computed } from 'vue';
import * as markerjs2 from 'markerjs2';
import Moveable from "vue3-moveable";
import imagetest from '../../assets/Images/testimg.jpg';
import keycon from "keycon";

keycon.setGlobal();

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
const props = defineProps(['selectedImage']);
const emit = defineEmits(['newImage']);

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
    const img = new Image();
    img.onload = () => {
        const imgRect = imgRef.value.getBoundingClientRect();

        const aspectRatio = img.width / img.height;
        const defaultWidth = 150;
        const defaultHeight = defaultWidth / aspectRatio;

        const newSticker = {
            id: Date.now(),
            src: stickerSrc,
            originalWidth: img.width,
            originalHeight: img.height,
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
    img.src = stickerSrc;
};

const onResizeStart = e => {
    e.setFixedDirection([0, 0]);
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

const onBeforeResize = e => {
    if (keycon.global.shiftKey) {
        e.setFixedDirection([-1, -1]);
    } else {
        e.setFixedDirection([0, 0]);
    }
};

const onResize = ({ target, width, height, drag }) => {
    const sticker = stickers.value.find(s => s.id === parseInt(target.dataset.id));
    if (sticker && imgRef.value) {
        const imgRect = imgRef.value.getBoundingClientRect();
        const aspectRatio = sticker.originalWidth / sticker.originalHeight;

        let newWidth = width;
        let newHeight = height;

        if (width / height > aspectRatio) {
            newWidth = height * aspectRatio;
        } else {
            newHeight = width / aspectRatio;
        }

        const widthPercent = (newWidth / imgRect.width) * 100;
        const heightPercent = (newHeight / imgRect.height) * 100;

        sticker.style.widthPercent = widthPercent;
        sticker.style.heightPercent = heightPercent;
    }
    target.style.cssText += `width: ${width}px; height: ${height}px`;
    target.style.transform = drag.transform;
};

const onRotate = ({ target, rotate, transform }) => {
    const sticker = stickers.value.find(s => s.id === parseInt(target.dataset.id));
    if (sticker) {
        const currentTransform = sticker.style.transform;
        const scaleMatch = currentTransform.match(/scale\(([-\d.]+),\s*([-\d.]+)\)/);
        const scaleX = scaleMatch ? scaleMatch[1] : '1';
        const scaleY = scaleMatch ? scaleMatch[2] : '1';

        sticker.style.transform = `translate(-50%, -50%) rotate(${rotate}deg) scale(${scaleX}, ${scaleY})`;
    }
    target.style.transform = transform;
};

const onScaleStart = e => {
    e.setFixedDirection([0, 0]);
};

const onBeforeScale = e => {
    if (keycon.global.shiftKey) {
        e.setFixedDirection([-1, -1]);
    } else {
        e.setFixedDirection([0, 0]);
    }
};

const onScale = ({ target, drag }) => {
    target.style.transform = drag.transform;
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

                        ctx.save();
                        ctx.translate(leftPx, topPx);
                        ctx.rotate(rotation * Math.PI / 180);

                        const originalAspectRatio = stickerImg.width / stickerImg.height;

                        let newWidth = width * scaleX;
                        let newHeight = height * scaleY;

                        if (newWidth / newHeight > originalAspectRatio) {
                            newWidth = newHeight * originalAspectRatio;
                        } else {
                            newHeight = newWidth / originalAspectRatio;
                        }

                        ctx.drawImage(stickerImg, -newWidth / 2, -newHeight / 2, newWidth, newHeight);
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

watch(() => props.selectedImage, (newValue) => {
    if (newValue) {
        clearStickers();
        imgRef.value.src = newValue;
        downloadButton.value.href = newValue;
    }
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

defineExpose({ addSticker, clearStickers });
</script>

<template>
    <div class="flex flex-col items-center justify-center min-h-screen">
        <div class="bg-white shadow-2xl rounded-3xl p-8 transition-all duration-300">
            <div class="relative group">
                <img class="w-auto min-w-[30vw] max-w-[60vw] h-auto max-h-[75vh] object-contain rounded-2xl" ref="imgRef"
                    :src="selectedImage || imagetest" alt="Selected image" />
                <div v-for="sticker in stickers" :key="sticker.id" :style="{
                    position: 'absolute',
                    left: `${sticker.style.leftPercent}%`,
                    top: `${sticker.style.topPercent}%`,
                    width: `${sticker.style.widthPercent}%`,
                    height: `${sticker.style.heightPercent}%`,
                    transform: sticker.style.transform
                }" :data-id="sticker.id" class="sticker" @mousedown="selectSticker(sticker.id)">
                    <img :src="sticker.src" class="w-full h-full object-contain" />
                    <button @click="deleteSticker(sticker.id)" class="delete-btn">
                        <svg width="4vw" height="4vh" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.17065 4C9.58249 2.83481 10.6937 2 11.9999 2C13.3062 2 14.4174 2.83481 14.8292 4"
                                stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                            <path d="M20.5 6H3.49988" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                            <path
                                d="M18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5M18.8334 8.5L18.6334 11.5"
                                stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                            <path d="M9.5 11L10 16" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                            <path d="M14.5 11L14 16" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>

                <Moveable v-if="selectedSticker" class="moveable" :target="`.sticker[data-id='${selectedSticker}']`"
                    :draggable="true" :rotatable="true" :resizable="true" :scalable="true" :origin="false" :keepRatio="true"
                    :throttleDrag="throttleDrag" :throttleResize="throttleResize"
                    :renderDirections='["nw", "n", "ne", "w", "e", "sw", "s", "se"]' :rotationPosition="'top'"
                    :bounds="({ left: 0, top: 0, bottom: 0, right: 0, position: 'css' })" @resizeStart="onResizeStart"
                    @drag="onDrag" @beforeResize="onBeforeResize" @resize="onResize" @rotate="onRotate"
                    @scaleStart="onScaleStart" @beforeScale="onBeforeScale" @scale="onScale" />
            </div>
        </div>

        <div class="mt-8 flex items-center justify-center space-x-4">
            <button v-if="showSticker" @click="confirmMerge" class="btn btn-primary">Confirm</button>
            <button v-if="showSticker" @click="clearStickers" class="btn btn-secondary">Cancel</button>
            <button @click="showMarkerArea" class="btn btn-secondary">
                Edit
            </button>
            <a ref="downloadButton" :href="originalImageSrc" download="image.png" class="btn btn-primary">
                Download
            </a>
        </div>
    </div>
</template>

<style scoped>
.btn {
    @apply px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
    @apply bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500;
}

.btn-secondary {
    @apply bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500;
}


.delete-btn {
    @apply absolute -bottom-5 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-red-500 text-white rounded-full w-[2vw] h-[4vh] p-1 flex items-center justify-center transition-all duration-200 hover:bg-red-700;
}

.shadow-3xl {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>


// next fix
// Fix onResize more sensitive  ( V )

// add more font and color

// if image to height the sticker got scale down

// download button popup option?