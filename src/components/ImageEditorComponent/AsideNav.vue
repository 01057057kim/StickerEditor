<script setup>
import { ref, inject } from 'vue';
import Sticker from './AsideLeft/Sticker.vue';
import ImageLibary from './AsideLeft/Image.vue';
import Saved from './AsideLeft/Saved.vue';

const showSticker = ref(false);
const showImageLibrary = ref(false);
const showSaved = ref(false);
const hover = ref(null);
const bgClass = ref('bg-Background');
const selectedImage = inject("selectedImage")
const emit = defineEmits(["selectedImage"]);
const handleImageSelected = inject('handleImageSelected');

const onImageSelect = (img) => {
    handleImageSelected(img);
};

function clicked(type) {
    if (type === 'sticker') {
        showSticker.value = true;
        showImageLibrary.value = false;
        showSaved.value = false;
    } else if (type === 'image') {
        showSticker.value = false;
        showImageLibrary.value = true;
        showSaved.value = false;
    } else if (type === 'saved') {
        showSticker.value = false;
        showImageLibrary.value = false;
        showSaved.value = true;
    }
    updateBgClass();
    const popupWidth = 300;
    emit('popup-toggled', showSticker.value || showImageLibrary.value || showSaved.value, popupWidth);
}

function mouseEnter(type) {
    if (!showSticker.value && !showImageLibrary.value && !showSaved.value) {
        hover.value = type;
    }
}

function mouseLeave() {
    hover.value = null;
}

function close(type) {
    if (type === 'sticker') {
        showSticker.value = false;
    } else if (type === 'image') {
        showImageLibrary.value = false;
    } else if (type === 'saved') {
        showSaved.value = false;
    }
    updateBgClass();
    emit('popup-toggled', false, 0);
}

function updateBgClass() {
    bgClass.value = showSticker.value || showImageLibrary.value || showSaved.value ? 'bg-Background' : 'bg-Background';
}
</script>

<template>
    <div :class="[bgClass, 'min-h-screen w-[5vw] flex flex-row fixed']">
        <ul class="w-full h-screen flex-col justify-center items-center pt-10">
            <!-- Sticker component -->
            <li class="text-center flex flex-col justify-center items-center">
                <div :class="[
                    showSticker ? 'bg-Secondary' : 'bg-transparent',
                    'group flex flex-col justify-center items-center pt-4 pb-1 cursor-pointer relative w-full transition-all duration-300 ease-in-out'
                ]" @click="clicked('sticker')" @mouseenter="mouseEnter('sticker')" @mouseleave="mouseLeave">
                    <button :class="[
                        'transition-all duration-300 ease-in-out',
                        'p-1 flex justify-center items-center',
                        (hover === 'sticker' && !showSticker) ?
                            'bg-Background hover:bg-Tertiary rounded-xl shadow-[0_0px_10px_-1px] shadow-slate-800 transform scale-110' :
                            'bg-transparent',
                        showSticker ?
                            'bg-Tertiary rounded-xl shadow-[0_1px_10px_-1px] shadow-slate-800 transform scale-110' : ''
                    ]">
                        <svg width="2vw" height="4vh" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 16C9.85038 16.6303 10.8846 17 12 17C13.1154 17 14.1496 16.6303 15 16"
                                stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                            <ellipse cx="15" cy="10.5" rx="1" ry="1.5" fill="#1C274C" />
                            <ellipse cx="9" cy="10.5" rx="1" ry="1.5" fill="#1C274C" />
                            <path
                                d="M15 22H12C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8M15 22C18.866 22 22 18.866 22 15M15 22C15 20.1387 15 19.2081 15.2447 18.4549C15.7393 16.9327 16.9327 15.7393 18.4549 15.2447C19.2081 15 20.1387 15 22 15M22 12V15"
                                stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                    </button>
                    <span class="mt-1 transition-all duration-300 ease-in-out"
                        :class="{ 'opacity-100': hover === 'sticker' || showSticker, 'opacity-0': hover !== 'sticker' && !showSticker }">
                        Sticker
                    </span>
                </div>
            </li>

            <!-- ImageLibrary component -->
            <li class="text-center flex flex-col justify-center items-center">
                <div :class="[
                    showImageLibrary ? 'bg-Secondary' : 'bg-transparent',
                    'group flex flex-col justify-center items-center pt-4 pb-1 cursor-pointer relative w-full transition-all duration-300 ease-in-out'
                ]" @click="clicked('image')" @mouseenter="mouseEnter('image')" @mouseleave="mouseLeave">
                    <button :class="[
                        'transition-all duration-300 ease-in-out',
                        'p-1 flex justify-center items-center',
                        (hover === 'image' && !showImageLibrary) ?
                            'bg-Background hover:bg-Tertiary rounded-xl shadow-[0_0px_10px_-1px] shadow-slate-800 transform scale-110' :
                            'bg-transparent',
                        showImageLibrary ?
                            'bg-Tertiary rounded-xl shadow-[0_1px_10px_-1px] shadow-slate-800 transform scale-110' : ''
                    ]">
                        <svg width="2vw" height="4vh" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="8" r="2" stroke="#1C274C" stroke-width="1.5" />
                            <path
                                d="M5 13.307L5.81051 12.5542C6.73658 11.6941 8.18321 11.7424 9.04988 12.6623L11.6974 15.4727C12.2356 16.0439 13.1166 16.1209 13.7457 15.6516C14.6522 14.9753 15.9144 15.0522 16.7322 15.8334L19 18"
                                stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                            <path
                                d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8"
                                stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                    </button>
                    <span class="mt-1 transition-all duration-300 ease-in-out"
                        :class="{ 'opacity-100': hover === 'image' || showImageLibrary, 'opacity-0': hover !== 'image' && !showImageLibrary }">
                        Image
                    </span>
                </div>
            </li>

            <!-- Saved component -->
            <li class="text-center flex flex-col justify-center items-center">
                <div :class="[
                    showSaved ? 'bg-Secondary' : 'bg-transparent',
                    'group flex flex-col justify-center items-center pt-4 pb-1 cursor-pointer relative w-full transition-all duration-300 ease-in-out'
                ]" @click="clicked('saved')" @mouseenter="mouseEnter('saved')" @mouseleave="mouseLeave">
                    <button :class="[
                        'transition-all duration-300 ease-in-out',
                        'p-1 flex justify-center items-center',
                        (hover === 'saved' && !showSaved) ?
                            'bg-Background hover:bg-Tertiary rounded-xl shadow-[0_0px_10px_-1px] shadow-slate-800 transform scale-110' :
                            'bg-transparent',
                        showSaved ?
                            'bg-Tertiary rounded-xl shadow-[0_1px_10px_-1px] shadow-slate-800 transform scale-110' : ''
                    ]">
                        <svg width="2vw" height="4vh" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.5 14.4L10.9286 16L14.5 12" stroke="#1C274C" stroke-width="1.5"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <path
                                d="M2 11.9997C2 7.28562 2 4.9286 3.46447 3.46413C4.70529 2.22331 6.58687 2.03382 10 2.00488M22 11.9997C22 7.28562 22 4.9286 20.5355 3.46413C19.2947 2.22331 17.4131 2.03382 14 2.00488"
                                stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                            <path
                                d="M10 22C7.19974 22 5.79961 22 4.73005 21.455C3.78924 20.9757 3.02433 20.2108 2.54497 19.27C2 18.2004 2 16.8003 2 14C2 11.1997 2 9.79961 2.54497 8.73005C3.02433 7.78924 3.78924 7.02433 4.73005 6.54497C5.79961 6 7.19974 6 10 6H14C16.8003 6 18.2004 6 19.27 6.54497C20.2108 7.02433 20.9757 7.78924 21.455 8.73005C22 9.79961 22 11.1997 22 14C22 16.8003 22 18.2004 21.455 19.27C20.9757 20.2108 20.2108 20.9757 19.27 21.455C18.2004 22 16.8003 22 14 22"
                                stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                    </button>
                    <span class="mt-1 transition-all duration-300 ease-in-out"
                        :class="{ 'opacity-100': hover === 'saved' || showSaved, 'opacity-0': hover !== 'saved' && !showSaved }">
                        Saved
                    </span>
                </div>
            </li>

            <!-- Info component -->
            <li class="text-center flex flex-col justify-center items-center">
                <div class="group flex flex-col justify-center items-center pt-4 pb-1 cursor-pointer relative w-full"
                    @click="clicked('info')" @mouseenter="mouseEnter('info')" @mouseleave="mouseLeave">
                    <button :class="[
                        'transition-all duration-300 ease-in-out',
                        'p-1 flex justify-center items-center',
                        hover === 'info' ?
                            'bg-Background hover:bg-Tertiary rounded-xl shadow-[0_1px_10px_-1px] shadow-slate-800 transform scale-110' :
                            'bg-transparent hover:bg-Tertiary hover:rounded-xl'
                    ]">
                        <svg width="2vw" height="4vh" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 17V11" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                            <circle cx="1" cy="1" r="1" transform="matrix(1 0 0 -1 11 9)" fill="#1C274C" />
                            <path
                                d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8"
                                stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                    </button>
                    <span class="mt-1 transition-all duration-300 ease-in-out"
                        :class="{ 'opacity-100': hover === 'info', 'opacity-0': hover !== 'info' }">
                        Info
                    </span>
                </div>
            </li>
        </ul>

        <!-- Sticker component -->
        <transition name="slide-fade">
            <div v-if="(showSticker || (hover === 'sticker' && !showSticker && !showImageLibrary && !showSaved))"
                class="absolute left-[5vw] top-0" @mouseenter="mouseEnter('sticker')" @mouseleave="mouseLeave"
                @click="clicked('sticker')">
                <Sticker :showCloseButton="showSticker" @close="() => close('sticker')" />
            </div>
        </transition>

        <!-- ImageLibrary component -->
        <transition name="slide-fade">
            <div v-if="(showImageLibrary || (hover === 'image' && !showSticker && !showImageLibrary && !showSaved))"
                class="absolute left-[5vw] top-0" @mouseenter="mouseEnter('image')" @mouseleave="mouseLeave"
                @click="clicked('image')">
                <ImageLibary @selectImage="onImageSelect" :showCloseButton="showImageLibrary" @close="() => close('image')"
                    @select-image="selectedImage = $event" />
            </div>
        </transition>

        <!-- Saved component -->
        <transition name="slide-fade">
            <div v-if="(showSaved || (hover === 'saved' && !showSticker && !showImageLibrary && !showSaved))"
                class="absolute left-[5vw] top-0" @mouseenter="mouseEnter('saved')" @mouseleave="mouseLeave"
                @click="clicked('saved')">
                <Saved :showCloseButton="showSaved" @close="() => close('saved')" @select-image="selectedImage = $event" />
            </div>
        </transition>
    </div>
</template>
