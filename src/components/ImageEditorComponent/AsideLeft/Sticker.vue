<script setup>
import { ref, defineProps, defineEmits, inject, reactive } from 'vue';

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

const onScroll = (event, category) => {
    if (expandedCategories[category]) {

        return;
    }
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

const expandedCategories = reactive({
    comic: false,
    frames: false,
    reactions: false
});

function toggleExpand(category) {
    expandedCategories[category] = !expandedCategories[category];
}
</script>
<template>
    <div class="relative flex">
        <div :class="[
            'transition-all duration-300 ease-in-out',
            'mx-auto overflow-y-auto',
            isClosing ? 'w-0' : 'w-[20vw]',
            props.showCloseButton ?
                'bg-Secondary h-screen' :
                'bg-Background my-4 rounded-xl shadow-[0_-1px_40px_-15px] shadow-slate-800/50 h-[95vh]'
        ]">
            <div v-for="(category, index) in Object.keys(images)" :key="index" class="p-[1.5vh] space-y-[1vh] relative">
                <div class="flex space-x-5">
                    <h2 class="text-[2.5vh] font-semibold text-gray-800">
                        {{ category.toUpperCase() }}
                    </h2>
                    <button @click="toggleExpand(category)"
                        class="bg-blue-500 text-white px-1 py-1 text-xs rounded-full shadow-md hover:bg-blue-600 transition-colors duration-300">
                        {{ expandedCategories[category] ? 'Collapse' : 'Expand' }}
                    </button>
                </div>
                <div :class="[
                    expandedCategories[category] ? 'grid grid-cols-2 gap-4' : 'flex items-center space-x-[1vw]',
                    'py-[1vh] transition-all duration-300',
                    expandedCategories[category] ? 'overflow-y-auto' : 'overflow-x-auto'
                ]" @wheel="(event) => onScroll(event, category)">
                    <div v-for="(img, imgIndex) in images[category]" :key="imgIndex"
                        class="flex justify-center items-center flex-shrink-0 transition-transform duration-300 ease-in-out hover:scale-110 hover:brightness-125 ">
                        <img :class="[
                            expandedCategories[category] ? 'w-full h-auto' : 'w-[5vw] h-[5vw] max-w-[72px] max-h-[72px]',
                            'rounded-md object-fill cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300'
                        ]" :src="img.src" :alt="img.alt" @click="onStickerClick(img.src)" loading="lazy" />
                    </div>
                </div>
            </div>
        </div>
        <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 translate-x-4"
            enter-to-class="opacity-100 translate-x-0" leave-active-class="transition ease-in duration-300"
            leave-from-class="opacity-100 translate-x-0" leave-to-class="opacity-0 translate-x-14">
            <button v-if="props.showCloseButton"
                class="absolute top-[2vh] right-0 p-[1vh] bg-white rounded-l-md shadow-md hover:bg-gray-100 transition-colors duration-300"
                @click="clicked">
                <svg class="w-[2.5vh] h-[2.5vh] text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
            </button>
        </transition>
    </div>
</template>

<style scoped>
.bg-Secondary {
    background-color: #eaddcf;
}

div::-webkit-scrollbar {
    width: 0.5vh;
    height: 0.5vh;
}

div::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 1vh;
}

div::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 1vh;
}

div::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}
</style>

// fix ui Expand and Collapse

// add more sticker
// user can upload own sticker