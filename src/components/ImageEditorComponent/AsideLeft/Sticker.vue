<script setup>
import { ref, defineProps, defineEmits, inject } from 'vue';
import addon1 from '../../../assets/Images/sticker/add1.png';
import addon2 from '../../../assets/Images/sticker/add2.png';
import addon3 from '../../../assets/Images/sticker/add3.png';
import addon4 from '../../../assets/Images/sticker/add4.png';
import addon5 from '../../../assets/Images/sticker/add5.png';
import addon6 from '../../../assets/Images/sticker/add6.png';
import addon7 from '../../../assets/Images/sticker/add21.jpg';

let images = ref([
    { src: addon1, alt: 'add on 1' },
    { src: addon2, alt: 'add on 2' },
    { src: addon3, alt: 'add on 3' },
    { src: addon4, alt: 'add on 4' },
    { src: addon5, alt: 'add on 5' },
    { src: addon6, alt: 'add on 6' },
    { src: addon7, alt: 'add on 7' },
    { src: addon3, alt: 'add on 3' },
    { src: addon4, alt: 'add on 4' },
    { src: addon5, alt: 'add on 5' },
    { src: addon6, alt: 'add on 6' },
    { src: addon7, alt: 'add on 7' },
]);

const handleStickerSelected = inject('handleStickerSelected');

const onStickerClick = (stickerSrc) => {
    handleStickerSelected(stickerSrc);
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
    }, 300);
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
            <div class="whitespace-nowrap overflow-hidden">
                <!--------------------------------------------------------------->
                <label>STICKER</label>
                <div
                    class="bg-transparent mt-3 max-h-[95vh] w-auto overflow-y-auto grid grid-cols-2 gap-2 items-center justify-center p-5 ">
                    <div v-for="(img, index) in images" :key="index" class="object-fill flex justify-center items-center">
                        <img class=" rounded-xl max-w-[8vw] cursor-pointer hover:opacity-60 transition-opacity duration-200"
                            :src="img.src" :alt="img.alt" @click="onStickerClick(img.src)" />
                    </div>
                </div>
                <!--------------------------------------------------------------->
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

<!--box-shadow: inset | offset-x | offset-y | blur-radius | spread-radius | color-->