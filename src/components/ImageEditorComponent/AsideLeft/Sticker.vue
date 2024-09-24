<script setup>
import { ref, defineProps, defineEmits, inject } from 'vue';

function getImageUrl(folder, name) {
    return new URL(`../../../assets/Images/sticker/${folder}/${name}.png`, import.meta.url).href;
}

const stickerCategories = {
    comic: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    frames: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    reactions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16']
};

const images = ref({
    comic: stickerCategories.comic.map(name => ({
        src: getImageUrl('Comic Stickers', name),
        alt: `Comic Stickers ${name}`
    })),
    frames: stickerCategories.frames.map(name => ({
        src: getImageUrl('Sticker Frames', name),
        alt: `Sticker Frames ${name}`
    })),
    reactions: stickerCategories.reactions.map(name => ({
        src: getImageUrl('Reaction Stickers', name),
        alt: `Reaction Stickers ${name}`
    }))
});

const handleStickerSelected = inject('handleStickerSelected');

const onStickerClick = (stickerSrc) => {
    handleStickerSelected(stickerSrc);
};

const onScroll = (event) => {
    event.preventDefault();
    const scrollContainer = event.currentTarget;
    scrollContainer.scrollLeft += event.deltaY;
};


const props = defineProps({
    showCloseButton: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['close']);
const isClosing = ref(false);

function clicked() {
    isClosing.value = true;
    setTimeout(() => {
        emit('close');
    }, 200);
}
</script>

<template>
    <div class="relative flex">
        <div :class="[
            'transition-all duration-300 ease-in-out',
            'mx-auto',
            isClosing ? 'w-0' : 'w-[20vw]',
            props.showCloseButton ?
                'bg-Secondary h-screen' :
                'bg-Background my-4 rounded-xl shadow-[0_-1px_40px_-15px] shadow-slate-800/50 h-[95vh]'
        ]">
            <div v-for="(category, index) in Object.keys(images)" :key="index"
                class="whitespace-nowrap overflow-hidden px-4">
                <label>{{ category.toUpperCase() }}</label>
                <!---NEED UPDATE LABEl BG STICKER ADD MORE FOLDER FOUND RIGHT COLOR AND FONT .. ADD LEFT RIGHT BUTTON???-->
                <div class="bg-gradient-to-r from-[#ffa2cb] to-[#16A6D4] backdrop-blur-lg bg-opacity-30 to min-h-[18vh] w-full overflow-x-hidden flex items-center justify-start rounded-xl"
                    @wheel="onScroll">
                    <div v-for="(img, imgIndex) in images[category]" :key="imgIndex" class="object-fill ml-4 mr-2">
                        <img class="rounded-xl max-w-[6vw] cursor-pointer hover:opacity-60 transition-opacity duration-200"
                            :src="img.src" :alt="img.alt" @click="onStickerClick(img.src)" />
                    </div>
                </div>
            </div>
        </div>
        <div v-if="props.showCloseButton" :class="[
            'absolute top-4 transition-all duration-300 ease-in-out',
            isClosing ? 'right-[calc(100%-3vw)]' : 'right-0'
        ]">
            <button class="cursor-pointer p-1 bg-Background rounded-l-xl hover:bg-Main" @click="clicked">
                <svg class="icon-svg" width="2vw" height="4vh" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 8L10 12L14 16" stroke="#200E32" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.icon-svg {
    transition: stroke 0.3s ease;
}

button:hover .icon-svg path {
    stroke: #f25042;
}
</style>
