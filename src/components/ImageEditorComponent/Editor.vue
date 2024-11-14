<script setup>
import { ref, onMounted, inject, watch, nextTick, computed } from 'vue';
import * as markerjs2 from 'markerjs2';
import Moveable from "vue3-moveable";
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
const emit = defineEmits(['newImage', 'savedImage']);

const saveImage = async () => {
    const dataUrl = await mergeImages();
    emit('savedImage', dataUrl);
    savedImages.value.push(dataUrl);
    localStorage.setItem('savedImages', JSON.stringify(savedImages.value));
};

onMounted(() => {
    const savedImagesFromLocal = JSON.parse(localStorage.getItem('savedImages')) || [];
    savedImages.value = savedImagesFromLocal;
});

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
        const originalWidth = imgRef.value.naturalWidth;
        const originalHeight = imgRef.value.naturalHeight;
        console.log("Original Image Dimensions:", originalWidth, "x", originalHeight);

        const mergedImageSrc = await mergeImages();
        clearStickers();

        const mergedWidth = imgRef.value.width;
        const mergedHeight = imgRef.value.height;
        console.log("After Merge Image Dimensions:", mergedWidth, "x", mergedHeight);

        const markerArea = new markerjs2.MarkerArea(imgRef.value);
        markerArea.availableMarkerTypes = markerArea.ALL_MARKER_TYPES;
        markerArea.uiStyleSettings.redoButtonVisible = true;
        markerArea.uiStyleSettings.zoomButtonVisible = true;
        markerArea.uiStyleSettings.zoomOutButtonVisible = true;
        markerArea.uiStyleSettings.clearButtonVisible = true;
        markerArea.settings.defaultCaptionText = 'New Text';
        markerArea.settings.displayMode = 'popup';
        markerArea.settings.defaultStrokeWidths = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        markerArea.settings.defaultColor = ['#000000'];
        markerArea.settings.defaultColorSet = [
            '#FFFFFF', '#000000',
            '#FF6666', '#FFB366', '#FFFF99', '#B3FF66', '#66FF66', '#99FFCC', '#99FFFF', '#80BFFF', '#6666FF', '#B366FF', '#FF66FF', '#FF80B2', // Light colors
            '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80', '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080', // Main colors
            '#B20000', '#CC6600', '#B2B200', '#66CC00', '#009900', '#00CC66', '#009999', '#0066CC', '#0000B2', '#6600CC', '#B200B2', '#CC0066'  // Dark colors
        ];

        //CUSTOM FONT HERE 5000line 
        markerArea.show();
        markerArea.addRenderEventListener((dataUrl) => {
            savedImages.value.push(dataUrl);
            localStorage.setItem('savedImages', JSON.stringify(savedImages.value));
            imgRef.value.src = dataUrl;
            downloadButton.value.href = dataUrl;

        });
        imgRef.value.src = mergedImageSrc;
        downloadButton.value.href = mergedImageSrc;

    } catch (error) {
        console.error("Merge failed", error);
    }
};

onMounted(() => {
    selectedImage.value = images.value[0].src;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
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
const clearLocalStorage = () => {
    localStorage.clear();
    savedImages.value = [];
};
defineExpose({ addSticker, clearStickers });
</script>

<template>
    <div class="flex flex-col items-center justify-center min-h-screen">
        <div class="bg-white shadow-2xl rounded-3xl p-8 transition-all duration-300 image-editor">
            <div class="relative group">
                <img class="w-auto min-w-[30vw] max-w-[60vw] h-auto max-h-[75vh] object-cover rounded-2xl" ref="imgRef"
                    :src="selectedImage" alt="Selected image" />
                <div v-for="sticker in stickers" :key="sticker.id" :style="{
                    position: 'absolute',
                    left: `${sticker.style.leftPercent}%`,
                    top: `${sticker.style.topPercent}%`,
                    width: `${sticker.style.widthPercent}%`,
                    height: `${sticker.style.heightPercent}%`,
                    transform: sticker.style.transform
                }" :data-id="sticker.id" class="sticker" @mousedown="selectSticker(sticker.id)">
                    <img :src="sticker.src" class="w-full h-full object-cover" />
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
            <button @click="showMarkerArea" class="button edit-button">
                <span class="button__text">Edit</span>
                <span class="button__icon">
                    <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M13.2535 19.4243C12.9606 19.1314 12.4857 19.1314 12.1928 19.4243C11.8999 19.7172 11.8999 20.1921 12.1928 20.485L13.2535 19.4243ZM15.6157 22V21.25V22ZM4.04537 5.49167L4.5757 6.022H4.5757L4.04537 5.49167ZM3.51504 11.8072C3.80794 12.1001 4.28281 12.1001 4.5757 11.8072C4.8686 11.5143 4.8686 11.0394 4.5757 10.7465L3.51504 11.8072ZM11.2769 4.04537L11.8072 4.5757C11.9478 4.43505 12.0269 4.24428 12.0269 4.04537C12.0269 3.84646 11.9478 3.65569 11.8072 3.51504L11.2769 4.04537ZM5.49167 4.04537L4.96134 3.51504L4.96134 3.51504L5.49167 4.04537ZM19.9546 12.7231L20.485 12.1928C20.3443 12.0522 20.1535 11.9731 19.9546 11.9731C19.7557 11.9731 19.565 12.0522 19.4243 12.1928L19.9546 12.7231ZM22 15.6157H22.75H22ZM8.33603 5.92553C8.04314 6.21843 8.04314 6.6933 8.33603 6.98619C8.62892 7.27909 9.1038 7.27909 9.39669 6.98619L8.33603 5.92553ZM17.0138 14.6033C16.7209 14.8962 16.7209 15.3711 17.0138 15.664C17.3067 15.9569 17.7816 15.9569 18.0745 15.664L17.0138 14.6033ZM18.4868 21.0343C18.7819 20.7435 18.7854 20.2687 18.4947 19.9736C18.204 19.6786 17.7291 19.675 17.4341 19.9657L18.4868 21.0343ZM19.9274 17.473C19.6363 17.7677 19.6393 18.2426 19.934 18.5336C20.2287 18.8247 20.7036 18.8217 20.9946 18.527L19.9274 17.473ZM4.96134 3.51504L3.51504 4.96134L4.5757 6.022L6.022 4.5757L4.96134 3.51504ZM12.1928 20.485C12.8596 21.1518 13.4119 21.7063 13.9081 22.0849C14.4217 22.4767 14.9622 22.75 15.6157 22.75V21.25C15.422 21.25 15.1981 21.1824 14.818 20.8924C14.4206 20.5892 13.9503 20.1211 13.2535 19.4243L12.1928 20.485ZM3.51504 4.96134C2.84824 5.62814 2.29367 6.18046 1.91508 6.67666C1.52328 7.19018 1.25 7.73073 1.25 8.38426H2.75C2.75 8.19057 2.81761 7.96662 3.10761 7.58654C3.41081 7.18914 3.87892 6.71878 4.5757 6.022L3.51504 4.96134ZM4.5757 10.7465C3.87892 10.0497 3.41081 9.57937 3.10761 9.18198C2.81761 8.8019 2.75 8.57795 2.75 8.38426H1.25C1.25 9.03779 1.52328 9.57835 1.91508 10.0919C2.29367 10.5881 2.84824 11.1404 3.51504 11.8072L4.5757 10.7465ZM11.8072 3.51504C11.1404 2.84824 10.5881 2.29367 10.0919 1.91508C9.57835 1.52328 9.03779 1.25 8.38426 1.25V2.75C8.57795 2.75 8.8019 2.81761 9.18199 3.10761C9.57938 3.41081 10.0497 3.87892 10.7465 4.5757L11.8072 3.51504ZM6.022 4.5757C6.71878 3.87892 7.18914 3.41081 7.58654 3.10761C7.96662 2.81762 8.19057 2.75 8.38426 2.75V1.25C7.73073 1.25 7.19018 1.52328 6.67666 1.91508C6.18046 2.29367 5.62814 2.84824 4.96134 3.51504L6.022 4.5757ZM19.4243 13.2535C20.1211 13.9503 20.5892 14.4206 20.8924 14.818C21.1824 15.1981 21.25 15.422 21.25 15.6157H22.75C22.75 14.9622 22.4767 14.4217 22.0849 13.9081C21.7063 13.4119 21.1518 12.8596 20.485 12.1928L19.4243 13.2535ZM10.7465 3.51504L8.33603 5.92553L9.39669 6.98619L11.8072 4.5757L10.7465 3.51504ZM19.4243 12.1928L17.0138 14.6033L18.0745 15.664L20.485 13.2535L19.4243 12.1928ZM17.4341 19.9657C16.9239 20.4684 16.5635 20.7975 16.2586 21.0043C15.9715 21.199 15.784 21.25 15.6157 21.25V22.75C16.173 22.75 16.6504 22.551 17.1005 22.2457C17.5329 21.9525 17.982 21.5316 18.4868 21.0343L17.4341 19.9657ZM20.9946 18.527C21.504 18.0112 21.9345 17.5549 22.2339 17.1178C22.5457 16.6628 22.75 16.1805 22.75 15.6157H21.25C21.25 15.7859 21.1978 15.9762 20.9966 16.2699C20.783 16.5815 20.4439 16.9499 19.9274 17.473L20.9946 18.527Z"
                            fill="#1C274C" />
                        <path
                            d="M14.3601 4.07866L15.2869 3.15178C16.8226 1.61607 19.3125 1.61607 20.8482 3.15178C22.3839 4.68748 22.3839 7.17735 20.8482 8.71306L19.9213 9.63993M14.3601 4.07866C14.3601 4.07866 14.4759 6.04828 16.2138 7.78618C17.9517 9.52407 19.9213 9.63993 19.9213 9.63993M14.3601 4.07866L12 6.43872M19.9213 9.63993L14.6607 14.9006L11.5613 18L11.4001 18.1612C10.8229 18.7383 10.5344 19.0269 10.2162 19.2751C9.84082 19.5679 9.43469 19.8189 9.00498 20.0237C8.6407 20.1973 8.25352 20.3263 7.47918 20.5844L4.19792 21.6782M4.19792 21.6782L3.39584 21.9456C3.01478 22.0726 2.59466 21.9734 2.31063 21.6894C2.0266 21.4053 1.92743 20.9852 2.05445 20.6042L2.32181 19.8021M4.19792 21.6782L2.32181 19.8021M2.32181 19.8021L3.41556 16.5208C3.67368 15.7465 3.80273 15.3593 3.97634 14.995C4.18114 14.5653 4.43213 14.1592 4.7249 13.7838C4.97308 13.4656 5.26166 13.1771 5.83882 12.5999L8.5 9.93872"
                            stroke="#1C274C" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </span>
            </button>
            <button @click="saveImage" class="button save-button">
                <span class="button__text">Save</span>
                <span class="button__icon">
                    <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M18.1716 1C18.702 1 19.2107 1.21071 19.5858 1.58579L22.4142 4.41421C22.7893 4.78929 23 5.29799 23 5.82843V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H18.1716ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21L5 21L5 15C5 13.3431 6.34315 12 8 12L16 12C17.6569 12 19 13.3431 19 15V21H20C20.5523 21 21 20.5523 21 20V6.82843C21 6.29799 20.7893 5.78929 20.4142 5.41421L18.5858 3.58579C18.2107 3.21071 17.702 3 17.1716 3H17V5C17 6.65685 15.6569 8 14 8H10C8.34315 8 7 6.65685 7 5V3H4ZM17 21V15C17 14.4477 16.5523 14 16 14L8 14C7.44772 14 7 14.4477 7 15L7 21L17 21ZM9 3H15V5C15 5.55228 14.5523 6 14 6H10C9.44772 6 9 5.55228 9 5V3Z"
                            fill="#0F0F0F" />
                    </svg>
                </span>
            </button>
            <a ref="downloadButton" :href="originalImageSrc" download="image.png" class="button download-button">
                <span class="button__text">Download</span>
                <span class="button__icon"><svg width="25px" height="25px" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625" stroke="#1C274C" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                        <path
                            d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487"
                            stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </span>
            </a>
            <button @click="clearLocalStorage">Clear Local Storage</button>
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

.button {
    --main-focus: #2d8cf0;
    --font-color: #323232;
    --bg-color-sub: #dedede;
    --bg-color: #eee;
    --main-color: #323232;
    position: relative;
    width: 150px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    background-color: var(--bg-color);
    border-radius: 10px;
    overflow: hidden;
}

.button,
.button__icon,
.button__text {
    transition: all 0.3s;
}

.button .button__text {
    transform: translateX(22px);
    color: var(--font-color);
    font-weight: 600;
}

.button .button__icon {
    position: absolute;
    transform: translateX(109px);
    height: 100%;
    width: 39px;
    background-color: var(--bg-color-sub);
    display: flex;
    align-items: center;
    justify-content: center;
}

.button .svg {
    width: 20px;
    fill: var(--main-color);
}

.button:hover {
    background: var(--bg-color);
}

.button:hover .button__text {
    color: transparent;
}

.button:hover .button__icon {
    width: 148px;
    transform: translateX(0);
}

.button:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px var(--main-color);
}
</style>


FONTS
// Bangers, Gloria Hallelujah, Rock Salt, Freckle Face, Caveat, Chewy, 
中文
// Ma Shan Zheng, Liu Jian Mao Cao, ZCOOL KuaiLe, Rampart One, DotGothic16, Zen Kurenaido, Yuji Syuku

////////////////////////////////////////
download button all on save image to zip file + if can select image want to download * 

change on resize to scaleable if needed

save image local storage done but there a limit for image put on local storage 5MB. note i want place alert or popup if the local storage full *

test image.vue to save to local storage and load again to img done

font    *

responsive  *

image after merge become smaller resolution. note mergeImages function or after merge become blur   *