<script setup>
import { ref, onMounted, inject, watch, nextTick } from 'vue';
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

const draggable = true;
const throttleDrag = 1;
const edgeDraggable = false;
const startDragRotate = 0;
const throttleDragRotate = 0;
const scalable = true;
const keepRatio = false;
const throttleScale = 0;
const renderDirections = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
const rotatable = true;
const throttleRotate = 0;
const rotationPosition = "top";
const scalingFactor = 0.1;

const addSticker = (stickerSrc) => {
    const imgRect = imgRef.value.getBoundingClientRect();

    const newSticker = {
        id: Date.now(),
        src: stickerSrc,
        style: {
            position: 'absolute',
            leftPercent: 50, // Centered position as percentage
            topPercent: 50,  // Centered position as percentage
            widthPercent: (100 / imgRect.width) * 100,  // Width as percentage
            heightPercent: (100 / imgRect.height) * 100, // Height as percentage
            transform: 'translate(-50%, -50%) rotate(0deg) scale(1, 1)' // Initial scale added
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

const onScale = (e) => {
    e.target.style.transform = e.drag.transform;  // Apply the scale transformation
    const sticker = stickers.value.find(s => s.id === parseInt(e.target.dataset.id));
    if (sticker) {
        const imgRect = imgRef.value.getBoundingClientRect();
        const stickerRect = e.target.getBoundingClientRect();

        // Convert the scale transformation to percentage width/height
        sticker.style.widthPercent = (stickerRect.width / imgRect.width) * 100;
        sticker.style.heightPercent = (stickerRect.height / imgRect.height) * 100;
    }
};

const onRotate = (e) => {
    e.target.style.transform = e.drag.transform;  // Apply the rotation transformation
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
        if (!imgRef.value) {
            reject(new Error("Image reference not found"));
            return;
        }

        const img = imgRef.value;
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imgWidth;
        canvas.height = imgHeight;

        const baseImage = new Image();
        baseImage.src = img.src;

        baseImage.onload = () => {
            ctx.drawImage(baseImage, 0, 0, imgWidth, imgHeight);

            const drawSticker = (sticker, callback) => {
                const stickerImage = new Image();
                stickerImage.src = sticker.src;

                stickerImage.onload = () => {
                    const stickerX = (sticker.style.leftPercent / 100) * imgWidth;
                    const stickerY = (sticker.style.topPercent / 100) * imgHeight;
                    const stickerWidth = (sticker.style.widthPercent / 100) * imgWidth;
                    const stickerHeight = (sticker.style.heightPercent / 100) * imgHeight;

                    const transform = sticker.style.transform;
                    const rotationMatch = transform.match(/rotate\((.*?)deg\)/);
                    const rotation = rotationMatch ? parseFloat(rotationMatch[1]) : 0;
                    const scaleMatch = transform.match(/scale\((.*?)\)/);
                    const scaleX = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
                    const scaleY = scaleMatch ? parseFloat(scaleMatch[1]) : 1;

                    const finalStickerWidth = stickerWidth * scaleX;
                    const finalStickerHeight = stickerHeight * scaleY;

                    ctx.save();
                    ctx.translate(stickerX, stickerY);
                    ctx.rotate((rotation * Math.PI) / 180);
                    ctx.drawImage(stickerImage, -finalStickerWidth / 2, -finalStickerHeight / 2, finalStickerWidth, finalStickerHeight);
                    ctx.restore();

                    callback();
                };
            };

            let stickersProcessed = 0;
            const totalStickers = stickers.value.length;

            if (totalStickers === 0) {
                resolve(canvas.toDataURL('image/png'));
                return;
            }

            stickers.value.forEach(sticker => {
                drawSticker(sticker, () => {
                    stickersProcessed++;
                    if (stickersProcessed === totalStickers) {
                        resolve(canvas.toDataURL('image/png'));
                    }
                });
            });
        };

        baseImage.onerror = () => {
            reject(new Error("Failed to load the base image"));
        };
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
                    <img :src="sticker.src" style="width: 100%; height: 100%; object-fit: fill;" />
                    <button @click="deleteSticker(sticker.id)" class="delete-btn">
                        X
                    </button>
                </div>
                <Moveable v-if="selectedSticker" class="moveable" :target="`.sticker[data-id='${selectedSticker}']`"
                    :draggable="true" :scalable="true" :rotatable="true" :origin="false" :keepRatio="false"
                    :throttleDrag="throttleDrag" :throttleScale="throttleScale" :throttleRotate="throttleRotate"
                    :renderDirections="['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']" :rotationPosition="'top'"
                    @drag="onDrag" @scale="onScale" @scaleStart="onScaleStart" @rotate="onRotate" />
            </div>
        </div>
        <div class="mt-5 flex items-center justify-center gap-5">
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



